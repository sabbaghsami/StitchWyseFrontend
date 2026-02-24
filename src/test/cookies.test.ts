import { getCookie, sanitizeCookieName, sanitizeCookieValue, setSecureCookie } from "../lib/cookies";

function clearCookies() {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [name] = cookie.split("=");
    if (!name) {
      continue;
    }
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

describe("cookies", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("rejects invalid cookie names", () => {
    expect(() => sanitizeCookieName("session;id")).toThrow("Cookie name contains invalid characters.");
  });

  it("rejects cookie values with control characters", () => {
    expect(() => sanitizeCookieValue("hello\u0007world")).toThrow("Cookie value contains invalid characters.");
  });

  it("encodes and retrieves cookie values safely", () => {
    setSecureCookie("sidebar:state", "true;path=/", {
      secure: false,
      sameSite: "lax",
      maxAgeSeconds: 60,
    });

    expect(document.cookie).toContain("sidebar:state=true%3Bpath%3D%2F");
    expect(getCookie("sidebar:state")).toBe("true;path=/");
  });
});
