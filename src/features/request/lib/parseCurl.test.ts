import { describe, expect, it } from 'vitest'
import { parseCurl } from '@/features/request/lib/parseCurl'
import { toCurl } from '@/features/request/lib/curl'
import { createEmptyRequest } from '@/features/request/lib/defaults'

function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: string }) {
  if (!result.ok) throw new Error(`expected ok, got error: ${result.error}`)
  return result.value
}

describe('parseCurl', () => {
  it('parses method, headers, and a JSON body', () => {
    const command = `curl -X POST https://api.example.com/things \\
  -H 'Content-Type: application/json' \\
  -d '{"a":1}'`
    const parsed = unwrap(parseCurl(command))
    expect(parsed.method).toBe('POST')
    expect(parsed.url).toBe('https://api.example.com/things')
    expect(parsed.body).toBe('{"a":1}')
    expect(parsed.bodyEnabled).toBe(true)
    expect(parsed.headers.map((h) => [h.key, h.value])).toContainEqual([
      'Content-Type',
      'application/json',
    ])
  })

  it('infers POST when a body is present but no -X is given', () => {
    const parsed = unwrap(parseCurl(`curl https://api.example.com/x -d 'a=1'`))
    expect(parsed.method).toBe('POST')
  })

  it('defaults to GET with no body', () => {
    const parsed = unwrap(parseCurl(`curl https://api.example.com/x`))
    expect(parsed.method).toBe('GET')
  })

  it('extracts basic auth from -u', () => {
    const parsed = unwrap(parseCurl(`curl -u user:pass https://api.example.com/x`))
    expect(parsed.auth).toEqual({ type: 'basic', username: 'user', password: 'pass' })
  })

  it('extracts a bearer token from an Authorization header', () => {
    const parsed = unwrap(
      parseCurl(`curl -H 'Authorization: Bearer abc123' https://api.example.com/x`),
    )
    expect(parsed.auth).toEqual({ type: 'bearer', token: 'abc123' })
    expect(parsed.headers.some((h) => h.key.toLowerCase() === 'authorization')).toBe(
      false,
    )
  })

  it('splits query params out of the URL', () => {
    const parsed = unwrap(parseCurl(`curl 'https://api.example.com/x?page=2&q=hi'`))
    expect(parsed.url).toBe('https://api.example.com/x')
    expect(parsed.params.map((p) => [p.key, p.value])).toEqual([
      ['page', '2'],
      ['q', 'hi'],
    ])
  })

  it('handles double-quoted values and no leading "curl" token', () => {
    const parsed = unwrap(parseCurl(`-X GET "https://api.example.com/x"`))
    expect(parsed.url).toBe('https://api.example.com/x')
  })

  it('errors on empty input', () => {
    expect(parseCurl('   ').ok).toBe(false)
  })

  it('errors when no URL can be found', () => {
    expect(parseCurl('curl -H "Accept: */*"').ok).toBe(false)
  })

  it('round-trips through toCurl', () => {
    const original = createEmptyRequest({
      method: 'POST',
      url: 'https://api.example.com/things',
      params: [],
      headers: [
        { id: '1', key: 'X-Test', value: 'yes', enabled: true },
        { id: '2', key: 'disabled', value: 'nope', enabled: false },
      ],
      auth: { type: 'bearer', token: 'xyz' },
      body: '{"a":1}',
      bodyEnabled: true,
    })

    const parsed = unwrap(parseCurl(toCurl(original)))
    expect(parsed.method).toBe('POST')
    expect(parsed.url).toBe('https://api.example.com/things')
    expect(parsed.body).toBe('{"a":1}')
    expect(parsed.auth).toEqual({ type: 'bearer', token: 'xyz' })
    expect(parsed.headers.some((h) => h.key === 'X-Test' && h.value === 'yes')).toBe(
      true,
    )
  })
})
