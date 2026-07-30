/**
 * Static asset worker for the Sites handoff.
 *
 * The build prerenders one HTML shell per known route, so a request for a real
 * route is served directly by ASSETS. Anything else is a genuine miss: it gets
 * the 404 shell with a 404 status rather than the homepage with a 200, so dead
 * or mistyped citation links look dead to readers, crawlers, and link checkers.
 */
const NOT_FOUND_DOCUMENT = "/404.html";

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return withSecurityHeaders(response);
    }

    const notFoundUrl = new URL(request.url);
    notFoundUrl.pathname = NOT_FOUND_DOCUMENT;
    notFoundUrl.search = "";

    const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request));
    if (!notFound.ok) return withSecurityHeaders(response);

    return withSecurityHeaders(
      new Response(notFound.body, { status: 404, headers: notFound.headers }),
    );
  },
};
