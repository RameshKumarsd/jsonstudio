import { describe, expect, it } from 'vitest'
import {
  ALLOWED_PROXY_HOSTS,
  buildForwardHeaders,
  isAllowedProxyTarget,
} from './index'

describe('isAllowedProxyTarget', () => {
  it('allows a host on the allowlist', () => {
    expect(isAllowedProxyTarget(new URL(`https://${ALLOWED_PROXY_HOSTS[0]}/x`))).toBe(
      true,
    )
  })

  it('rejects a host not on the allowlist', () => {
    expect(isAllowedProxyTarget(new URL('https://example.com/x'))).toBe(false)
  })

  it('rejects a subdomain of an allowed host (exact match only)', () => {
    expect(
      isAllowedProxyTarget(
        new URL(`https://evil.${ALLOWED_PROXY_HOSTS[0]}/x`),
      ),
    ).toBe(false)
  })
})

describe('buildForwardHeaders', () => {
  it('keeps ordinary headers, including Authorization', () => {
    const headers = buildForwardHeaders(
      new Headers({
        Authorization: 'Bearer abc123',
        Accept: 'application/json',
      }),
    )
    expect(headers.get('authorization')).toBe('Bearer abc123')
    expect(headers.get('accept')).toBe('application/json')
  })

  it('strips headers that describe the browser->Worker hop, not the target request', () => {
    const headers = buildForwardHeaders(
      new Headers({
        Host: 'jsonstudio.example.workers.dev',
        Origin: 'https://jsonstudio.example.workers.dev',
        Referer: 'https://jsonstudio.example.workers.dev/request',
        'CF-Connecting-IP': '1.2.3.4',
        'CF-Ray': 'abc123',
        Accept: 'application/json',
      }),
    )
    expect(headers.has('host')).toBe(false)
    expect(headers.has('origin')).toBe(false)
    expect(headers.has('referer')).toBe(false)
    expect(headers.has('cf-connecting-ip')).toBe(false)
    expect(headers.has('cf-ray')).toBe(false)
    expect(headers.get('accept')).toBe('application/json')
  })
})
