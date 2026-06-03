/**
 * Cloudflare Worker — proxy wss://general.exchange/ws → Fly.io WS server.
 *
 * Deploy in Cloudflare dashboard (Workers → Create) and attach route:
 *   general.exchange/ws*
 *
 * Set WS_ORIGIN secret to your Fly app URL, e.g.:
 *   https://general-exchange-ws.fly.dev
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.WS_ORIGIN || 'https://general-exchange-ws.fly.dev';
    const target = new URL(url.pathname + url.search, origin);

    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      return fetch(target.toString(), request);
    }

    if (url.pathname === '/ws' || url.pathname.startsWith('/ws/')) {
      return fetch(target.toString(), {
        method: request.method,
        headers: request.headers,
      });
    }

    return new Response('WS proxy active', { status: 200 });
  },
};
