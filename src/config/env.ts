const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

function validateApiBaseUrl(apiBaseUrl: string): void {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must use http or https.");
  }

  if (import.meta.env.PROD && parsedUrl.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must use https in production.");
  }
}

if (rawApiBaseUrl) {
  validateApiBaseUrl(rawApiBaseUrl);
}

export const appEnv = Object.freeze({
  apiBaseUrl: rawApiBaseUrl ?? "",
});
