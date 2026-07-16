import { describe, expect, it } from 'vitest'
import { applyEnvironment } from '@/features/request/lib/environment'
import { createEmptyRequest, createKeyValueEntry } from '@/features/request/lib/defaults'

function variable(key: string, value: string, enabled = true) {
  return { ...createKeyValueEntry(key, value), enabled }
}

describe('applyEnvironment', () => {
  it('substitutes {{var}} in the URL', () => {
    const request = createEmptyRequest({ url: '{{base_url}}/users/{{id}}' })
    const result = applyEnvironment(request, [
      variable('base_url', 'https://api.example.com'),
      variable('id', '42'),
    ])
    expect(result.url).toBe('https://api.example.com/users/42')
  })

  it('substitutes in header and param values, not keys', () => {
    const request = createEmptyRequest({
      headers: [createKeyValueEntry('{{header_key}}', '{{token}}')],
      params: [createKeyValueEntry('q', '{{query}}')],
    })
    const result = applyEnvironment(request, [
      variable('header_key', 'X-Custom'),
      variable('token', 'secret123'),
      variable('query', 'search-term'),
    ])
    expect(result.headers[0].key).toBe('{{header_key}}')
    expect(result.headers[0].value).toBe('secret123')
    expect(result.params[0].value).toBe('search-term')
  })

  it('substitutes in the body', () => {
    const request = createEmptyRequest({ body: '{"user":"{{username}}"}' })
    const result = applyEnvironment(request, [variable('username', 'ada')])
    expect(result.body).toBe('{"user":"ada"}')
  })

  it('substitutes in bearer token and basic auth credentials', () => {
    const bearerRequest = createEmptyRequest({
      auth: { type: 'bearer', token: '{{token}}' },
    })
    expect(
      applyEnvironment(bearerRequest, [variable('token', 'abc123')]).auth
        .token,
    ).toBe('abc123')

    const basicRequest = createEmptyRequest({
      auth: { type: 'basic', username: '{{user}}', password: '{{pass}}' },
    })
    const result = applyEnvironment(basicRequest, [
      variable('user', 'admin'),
      variable('pass', 'hunter2'),
    ])
    expect(result.auth.username).toBe('admin')
    expect(result.auth.password).toBe('hunter2')
  })

  it('leaves an unmatched placeholder untouched rather than erroring', () => {
    const request = createEmptyRequest({ url: '{{unknown}}/path' })
    const result = applyEnvironment(request, [variable('other', 'x')])
    expect(result.url).toBe('{{unknown}}/path')
  })

  it('ignores disabled variables', () => {
    const request = createEmptyRequest({ url: '{{base_url}}' })
    const result = applyEnvironment(request, [
      variable('base_url', 'https://disabled.example.com', false),
    ])
    expect(result.url).toBe('{{base_url}}')
  })

  it('is a no-op with an empty variable list', () => {
    const request = createEmptyRequest({ url: 'https://example.com' })
    const result = applyEnvironment(request, [])
    expect(result).toEqual(request)
  })
})
