import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.25.0";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequestBody {
  origin?: string;
  items?: CheckoutItem[];
}

interface ProductRow {
  id: string;
  name: string;
  active: boolean;
  stock_quantity: number;
  stripe_product_id: string | null;
}

interface StockReservationItem {
  product_id: string;
  quantity: number;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const CHECKOUT_CURRENCY = "gbp";

function normalizeOrigin(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function parseAllowedOrigins(): Set<string> {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const values = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  return new Set(values);
}

function getCorsHeaders(requestOrigin: string | null, allowedOrigins: Set<string>): HeadersInit {
  if (allowedOrigins.size === 0) {
    return {
      "Access-Control-Allow-Origin": requestOrigin ?? "*",
      "Access-Control-Allow-Headers": "authorization, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    };
  }

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    return {
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Headers": "authorization, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    };
  }

  return {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(status: number, body: Record<string, unknown>, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "content-type": "application/json",
    },
  });
}

function sanitizeProductId(value: string): string {
  return value.trim();
}

async function fetchProducts(productIds: string[]): Promise<ProductRow[]> {
  const params = new URLSearchParams({
    select: "id,name,active,stock_quantity,stripe_product_id",
    id: `in.(${productIds.join(",")})`,
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?${params.toString()}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to read products from Supabase.");
  }

  return (await response.json()) as ProductRow[];
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

async function callStockRpc(functionName: string, items: StockReservationItem[]): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
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

  const rawMessage = getErrorMessage(payload, "Unable to update stock.");
  if (rawMessage.includes("INSUFFICIENT_STOCK")) {
    return { ok: false, message: "One or more items are out of stock." };
  }
  if (rawMessage.includes("INVALID_ITEMS")) {
    return { ok: false, message: "Invalid cart items for stock reservation." };
  }

  return { ok: false, message: rawMessage };
}

Deno.serve(async (request) => {
  const requestOrigin = request.headers.get("origin");
  const allowedOrigins = parseAllowedOrigins();
  const corsHeaders = getCorsHeaders(requestOrigin, allowedOrigins);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." }, corsHeaders);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(500, { error: "Supabase service credentials are not configured." }, corsHeaders);
  }

  if (!STRIPE_SECRET_KEY) {
    return jsonResponse(500, { error: "STRIPE_SECRET_KEY is not configured." }, corsHeaders);
  }

  if (allowedOrigins.size > 0 && (!requestOrigin || !allowedOrigins.has(requestOrigin))) {
    return jsonResponse(403, { error: "Origin is not allowed." }, corsHeaders);
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." }, corsHeaders);
  }

  const originFromBody = typeof body.origin === "string" ? normalizeOrigin(body.origin) : null;
  const siteOrigin = originFromBody ?? (requestOrigin ? normalizeOrigin(requestOrigin) : null);
  if (!siteOrigin) {
    return jsonResponse(400, { error: "Invalid origin." }, corsHeaders);
  }

  if (allowedOrigins.size > 0 && !allowedOrigins.has(siteOrigin)) {
    return jsonResponse(403, { error: "Body origin is not allowed." }, corsHeaders);
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return jsonResponse(400, { error: "At least one cart item is required." }, corsHeaders);
  }

  const quantityByProduct = new Map<string, number>();
  for (const item of rawItems) {
    const productId = typeof item.productId === "string" ? sanitizeProductId(item.productId) : "";
    const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;
    if (!productId || quantity < 1 || quantity > 20) {
      return jsonResponse(400, { error: "Invalid cart item payload." }, corsHeaders);
    }

    const nextQuantity = (quantityByProduct.get(productId) ?? 0) + quantity;
    if (nextQuantity > 20) {
      return jsonResponse(400, { error: `Quantity for ${productId} exceeds the limit.` }, corsHeaders);
    }
    quantityByProduct.set(productId, nextQuantity);
  }

  const productIds = [...quantityByProduct.keys()];
  let products: ProductRow[];
  try {
    products = await fetchProducts(productIds);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch products.";
    return jsonResponse(500, { error: message }, corsHeaders);
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const stripePriceByProductId = new Map<string, string>();

  for (const productId of productIds) {
    const product = productById.get(productId);
    if (!product || !product.active) {
      return jsonResponse(400, { error: `Product ${productId} is unavailable.` }, corsHeaders);
    }

    if (!product.stripe_product_id) {
      return jsonResponse(400, { error: `Product ${product.name} is missing stripe_product_id.` }, corsHeaders);
    }
    if (!product.stripe_product_id.startsWith("prod_")) {
      return jsonResponse(400, { error: `Product ${product.name} has an invalid Stripe Product ID.` }, corsHeaders);
    }
    if (!Number.isInteger(product.stock_quantity) || product.stock_quantity < 0) {
      return jsonResponse(400, { error: `Product ${product.name} has invalid stock.` }, corsHeaders);
    }

    const requestedQuantity = quantityByProduct.get(productId) ?? 0;
    if (requestedQuantity > product.stock_quantity) {
      return jsonResponse(409, { error: `${product.name} only has ${product.stock_quantity} left in stock.` }, corsHeaders);
    }

    try {
      const prices = await stripe.prices.list({
        product: product.stripe_product_id,
        active: true,
        currency: CHECKOUT_CURRENCY,
        limit: 2,
      });

      if (prices.data.length !== 1) {
        return jsonResponse(
          400,
          { error: `Expected exactly one active ${CHECKOUT_CURRENCY.toUpperCase()} Stripe price for ${product.name}.` },
          corsHeaders,
        );
      }

      const activePrice = prices.data[0];
      stripePriceByProductId.set(product.id, activePrice.id);
    } catch {
      return jsonResponse(400, { error: `Unable to resolve Stripe price for ${product.name}.` }, corsHeaders);
    }
  }

  const lineItems = productIds.map((productId) => ({
    price: stripePriceByProductId.get(productId) ?? "",
    quantity: quantityByProduct.get(productId) ?? 1,
  }));

  const stockReservationItems: StockReservationItem[] = productIds.map((productId) => ({
    product_id: productId,
    quantity: quantityByProduct.get(productId) ?? 1,
  }));

  const reserveResult = await callStockRpc("reserve_product_stock", stockReservationItems);
  if (!reserveResult.ok) {
    return jsonResponse(409, { error: reserveResult.message }, corsHeaders);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/cart`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });

    if (!session.url) {
      await callStockRpc("release_product_stock", stockReservationItems);
      return jsonResponse(500, { error: "Stripe checkout URL was not returned." }, corsHeaders);
    }

    return jsonResponse(200, { url: session.url }, corsHeaders);
  } catch {
    await callStockRpc("release_product_stock", stockReservationItems);
    return jsonResponse(500, { error: "Failed to create Stripe checkout session." }, corsHeaders);
  }
});
