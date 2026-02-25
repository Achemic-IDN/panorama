// small utility helpers used across the application

/**
 * Escape a string for safe insertion into HTML to avoid XSS.
 * Works for both React text nodes and building raw HTML.
 */
export function escapeHtml(input) {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// retrieve CSRF token from cookie
export function getCsrfToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;)\s*csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function csrfFetch(url, options = {}) {
  const token = getCsrfToken();
  const headers = { ...(options.headers || {}), 'x-csrf-token': token };
  return fetch(url, { ...options, headers });
}
