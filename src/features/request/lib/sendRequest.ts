import {
  httpClient,
  normalizeHttpError,
  type NormalizedHttpError,
} from '@/lib/http/axiosClient'
import { buildAxiosConfig } from '@/features/request/lib/buildAxiosConfig'
import { applyEnvironment } from '@/features/request/lib/environment'
import type {
  HttpRequest,
  HttpResponseMeta,
  KeyValueEntry,
} from '@/features/request/types'

function byteLength(text: string): number {
  if (typeof TextEncoder !== 'undefined')
    return new TextEncoder().encode(text).length
  return unescape(encodeURIComponent(text)).length
}

function isNormalizedHttpError(value: unknown): value is NormalizedHttpError {
  return typeof value === 'object' && value !== null && 'message' in value
}

const CORS_HINT =
  ' — this often means the target blocked the cross-origin request (CORS). Try setting a proxy prefix.'

/**
 * Send an HttpRequest and return response metadata. 4xx/5xx resolve here
 * (validateStatus in buildAxiosConfig) — only network/CORS failures reject.
 * The shared httpClient interceptor already normalizes thrown errors, so we
 * only re-normalize if something unexpected slips through.
 */
export async function sendRequest(
  request: HttpRequest,
  proxyPrefix?: string,
  environmentVariables?: KeyValueEntry[],
): Promise<HttpResponseMeta> {
  const resolved = environmentVariables?.length
    ? applyEnvironment(request, environmentVariables)
    : request
  const { url, config } = buildAxiosConfig(resolved, proxyPrefix)

  if (!/^https?:\/\//i.test(url.trim())) {
    throw {
      message: `"${url}" is not a valid http(s) URL — check the request URL and the CORS proxy prefix.`,
    } satisfies NormalizedHttpError
  }

  const start = performance.now()

  try {
    const response = await httpClient.request<string>({ ...config, url })
    const durationMs = performance.now() - start
    const body = response.data ?? ''

    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(response.headers ?? {})) {
      if (typeof value === 'string') headers[key] = value
    }

    return {
      status: response.status,
      statusText: response.statusText,
      durationMs,
      sizeBytes: byteLength(body),
      headers,
      body,
      contentType: headers['content-type'] ?? null,
    }
  } catch (error) {
    const normalized = isNormalizedHttpError(error)
      ? error
      : normalizeHttpError(error)
    const hint = normalized.status === undefined ? CORS_HINT : ''
    const result: NormalizedHttpError = {
      ...normalized,
      message: `${normalized.message}${hint}`,
    }
    throw result
  }
}
