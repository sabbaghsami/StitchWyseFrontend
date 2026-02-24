export type SameSiteOption = "lax" | "strict" | "none";

export interface SecureCookieOptions {
  path?: string;
  maxAgeSeconds?: number;
  sameSite?: SameSiteOption;
  secure?: boolean;
}

const VALID_COOKIE_NAME = /^[A-Za-z0-9!#$%&'*+.^_`|~:-]+$/;

function hasControlCharacters(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (typeof codePoint !== "number") {
      continue;
    }
    if ((codePoint >= 0 && codePoint <= 31) || codePoint === 127) {
      return true;
    }
  }
  return false;
}

export function sanitizeCookieName(name: string): string {
  const normalizedName = name.trim();
  if (!normalizedName || !VALID_COOKIE_NAME.test(normalizedName)) {
    throw new Error("Cookie name contains invalid characters.");
  }

  return normalizedName;
}

export function sanitizeCookieValue(value: string): string {
  if (hasControlCharacters(value)) {
    throw new Error("Cookie value contains invalid characters.");
  }

  return encodeURIComponent(value);
}

export function setSecureCookie(name: string, value: string, options: SecureCookieOptions = {}): void {
  const cookieName = sanitizeCookieName(name);
  const cookieValue = sanitizeCookieValue(value);
  const path = options.path ?? "/";
  const sameSite = options.sameSite ?? "lax";
  const secureByDefault = typeof window !== "undefined" && window.location.protocol === "https:";
  const secure = options.secure ?? secureByDefault;

  let cookie = `${cookieName}=${cookieValue}; path=${path}; samesite=${sameSite}`;

  if (typeof options.maxAgeSeconds === "number") {
    cookie += `; max-age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`;
  }

  if (sameSite === "none" || secure) {
    cookie += "; secure";
  }

  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  const cookieName = sanitizeCookieName(name);
  const key = `${cookieName}=`;
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    if (!cookie.startsWith(key)) {
      continue;
    }

    const encodedValue = cookie.slice(key.length);
    try {
      return decodeURIComponent(encodedValue);
    } catch {
      return null;
    }
  }

  return null;
}
