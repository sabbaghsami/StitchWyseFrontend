import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.25.0";

interface ReservationRow {
  stripe_session_id: string;
  items: Array<{ product_id: string; quantity: number }> | null;
  status: "reserved" | "completed" | "expired";
  order_id: number | null;
}

interface ProductStripeMappingRow {
  id: string;
  stripe_product_id: string;
}

interface OrderRow {
  id: number;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidatePayload = payload as Record<string, unknown>;
  const candidateValues = [
    candidatePayload.message,
    candidatePayload.error,
    candidatePayload.hint,
    candidatePayload.details,
  ];

  for (const value of candidateValues) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function getSupabaseHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    ...extra,
  };
}

async function callStockRelease(items: Array<{ product_id: string; quantity: number }>): Promise<{ ok: true } | { ok: false; message: string }> {
  if (items.length === 0) {
    return { ok: true };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/release_product_stock`, {
    method: "POST",
    headers: getSupabaseHeaders(),
    body: JSON.stringify({ p_items: items }),
  });

  if (response.ok) {
    return { ok: true };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    ok: false,
    message: getErrorMessage(payload, "Failed to release reserved stock."),
  };
}

async function fetchReservation(sessionId: string): Promise<ReservationRow | null> {
  const params = new URLSearchParams({
    select: "stripe_session_id,items,status,order_id",
    stripe_session_id: `eq.${sessionId}`,
    limit: "1",
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/checkout_stock_reservations?${params.toString()}`, {
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load checkout stock reservation.");
  }

  const rows = (await response.json()) as ReservationRow[];
  return rows[0] ?? null;
}

async function updateReservation(
  sessionId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const params = new URLSearchParams({
    stripe_session_id: `eq.${sessionId}`,
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/checkout_stock_reservations?${params.toString()}`, {
    method: "PATCH",
    headers: getSupabaseHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify({
      ...patch,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new Error(getErrorMessage(payload, "Unable to update checkout stock reservation."));
  }
}

async function listAllSessionLineItems(
  stripe: Stripe,
  sessionId: string,
): Promise<Stripe.ApiList<Stripe.LineItem>["data"]> {
  const items: Stripe.ApiList<Stripe.LineItem>["data"] = [];
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      starting_after: startingAfter,
    });

    items.push(...page.data);

    if (!page.has_more || page.data.length === 0) {
      break;
    }

    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return items;
}

async function fetchProductIdByStripeProductId(
  stripeProductIds: string[],
): Promise<Map<string, string>> {
  if (stripeProductIds.length === 0) {
    return new Map();
  }

  const params = new URLSearchParams({
    select: "id,stripe_product_id",
    stripe_product_id: `in.(${stripeProductIds.join(",")})`,
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?${params.toString()}`, {
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to map Stripe product IDs to Supabase products.");
  }

  const rows = (await response.json()) as ProductStripeMappingRow[];
  return new Map(rows.map((row) => [row.stripe_product_id, row.id]));
}

async function upsertOrder(session: Stripe.Checkout.Session): Promise<OrderRow> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?on_conflict=stripe_session_id`, {
    method: "POST",
    headers: getSupabaseHeaders({ Prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify([
      {
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        customer_email: session.customer_details?.email ?? session.customer_email ?? null,
        currency: session.currency ?? "gbp",
        amount_total: session.amount_total ?? 0,
        status: session.payment_status === "paid" ? "paid" : "pending",
        raw_session: session,
        updated_at: new Date().toISOString(),
      },
    ]),
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new Error(getErrorMessage(payload, "Unable to upsert order row."));
  }

  const rows = (await response.json()) as OrderRow[];
  const order = rows[0];
  if (!order) {
    throw new Error("Order upsert did not return a row.");
  }

  return order;
}

async function replaceOrderItems(
  orderId: number,
  lineItems: Stripe.LineItem[],
  productMap: Map<string, string>,
): Promise<void> {
  const deleteParams = new URLSearchParams({ order_id: `eq.${orderId}` });
  const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items?${deleteParams.toString()}`, {
    method: "DELETE",
    headers: getSupabaseHeaders({ Prefer: "return=minimal" }),
  });

  if (!deleteResponse.ok) {
    let payload: unknown = null;
    try {
      payload = await deleteResponse.json();
    } catch {
      payload = null;
    }
    throw new Error(getErrorMessage(payload, "Unable to clear existing order items."));
  }

  const groupedItems = new Map<string, {
    productId: string | null;
    stripeProductId: string | null;
    stripePriceId: string | null;
    description: string;
    quantity: number;
    unitAmount: number;
    currency: string;
  }>();

  for (const item of lineItems) {
    const price = item.price;
    const stripePriceId = typeof price?.id === "string" ? price.id : null;
    const stripeProductId =
      price && typeof price.product === "string" ? price.product : null;
    const quantity = item.quantity ?? 0;
    const currency = (item.currency ?? price?.currency ?? "gbp").toLowerCase();
    const unitAmount =
      item.amount_subtotal && quantity > 0
        ? Math.round(item.amount_subtotal / quantity)
        : price?.unit_amount ?? 0;

    if (!stripePriceId || !stripeProductId || quantity < 1) {
      continue;
    }

    const key = `${stripePriceId}:${stripeProductId}`;
    const existing = groupedItems.get(key);
    if (existing) {
      existing.quantity += quantity;
      continue;
    }

    groupedItems.set(key, {
      productId: productMap.get(stripeProductId) ?? null,
      stripeProductId,
      stripePriceId,
      description: item.description ?? "Stripe item",
      quantity,
      unitAmount: Math.max(0, unitAmount),
      currency,
    });
  }

  if (groupedItems.size === 0) {
    return;
  }

  const payload = [...groupedItems.values()].map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    stripe_product_id: item.stripeProductId,
    stripe_price_id: item.stripePriceId,
    description: item.description,
    quantity: item.quantity,
    unit_amount: item.unitAmount,
    currency: item.currency,
  }));

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
    method: "POST",
    headers: getSupabaseHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(payload),
  });

  if (!insertResponse.ok) {
    let payloadError: unknown = null;
    try {
      payloadError = await insertResponse.json();
    } catch {
      payloadError = null;
    }
    throw new Error(getErrorMessage(payloadError, "Unable to write order items."));
  }
}

async function handleCompletedSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const reservation = await fetchReservation(session.id);

  const lineItems = await listAllSessionLineItems(stripe, session.id);
  const stripeProductIds = [
    ...new Set(
      lineItems
        .map((item) =>
          item.price && typeof item.price.product === "string"
            ? item.price.product
            : "",
        )
        .filter(Boolean),
    ),
  ];

  const productMap = await fetchProductIdByStripeProductId(stripeProductIds);
  const order = await upsertOrder(session);
  await replaceOrderItems(order.id, lineItems, productMap);

  if (reservation && reservation.status !== "completed") {
    await updateReservation(session.id, {
      status: "completed",
      order_id: order.id,
      completed_at: new Date().toISOString(),
    });
  }
}

async function handleExpiredSession(sessionId: string): Promise<void> {
  const reservation = await fetchReservation(sessionId);
  if (!reservation) {
    return;
  }
  if (reservation.status === "expired" || reservation.status === "completed") {
    return;
  }

  const releaseResult = await callStockRelease(reservation.items ?? []);
  if (!releaseResult.ok) {
    throw new Error(releaseResult.message);
  }

  await updateReservation(sessionId, {
    status: "expired",
    released_at: new Date().toISOString(),
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(500, { error: "Supabase service credentials are not configured." });
  }
  if (!STRIPE_SECRET_KEY) {
    return jsonResponse(500, { error: "STRIPE_SECRET_KEY is not configured." });
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    return jsonResponse(500, { error: "STRIPE_WEBHOOK_SECRET is not configured." });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse(400, { error: "Missing Stripe signature header." });
  }

  const body = await request.text();
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return jsonResponse(400, { error: "Invalid webhook signature." });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCompletedSession(stripe, session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleExpiredSession(session.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed.";
    return jsonResponse(500, { error: message });
  }

  return jsonResponse(200, { received: true });
});
