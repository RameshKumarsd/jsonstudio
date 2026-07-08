import { describe, expect, it } from 'vitest'
import { buildAxiosConfig } from '@/features/request/lib/buildAxiosConfig'
import { createEmptyRequest } from '@/features/request/lib/defaults'
import type { KeyValueEntry } from '@/features/request/types'

function entry(key: string, value: string, enabled = true): KeyValueEntry {
  return { id: key, key, value, enabled }
}

function headerValue(headers: unknown, name: string): unknown {
  return (headers as Record<string, unknown> | undefined)?.[name]
}

describe('buildAxiosConfig', () => {
  it('includes only enabled params and headers', () => {
    const request = createEmptyRequest({
      url: 'https://api.example.com/things',
      params: [entry('page', '1'), entry('debug', 'true', false)],
      headers: [entry('X-Test', 'yes')],
    })
    const { url, config } = buildAxiosConfig(request)
    expect(url).toBe('https://api.example.com/things')
    expect(config.params).toEqual({ page: '1' })
    expect(headerValue(config.headers, 'X-Test')).toBe('yes')
  })

  it('adds a Bearer Authorization header', () => {
    const request = createEmptyRequest({
      auth: { type: 'bearer', token: 'abc123' },
    })
    const { config } = buildAxiosConfig(request)
    expect(headerValue(config.headers, 'Authorization')).toBe('Bearer abc123')
  })

  it('adds a Basic Authorization header', () => {
    const request = createEmptyRequest({
      auth: { type: 'basic', username: 'user', password: 'pass' },
    })
    const { config } = buildAxiosConfig(request)
    expect(headerValue(config.headers, 'Authorization')).toBe(
      `Basic ${btoa('user:pass')}`,
    )
  })

  it('attaches the body only when enabled and the method allows it', () => {
    const withBody = createEmptyRequest({
      method: 'POST',
      body: '{"a":1}',
      bodyEnabled: true,
    })
    expect(buildAxiosConfig(withBody).config.data).toBe('{"a":1}')

    const disabled = createEmptyRequest({
      method: 'POST',
      body: '{"a":1}',
      bodyEnabled: false,
    })
    expect(buildAxiosConfig(disabled).config.data).toBeUndefined()

    const getWithBody = createEmptyRequest({
      method: 'GET',
      body: '{"a":1}',
      bodyEnabled: true,
    })
    expect(buildAxiosConfig(getWithBody).config.data).toBeUndefined()
  })

  it('defaults Content-Type to application/json when sending a body', () => {
    const request = createEmptyRequest({
      method: 'POST',
      body: '{}',
      bodyEnabled: true,
    })
    expect(
      headerValue(buildAxiosConfig(request).config.headers, 'Content-Type'),
    ).toBe('application/json')
  })

  it('does not override an explicit Content-Type header', () => {
    const request = createEmptyRequest({
      method: 'POST',
      body: '{}',
      bodyEnabled: true,
      headers: [entry('Content-Type', 'application/vnd.api+json')],
    })
    expect(
      headerValue(buildAxiosConfig(request).config.headers, 'Content-Type'),
    ).toBe('application/vnd.api+json')
  })

  it('substitutes {url} in a proxy prefix', () => {
    const request = createEmptyRequest({ url: 'https://api.example.com/x' })
    const { url } = buildAxiosConfig(request, 'https://corsproxy.io/?{url}')
    expect(url).toBe(
      `https://corsproxy.io/?${encodeURIComponent('https://api.example.com/x')}`,
    )
  })

  it('concatenates a proxy prefix without {url}', () => {
    const request = createEmptyRequest({ url: 'https://api.example.com/x' })
    const { url } = buildAxiosConfig(request, 'https://my-proxy.dev/')
    expect(url).toBe('https://my-proxy.dev/https://api.example.com/x')
  })

  it('passes the URL through unchanged with no proxy prefix', () => {
    const request = createEmptyRequest({ url: 'https://api.example.com/x' })
    expect(buildAxiosConfig(request).url).toBe('https://api.example.com/x')
  })
})
