/**
 * Reads query params without breaking the static (native) export.
 *
 * On the web build route handlers are dynamic and `request.url` is always
 * available. In the static export Next prerenders the handlers, where touching
 * `request.url` would bail out to dynamic rendering — the try/catch keeps the
 * prerender alive and simply returns empty params.
 */
export function safeSearchParams(request?: Request): URLSearchParams {
  try {
    if (!request?.url) return new URLSearchParams();
    return new URL(request.url).searchParams;
  } catch {
    return new URLSearchParams();
  }
}
