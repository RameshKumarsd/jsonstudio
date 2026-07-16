import { describe, expect, it } from 'vitest'
import {
  exportPostmanCollection,
  parsePostmanCollection,
} from '@/features/request/lib/postmanCollection'
import { createEmptyRequest } from '@/features/request/lib/defaults'

function unwrap<T>(
  result: { ok: true; value: T } | { ok: false; error: string },
) {
  if (!result.ok) throw new Error(`expected ok, got error: ${result.error}`)
  return result.value
}

const basicCollection = {
  info: { name: 'My Collection' },
  item: [
    {
      name: 'Get Todo',
      request: {
        method: 'GET',
        header: [{ key: 'Accept', value: 'application/json' }],
        url: {
          raw: 'https://api.example.com/todos/1?verbose=true',
          query: [{ key: 'verbose', value: 'true' }],
        },
      },
    },
    {
      name: 'A folder',
      item: [
        {
          name: 'Create Todo',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: 'https://api.example.com/todos',
            body: { mode: 'raw', raw: '{"title":"test"}' },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: 'xyz' }] },
          },
        },
      ],
    },
  ],
}

describe('parsePostmanCollection', () => {
  it('parses a top-level collection name and requests', () => {
    const result = unwrap(
      parsePostmanCollection(JSON.stringify(basicCollection)),
    )
    expect(result.name).toBe('My Collection')
    expect(result.requests).toHaveLength(2)
  })

  it('flattens nested folders', () => {
    const result = unwrap(
      parsePostmanCollection(JSON.stringify(basicCollection)),
    )
    expect(result.requests.map((r) => r.name)).toEqual([
      'Get Todo',
      'Create Todo',
    ])
  })

  it('splits the query string out of a raw url object', () => {
    const result = unwrap(
      parsePostmanCollection(JSON.stringify(basicCollection)),
    )
    const get = result.requests[0]
    expect(get.url).toBe('https://api.example.com/todos/1')
    expect(get.params).toEqual([
      expect.objectContaining({ key: 'verbose', value: 'true', enabled: true }),
    ])
  })

  it('parses a raw JSON body and bearer auth', () => {
    const result = unwrap(
      parsePostmanCollection(JSON.stringify(basicCollection)),
    )
    const create = result.requests[1]
    expect(create.method).toBe('POST')
    expect(create.body).toBe('{"title":"test"}')
    expect(create.bodyEnabled).toBe(true)
    expect(create.auth).toEqual({ type: 'bearer', token: 'xyz' })
  })

  it('parses API Key auth (header location)', () => {
    const collection = {
      info: { name: 'Api Key Collection' },
      item: [
        {
          name: 'Get Secret',
          request: {
            method: 'GET',
            url: 'https://api.example.com/secret',
            auth: {
              type: 'apikey',
              apikey: [
                { key: 'key', value: 'X-Api-Key' },
                { key: 'value', value: 'topsecret' },
                { key: 'in', value: 'header' },
              ],
            },
          },
        },
      ],
    }
    const result = unwrap(parsePostmanCollection(JSON.stringify(collection)))
    expect(result.requests[0].auth).toEqual({
      type: 'apikey',
      apiKeyName: 'X-Api-Key',
      apiKeyValue: 'topsecret',
      apiKeyLocation: 'header',
    })
    expect(result.skippedCount).toBe(0)
  })

  it('handles a plain string url', () => {
    const result = unwrap(
      parsePostmanCollection(JSON.stringify(basicCollection)),
    )
    expect(result.requests[1].url).toBe('https://api.example.com/todos')
  })

  it('counts unsupported body/auth modes as skipped without failing the import', () => {
    const collection = {
      info: { name: 'Odd Collection' },
      item: [
        {
          name: 'Upload file',
          request: {
            method: 'POST',
            url: 'https://api.example.com/upload',
            body: { mode: 'formdata' },
          },
        },
        {
          name: 'OAuth request',
          request: {
            method: 'GET',
            url: 'https://api.example.com/secure',
            auth: { type: 'oauth2' },
          },
        },
      ],
    }
    const result = unwrap(parsePostmanCollection(JSON.stringify(collection)))
    expect(result.requests).toHaveLength(2)
    expect(result.skippedCount).toBe(2)
  })

  it('errors on invalid JSON', () => {
    expect(parsePostmanCollection('{ not json').ok).toBe(false)
  })

  it('errors when the item array is missing', () => {
    expect(parsePostmanCollection(JSON.stringify({ info: {} })).ok).toBe(false)
  })

  it('errors when there are no importable requests', () => {
    expect(parsePostmanCollection(JSON.stringify({ item: [] })).ok).toBe(false)
  })
})

describe('exportPostmanCollection', () => {
  it('produces a collection with the given name and one item per request', () => {
    const requests = [
      createEmptyRequest({ name: 'Get Todo', url: 'https://api.example.com/todos/1' }),
      createEmptyRequest({ name: 'Create Todo', method: 'POST' }),
    ]
    const collection = exportPostmanCollection('My Collection', requests)
    expect(collection.info.name).toBe('My Collection')
    expect(collection.item).toHaveLength(2)
    expect(collection.item[0].name).toBe('Get Todo')
    expect(collection.item[0].request.method).toBe('GET')
    expect(collection.item[1].request.method).toBe('POST')
  })

  it('includes enabled headers and the body when enabled', () => {
    const request = createEmptyRequest({
      name: 'Create',
      method: 'POST',
      headers: [
        { id: '1', key: 'X-Test', value: 'yes', enabled: true },
        { id: '2', key: 'X-Off', value: 'no', enabled: false },
      ],
      body: '{"a":1}',
      bodyEnabled: true,
    })
    const collection = exportPostmanCollection('C', [request])
    const item = collection.item[0]
    expect(item.request.header).toEqual([{ key: 'X-Test', value: 'yes' }])
    expect(item.request.body).toEqual({ mode: 'raw', raw: '{"a":1}' })
  })

  it('omits the auth field for requests with no auth', () => {
    const request = createEmptyRequest({ auth: { type: 'none' } })
    const collection = exportPostmanCollection('C', [request])
    expect(collection.item[0].request.auth).toBeUndefined()
  })

  it('round-trips bearer, basic, and apikey auth back through the importer', () => {
    const requests = [
      createEmptyRequest({
        name: 'Bearer',
        url: 'https://api.example.com/a',
        auth: { type: 'bearer', token: 'xyz' },
      }),
      createEmptyRequest({
        name: 'Basic',
        url: 'https://api.example.com/b',
        auth: { type: 'basic', username: 'user', password: 'pass' },
      }),
      createEmptyRequest({
        name: 'ApiKey',
        url: 'https://api.example.com/c',
        auth: {
          type: 'apikey',
          apiKeyName: 'X-Api-Key',
          apiKeyValue: 'secret',
          apiKeyLocation: 'query',
        },
      }),
    ]
    const exported = exportPostmanCollection('Round Trip', requests)
    const reimported = unwrap(
      parsePostmanCollection(JSON.stringify(exported)),
    )
    expect(reimported.skippedCount).toBe(0)
    expect(reimported.requests[0].auth).toEqual({
      type: 'bearer',
      token: 'xyz',
    })
    expect(reimported.requests[1].auth).toEqual({
      type: 'basic',
      username: 'user',
      password: 'pass',
    })
    expect(reimported.requests[2].auth).toEqual({
      type: 'apikey',
      apiKeyName: 'X-Api-Key',
      apiKeyValue: 'secret',
      apiKeyLocation: 'query',
    })
  })
})
