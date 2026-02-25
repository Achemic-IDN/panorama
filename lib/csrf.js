import crypto from "crypto";

// small CSRF helper; tokens are stored in a cookie and must be echoed back
export function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCsrfToken(request) {
  const header = request.headers.get("x-csrf-token");
  const cookie = request.cookies.get("csrf_token")?.value;
  return Boolean(header && cookie && header === cookie);
}
