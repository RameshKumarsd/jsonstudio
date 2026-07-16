import { ok, err, type Result } from '@/types/json'
import { createId } from '@/lib/utils/id'
import {
  createEmptyRequest,
  createKeyValueEntry,
} from '@/features/request/lib/defaults'
import type {
  HttpMethod,
  HttpRequest,
  KeyValueEntry,
  RequestAuth,
} from '@/features/request/types'

interface PostmanKeyValue {
  key?: string
  value?: string
  disabled?: boolean
}
interface PostmanUrl {
  raw?: string
  query?: PostmanKeyValue[]
}
interface PostmanBody {
  mode?: string
  raw?: string
  urlencoded?: PostmanKeyValue[]
}
interface PostmanAuthField {
  key?: string
  value?: unknown
}
interface PostmanAuth {
  type?: string
  bearer?: PostmanAuthField[]
  basic?: PostmanAuthField[]
  apikey?: PostmanAuthField[]
}
interface PostmanRequest {
  method?: string
  header?: PostmanKeyValue[]
  url?: string | PostmanUrl
  body?: PostmanBody
  auth?: PostmanAuth
}
interface PostmanItem {
  name?: string
  request?: PostmanRequest
  item?: PostmanItem[]
}
interface PostmanCollectionFile {
  info?: { name?: string }
  item?: PostmanItem[]
}

export interface ParsedPostmanCollection {
  name: string
  requests: HttpRequest[]
  /** Requests imported with a body/auth mode this client doesn't support. */
  skippedCount: number
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

function toHttpMethod(value: string | undefined): HttpMethod {
  const upper = (value ?? 'GET').toUpperCase()
  return (METHODS as string[]).includes(upper) ? (upper as HttpMethod) : 'GET'
}

function authFieldValue(
  fields: PostmanAuthField[] | undefined,
  key: string,
): string {
  const field = fields?.find((f) => f.key === key)
  return typeof field?.value === 'string' ? field.value : ''
}

function toRequestAuth(auth: PostmanAuth | undefined): RequestAuth {
  if (auth?.type === 'bearer') {
    return { type: 'bearer', token: authFieldValue(auth.bearer, 'token') }
  }
  if (auth?.type === 'basic') {
    return {
      type: 'basic',
      username: authFieldValue(auth.basic, 'username'),
      password: authFieldValue(auth.basic, 'password'),
    }
  }
  if (auth?.type === 'apikey') {
    const location = authFieldValue(auth.apikey, 'in')
    return {
      type: 'apikey',
      apiKeyName: authFieldValue(auth.apikey, 'key'),
      apiKeyValue: authFieldValue(auth.apikey, 'value'),
      apiKeyLocation: location === 'query' ? 'query' : 'header',
    }
  }
  return { type: 'none' }
}

interface ConvertedRequest {
  request: HttpRequest
  skipped: boolean
}

function convertRequest(item: PostmanItem): ConvertedRequest | null {
  const source = item.request
  if (!source) return null

  const rawUrl =
    typeof source.url === 'string' ? source.url : (source.url?.raw ?? '')
  if (!rawUrl) return null

  const [baseUrl] = rawUrl.split('?')
  const urlQuery =
    typeof source.url === 'object' ? (source.url.query ?? []) : []
  const params: KeyValueEntry[] = urlQuery
    .filter((q) => q.key)
    .map((q) => ({
      id: createId(),
      key: q.key ?? '',
      value: q.value ?? '',
      enabled: !q.disabled,
    }))

  const headers: KeyValueEntry[] = (source.header ?? [])
    .filter((h) => h.key)
    .map((h) => ({
      id: createId(),
      key: h.key ?? '',
      value: h.value ?? '',
      enabled: !h.disabled,
    }))

  let body = ''
  let bodyEnabled = false
  let skipped = false
  const mode = source.body?.mode

  if (!mode || mode === 'raw') {
    body = source.body?.raw ?? ''
    bodyEnabled = body.trim().length > 0
  } else if (mode === 'urlencoded') {
    body = (source.body?.urlencoded ?? [])
      .filter((f) => f.key && !f.disabled)
      .map(
        (f) =>
          `${encodeURIComponent(f.key ?? '')}=${encodeURIComponent(f.value ?? '')}`,
      )
      .join('&')
    bodyEnabled = body.length > 0
  } else {
    // formdata / file / graphql / etc. — not supported by this client.
    skipped = true
  }

  const auth = toRequestAuth(source.auth)
  if (
    source.auth?.type &&
    source.auth.type !== 'noauth' &&
    auth.type === 'none'
  ) {
    skipped = true // an auth type we don't support (oauth2, digest, ...)
  }

  const request = createEmptyRequest({
    name: item.name || 'Imported request',
    method: toHttpMethod(source.method),
    url: baseUrl,
    params: params.length ? params : [createKeyValueEntry()],
    headers: headers.length ? headers : [createKeyValueEntry()],
    auth,
    body,
    bodyEnabled,
  })

  return { request, skipped }
}

function flattenItems(
  items: PostmanItem[] | undefined,
  out: PostmanItem[],
): void {
  for (const item of items ?? []) {
    if (item.request) {
      out.push(item)
    } else if (item.item) {
      flattenItems(item.item, out)
    }
  }
}

/**
 * Parse a Postman Collection (v2.x) JSON export into HttpRequest objects.
 * Nested folders are flattened. Only `raw` and `urlencoded` body modes and
 * bearer/basic auth translate fully; anything else (form-data, file bodies,
 * OAuth, API keys, ...) imports with an empty body/no auth and counts toward
 * `skippedCount` so the caller can warn without failing the whole import.
 */
export function parsePostmanCollection(
  text: string,
): Result<ParsedPostmanCollection, string> {
  let parsed: PostmanCollectionFile
  try {
    parsed = JSON.parse(text) as PostmanCollectionFile
  } catch {
    return err('That file is not valid JSON')
  }

  if (!Array.isArray(parsed.item)) {
    return err(
      'That does not look like a Postman collection (missing "item" array)',
    )
  }

  const leafItems: PostmanItem[] = []
  flattenItems(parsed.item, leafItems)

  const requests: HttpRequest[] = []
  let skippedCount = 0
  for (const item of leafItems) {
    const converted = convertRequest(item)
    if (!converted) continue
    requests.push(converted.request)
    if (converted.skipped) skippedCount++
  }

  if (requests.length === 0) {
    return err('No importable requests found in this collection')
  }

  return ok({
    name: parsed.info?.name || 'Imported collection',
    requests,
    skippedCount,
  })
}
