import type { AxiosRequestConfig } from 'axios'
import { REQUEST_TIMEOUT_MS } from '@/config/constants'
import type { HttpRequest, KeyValueEntry } from '@/features/request/types'

export interface BuiltRequest {
  url: string
  config: AxiosRequestConfig
}

const METHODS_WITH_BODY: HttpRequest['method'][] = [
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]

function enabledEntries(entries: KeyValueEntry[]): [string, string][] {
  return entries
    .filter((entry) => entry.enabled && entry.key.trim())
    .map((entry) => [entry.key, entry.value])
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

/**
 * A proxy prefix that isn't itself a URL (e.g. stray text accidentally
 * pasted into the field) is ignored rather than concatenated — silently
 * corrupting the request into a relative path on the app's own origin is
 * far more confusing than just not proxying.
 */
function resolveUrl(url: string, proxyPrefix?: string): string {
  const prefix = proxyPrefix?.trim()
  if (!prefix || !isAbsoluteUrl(prefix)) return url
  if (prefix.includes('{url}'))
    return prefix.replace('{url}', encodeURIComponent(url))
  return `${prefix}${url}`
}

interface BuiltBody {
  data: unknown
  /** null for form-data — the browser/axios must set the multipart boundary
   * itself, which only happens when no Content-Type header is present. */
  contentType: string | null
}

/**
 * Build the outgoing body for whichever mode the request is in. Returns
 * null when there's nothing to send (raw body empty, or no enabled fields
 * in urlencoded/form-data mode) — the caller treats null the same as "no
 * body" regardless of mode.
 */
function buildBody(request: HttpRequest): BuiltBody | null {
  const mode = request.bodyMode ?? 'raw'

  if (mode === 'raw') {
    if (!request.body.trim()) return null
    return { data: request.body, contentType: 'application/json' }
  }

  const fields = enabledEntries(request.bodyFields ?? [])
  if (fields.length === 0) return null

  if (mode === 'urlencoded') {
    const data = fields
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return { data, contentType: 'application/x-www-form-urlencoded' }
  }

  const formData = new FormData()
  for (const [key, value] of fields) formData.append(key, value)
  return { data: formData, contentType: null }
}

/**
 * Pure: turn an HttpRequest into an Axios config. `validateStatus` always
 * resolves so 4xx/5xx responses come back as data (not thrown) — the
 * response viewer decides how to present them. Only real network/CORS
 * failures reject.
 */
export function buildAxiosConfig(
  request: HttpRequest,
  proxyPrefix?: string,
): BuiltRequest {
  const headers: Record<string, string> = Object.fromEntries(
    enabledEntries(request.headers),
  )
  const params: Record<string, string> = Object.fromEntries(
    enabledEntries(request.params),
  )

  if (request.auth.type === 'bearer' && request.auth.token) {
    headers.Authorization = `Bearer ${request.auth.token}`
  } else if (
    request.auth.type === 'basic' &&
    (request.auth.username || request.auth.password)
  ) {
    const credentials = `${request.auth.username ?? ''}:${request.auth.password ?? ''}`
    headers.Authorization = `Basic ${btoa(credentials)}`
  } else if (
    request.auth.type === 'apikey' &&
    request.auth.apiKeyName?.trim()
  ) {
    if (request.auth.apiKeyLocation === 'query') {
      params[request.auth.apiKeyName] = request.auth.apiKeyValue ?? ''
    } else {
      headers[request.auth.apiKeyName] = request.auth.apiKeyValue ?? ''
    }
  }

  const builtBody =
    request.bodyEnabled && METHODS_WITH_BODY.includes(request.method)
      ? buildBody(request)
      : null

  if (
    builtBody?.contentType &&
    !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')
  ) {
    headers['Content-Type'] = builtBody.contentType
  }

  const config: AxiosRequestConfig = {
    method: request.method,
    params,
    headers,
    data: builtBody?.data,
    timeout: REQUEST_TIMEOUT_MS,
    validateStatus: () => true,
    responseType: 'text',
    transformResponse: (data: string) => data,
  }

  return { url: resolveUrl(request.url, proxyPrefix), config }
}
