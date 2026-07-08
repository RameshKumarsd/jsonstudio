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

function resolveUrl(url: string, proxyPrefix?: string): string {
  const prefix = proxyPrefix?.trim()
  if (!prefix) return url
  if (prefix.includes('{url}'))
    return prefix.replace('{url}', encodeURIComponent(url))
  return `${prefix}${url}`
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

  if (request.auth.type === 'bearer' && request.auth.token) {
    headers.Authorization = `Bearer ${request.auth.token}`
  } else if (
    request.auth.type === 'basic' &&
    (request.auth.username || request.auth.password)
  ) {
    const credentials = `${request.auth.username ?? ''}:${request.auth.password ?? ''}`
    headers.Authorization = `Basic ${btoa(credentials)}`
  }

  const hasBody =
    request.bodyEnabled &&
    METHODS_WITH_BODY.includes(request.method) &&
    request.body.trim().length > 0

  if (
    hasBody &&
    !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')
  ) {
    headers['Content-Type'] = 'application/json'
  }

  const config: AxiosRequestConfig = {
    method: request.method,
    params: Object.fromEntries(enabledEntries(request.params)),
    headers,
    data: hasBody ? request.body : undefined,
    timeout: REQUEST_TIMEOUT_MS,
    validateStatus: () => true,
    responseType: 'text',
    transformResponse: (data: string) => data,
  }

  return { url: resolveUrl(request.url, proxyPrefix), config }
}
