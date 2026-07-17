import type { HttpRequest, KeyValueEntry } from '@/features/request/types'

const PLACEHOLDER = /\{\{\s*([\w.-]+)\s*\}\}/g

/**
 * Replace `{{key}}` placeholders with the matching enabled variable's value.
 * An unmatched placeholder is left as-is (mirrors Postman: a typo'd
 * variable sends the literal text rather than failing the request).
 */
function substitute(text: string, variables: KeyValueEntry[]): string {
  if (!text.includes('{{')) return text
  const lookup = new Map(
    variables
      .filter((v) => v.enabled && v.key.trim())
      .map((v) => [v.key.trim(), v.value]),
  )
  return text.replace(PLACEHOLDER, (match, key: string) =>
    lookup.has(key) ? lookup.get(key)! : match,
  )
}

function substituteEntries(
  entries: KeyValueEntry[],
  variables: KeyValueEntry[],
): KeyValueEntry[] {
  return entries.map((entry) => ({
    ...entry,
    value: substitute(entry.value, variables),
  }))
}

/**
 * Apply environment variable substitution to every user-editable field of a
 * request (URL, param/header values, body, auth credentials) at send time.
 * Pure — returns a new HttpRequest, never mutates the draft being edited.
 */
export function applyEnvironment(
  request: HttpRequest,
  variables: KeyValueEntry[],
): HttpRequest {
  if (variables.length === 0) return request

  return {
    ...request,
    url: substitute(request.url, variables),
    params: substituteEntries(request.params, variables),
    headers: substituteEntries(request.headers, variables),
    body: substitute(request.body, variables),
    auth: {
      ...request.auth,
      token: request.auth.token && substitute(request.auth.token, variables),
      username:
        request.auth.username && substitute(request.auth.username, variables),
      password:
        request.auth.password && substitute(request.auth.password, variables),
      apiKeyValue:
        request.auth.apiKeyValue &&
        substitute(request.auth.apiKeyValue, variables),
    },
  }
}
