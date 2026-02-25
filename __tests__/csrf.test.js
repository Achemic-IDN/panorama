import { createCsrfToken, verifyCsrfToken } from "@/lib/csrf";

describe("CSRF helpers", () => {
  it("should produce a token of adequate length", () => {
    const t = createCsrfToken();
    expect(typeof t).toBe("string");
    expect(t.length).toBeGreaterThan(0);
  });

  it("verifyCsrfToken returns true when header matches cookie", () => {
    const token = "abc123";
    const req = {
      headers: { get: (k) => (k === "x-csrf-token" ? token : null) },
      cookies: { get: (k) => (k === "csrf_token" ? { value: token } : null) },
    };
    expect(verifyCsrfToken(req)).toBe(true);
  });
  it("verifyCsrfToken returns false when missing or mismatched", () => {
    const req1 = { headers: { get: () => null }, cookies: { get: () => null } };
    expect(verifyCsrfToken(req1)).toBe(false);
    const req2 = { headers: { get: () => "x" }, cookies: { get: () => ({ value: "y" }) } };
    expect(verifyCsrfToken(req2)).toBe(false);
  });
});
