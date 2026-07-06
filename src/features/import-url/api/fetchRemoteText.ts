import { httpClient } from '@/lib/http/axiosClient'

/**
 * Fetch a remote resource as raw text (JSON or JSON Schema), preserving the
 * original formatting. Errors are normalized by the Axios interceptor.
 */
export async function fetchRemoteText(url: string): Promise<string> {
  const response = await httpClient.get<string>(url, {
    responseType: 'text',
    // Prevent Axios from JSON-parsing so we keep the source text verbatim.
    transformResponse: (data: string) => data,
  })
  return response.data
}

/** Best-effort filename from a URL path (falls back to a sensible default). */
export function filenameFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url)
    const last = pathname.split('/').filter(Boolean).pop()
    if (last) return last.endsWith('.json') ? last : `${last}.json`
  } catch {
    // ignore malformed URLs
  }
  return 'imported.json'
}
