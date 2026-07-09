import { ok, err, type Result } from '@/types/json'
import { createKeyValueEntry } from '@/features/request/lib/defaults'
import type {
  HttpMethod,
  KeyValueEntry,
  RequestAuth,
} from '@/features/request/types'

export interface ParsedCurl {
  method: HttpMethod
  url: string
  params: KeyValueEntry[]
  headers: KeyValueEntry[]
  auth: RequestAuth
  body: string
  bodyEnabled: boolean
}

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

function isHttpMethod(value: string): value is HttpMethod {
  return (METHODS as string[]).includes(value.toUpperCase())
}

/**
 * Split a shell-style command line into tokens, honoring single/double
 * quotes and backslash escapes, and joining backslash-newline continuations
 * (multi-line curl commands copied from a terminal or browser devtools).
 */
function tokenize(input: string): string[] {
  const joined = input.replace(/\\\r?\n/g, ' ')
  const tokens: string[] = []
  let current = ''
  let hasCurrent = false
  let quote: '"' | "'" | null = null

  for (let i = 0; i < joined.length; i++) {
    const ch = joined[i]
    if (quote) {
      if (ch === quote) {
        quote = null
      } else if (ch === '\\' && quote === '"' && i + 1 < joined.length) {
        current += joined[++i]
      } else {
        current += ch
      }
      hasCurrent = true
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      hasCurrent = true
    } else if (/\s/.test(ch)) {
      if (hasCurrent) {
        tokens.push(current)
        current = ''
        hasCurrent = false
      }
    } else if (ch === '\\' && i + 1 < joined.length) {
      current += joined[++i]
      hasCurrent = true
    } else {
      current += ch
      hasCurrent = true
    }
  }
  if (hasCurrent) tokens.push(current)
  return tokens
}

const NO_ARG_FLAGS = new Set([
  '--compressed',
  '-k',
  '--insecure',
  '-s',
  '--silent',
  '-v',
  '--verbose',
  '-L',
  '--location',
  '-i',
  '--include',
  '-#',
  '--progress-bar',
])

const DATA_FLAGS = new Set([
  '-d',
  '--data',
  '--data-raw',
  '--data-binary',
  '--data-ascii',
])

/**
 * Parse a copy-pasted cURL command (from a terminal, browser devtools "Copy
 * as cURL", or our own `toCurl` output) into request fields. Supports
 * method, headers, body, basic auth (-u), bearer tokens carried in an
 * Authorization header, and the URL (including its query string).
 */
export function parseCurl(command: string): Result<ParsedCurl, string> {
  const trimmed = command.trim()
  if (!trimmed) return err('Paste a curl command to import')

  const tokens = tokenize(trimmed)
  if (tokens[0]?.toLowerCase() === 'curl') tokens.shift()

  let method: HttpMethod | null = null
  let url: string | null = null
  const headerEntries: { key: string; value: string }[] = []
  const dataParts: string[] = []
  let basicAuth: { username: string; password: string } | null = null

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token === '-X' || token === '--request') {
      const value = tokens[++i]
      if (value && isHttpMethod(value))
        method = value.toUpperCase() as HttpMethod
      continue
    }
    if (token === '-H' || token === '--header') {
      const value = tokens[++i] ?? ''
      const colonIndex = value.indexOf(':')
      if (colonIndex > 0) {
        headerEntries.push({
          key: value.slice(0, colonIndex).trim(),
          value: value.slice(colonIndex + 1).trim(),
        })
      }
      continue
    }
    if (DATA_FLAGS.has(token)) {
      dataParts.push(tokens[++i] ?? '')
      continue
    }
    if (token === '-u' || token === '--user') {
      const value = tokens[++i] ?? ''
      const colonIndex = value.indexOf(':')
      basicAuth =
        colonIndex >= 0
          ? {
              username: value.slice(0, colonIndex),
              password: value.slice(colonIndex + 1),
            }
          : { username: value, password: '' }
      continue
    }
    if (token === '-b' || token === '--cookie') {
      const value = tokens[++i] ?? ''
      headerEntries.push({ key: 'Cookie', value })
      continue
    }
    if (token === '--url') {
      url = tokens[++i] ?? url
      continue
    }
    if (NO_ARG_FLAGS.has(token)) continue
    if (token.startsWith('-')) {
      // Unknown flag; if the next token looks like its value, skip it too so
      // parsing doesn't misalign on curl options we don't explicitly handle.
      if (tokens[i + 1] && !tokens[i + 1].startsWith('-')) i++
      continue
    }
    if (!url) url = token
  }

  if (!url) return err('Could not find a URL in the curl command')

  const [rawUrl, queryString] = url.split('?')
  const params: KeyValueEntry[] =
    queryString
      ?.split('&')
      .filter(Boolean)
      .map((pair) => {
        const [key, value = ''] = pair.split('=')
        return createKeyValueEntry(
          decodeURIComponent(key),
          decodeURIComponent(value),
        )
      }) ?? []

  // Extract a bearer token carried in the Authorization header into
  // structured auth; leave every other header as-is.
  let auth: RequestAuth = { type: 'none' }
  const headers: KeyValueEntry[] = []
  for (const { key, value } of headerEntries) {
    if (key.toLowerCase() === 'authorization' && /^bearer\s+/i.test(value)) {
      auth = { type: 'bearer', token: value.replace(/^bearer\s+/i, '').trim() }
      continue
    }
    headers.push(createKeyValueEntry(key, value))
  }
  if (basicAuth) {
    auth = {
      type: 'basic',
      username: basicAuth.username,
      password: basicAuth.password,
    }
  }

  const body = dataParts.join('&')

  return ok({
    method: method ?? (body ? 'POST' : 'GET'),
    url: rawUrl,
    params: params.length ? params : [createKeyValueEntry()],
    headers: headers.length ? headers : [createKeyValueEntry()],
    auth,
    body,
    bodyEnabled: body.length > 0,
  })
}
