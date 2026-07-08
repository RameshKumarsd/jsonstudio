import { describe, expect, it } from 'vitest'
import { parsePostmanCollection } from '@/features/request/lib/postmanCollection'

function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: string }) {
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
    const result = unwrap(parsePostmanCollection(JSON.stringify(basicCollection)))
    expect(result.name).toBe('My Collection')
    expect(result.requests).toHaveLength(2)
  })

  it('flattens nested folders', () => {
    const result = unwrap(parsePostmanCollection(JSON.stringify(basicCollection)))
    expect(result.requests.map((r) => r.name)).toEqual(['Get Todo', 'Create Todo'])
  })

  it('splits the query string out of a raw url object', () => {
    const result = unwrap(parsePostmanCollection(JSON.stringify(basicCollection)))
    const get = result.requests[0]
    expect(get.url).toBe('https://api.example.com/todos/1')
    expect(get.params).toEqual([
      expect.objectContaining({ key: 'verbose', value: 'true', enabled: true }),
    ])
  })

  it('parses a raw JSON body and bearer auth', () => {
    const result = unwrap(parsePostmanCollection(JSON.stringify(basicCollection)))
    const create = result.requests[1]
    expect(create.method).toBe('POST')
    expect(create.body).toBe('{"title":"test"}')
    expect(create.bodyEnabled).toBe(true)
    expect(create.auth).toEqual({ type: 'bearer', token: 'xyz' })
  })

  it('handles a plain string url', () => {
    const result = unwrap(parsePostmanCollection(JSON.stringify(basicCollection)))
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
