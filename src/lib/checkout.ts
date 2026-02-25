import { appEnv } from "../config/env";
import { requestJson } from "./http";
import type { CartItem } from "../context/CartContext";

interface CheckoutSessionResponse {
  url: string;
}

function getSupabaseHeaders(): HeadersInit {
  if (!appEnv.supabasePublishableKey) {
    throw new Error("Supabase publishable key is missing.");
  }

  const apiKey = appEnv.supabasePublishableKey;
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
  };
}

export async function createStripeCheckoutSession(items: CartItem[]): Promise<string> {
  if (!appEnv.supabaseUrl) {
    throw new Error("Supabase URL is missing.");
  }

  const payload = {
    origin: window.location.origin,
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    })),
  };

  const response = await requestJson<CheckoutSessionResponse>(
    `${appEnv.supabaseUrl}/functions/v1/create-checkout-session`,
    {
      method: "POST",
      headers: getSupabaseHeaders(),
      body: payload,
      retry: false,
    },
  );

  if (!response?.url) {
    throw new Error("Stripe checkout session URL was not returned.");
  }

  return response.url;
}
