import type { HttpRequest } from '@/features/request/types'

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

/** Pure: render a request as a copy-pasteable cURL command. */
export function toCurl(request: HttpRequest): string {
  const parts = [`curl -X ${request.method}`]

  for (const header of request.headers) {
    if (header.enabled && header.key.trim()) {
      parts.push(`-H ${shellEscape(`${header.key}: ${header.value}`)}`)
    }
  }

  if (request.auth.type === 'bearer' && request.auth.token) {
    parts.push(
      `-H ${shellEscape(`Authorization: Bearer ${request.auth.token}`)}`,
    )
  } else if (
    request.auth.type === 'basic' &&
    (request.auth.username || request.auth.password)
  ) {
    const credentials = `${request.auth.username ?? ''}:${request.auth.password ?? ''}`
    parts.push(`-u ${shellEscape(credentials)}`)
  } else if (
    request.auth.type === 'apikey' &&
    request.auth.apiKeyName?.trim() &&
    request.auth.apiKeyLocation !== 'query'
  ) {
    parts.push(
      `-H ${shellEscape(`${request.auth.apiKeyName}: ${request.auth.apiKeyValue ?? ''}`)}`,
    )
  }

  if (request.bodyEnabled && request.body.trim()) {
    parts.push(`-d ${shellEscape(request.body)}`)
  }

  const query = request.params.filter((p) => p.enabled && p.key.trim())
  if (
    request.auth.type === 'apikey' &&
    request.auth.apiKeyLocation === 'query' &&
    request.auth.apiKeyName?.trim()
  ) {
    query.push({
      id: 'apikey',
      key: request.auth.apiKeyName,
      value: request.auth.apiKeyValue ?? '',
      enabled: true,
    })
  }
  const url = query.length
    ? `${request.url}${request.url.includes('?') ? '&' : '?'}${query
        .map(
          (p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`,
        )
        .join('&')}`
    : request.url

  parts.push(shellEscape(url))

  return parts.join(' \\\n  ')
}
