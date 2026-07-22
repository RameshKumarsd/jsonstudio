interface Env {
  ASSETS: Fetcher
}

/**
 * Hosts this Worker is allowed to relay requests to. Add a host here before
 * using it as a CORS-proxy target — this is the one thing standing between
 * "a small helper for APIs JSON Studio can't call directly" and "an open
 * relay anyone on the internet can point at anything," since this Worker is
 * deployed at a public, unauthenticated URL.
 */
export const ALLOWED_PROXY_HOSTS = ['coreapi-igenie.easyngo.com']

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods':
    'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

/** Hop-by-hop / caller-identifying headers that describe the browser→Worker
 * leg, not the Worker→target leg — forwarding them as-is would be wrong
 * (wrong Origin/Referer) or leak this Worker's own network details. */
const STRIPPED_REQUEST_HEADERS = [
  'host',
  'origin',
  'referer',
  'cf-connecting-ip',
  'cf-ray',
  'cf-visitor',
  'cf-ipcountry',
  'x-forwarded-for',
  'x-real-ip',
]

export function isAllowedProxyTarget(url: URL): boolean {
  return ALLOWED_PROXY_HOSTS.includes(url.hostname)
}

export function buildForwardHeaders(requestHeaders: Headers): Headers {
  const headers = new Headers(requestHeaders)
  for (const key of STRIPPED_REQUEST_HEADERS) headers.delete(key)
  return headers
}

/**
 * A minimal CORS-relay: fetches `?url=` server-side (a Worker isn't a
 * webpage, so the browser's CORS check never applies to this leg) and
 * returns the response with permissive CORS headers attached, so the
 * browser then lets JSON Studio's own JS read it.
 */
async function handleProxy(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const target = new URL(request.url).searchParams.get('url')
  if (!target) {
    return new Response('Missing "url" query parameter', {
      status: 400,
      headers: CORS_HEADERS,
    })
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(target)
  } catch {
    return new Response('Invalid target URL', {
      status: 400,
      headers: CORS_HEADERS,
    })
  }

  if (!isAllowedProxyTarget(targetUrl)) {
    return new Response(
      `Host "${targetUrl.hostname}" is not in this proxy's allowlist. Add it to ALLOWED_PROXY_HOSTS in worker/index.ts and redeploy.`,
      { status: 403, headers: CORS_HEADERS },
    )
  }

  const upstreamResponse = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: buildForwardHeaders(request.headers),
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : request.body,
  })

  const responseHeaders = new Headers(upstreamResponse.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    responseHeaders.set(key, value)
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/proxy') {
      return handleProxy(request)
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
