const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawSupabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function validateAbsoluteHttpUrl(value: string, variableName: string): void {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`${variableName} must use http or https.`);
  }

  if (import.meta.env.PROD && parsedUrl.protocol !== "https:") {
    throw new Error(`${variableName} must use https in production.`);
  }
}

if (rawApiBaseUrl) {
  validateAbsoluteHttpUrl(rawApiBaseUrl, "VITE_API_BASE_URL");
}

if (rawSupabaseUrl) {
  validateAbsoluteHttpUrl(rawSupabaseUrl, "VITE_SUPABASE_URL");
}

const hasSupabaseUrl = Boolean(rawSupabaseUrl);
const hasSupabaseKey = Boolean(rawSupabasePublishableKey);

if (hasSupabaseUrl !== hasSupabaseKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must both be set together.");
}

export const appEnv = Object.freeze({
  apiBaseUrl: rawApiBaseUrl ?? "",
  supabaseUrl: rawSupabaseUrl ?? "",
  supabasePublishableKey: rawSupabasePublishableKey ?? "",
});
