import { describe, expect, it } from 'vitest'
import { toCurl } from '@/features/request/lib/curl'
import { createEmptyRequest } from '@/features/request/lib/defaults'
import type { KeyValueEntry } from '@/features/request/types'

function entry(key: string, value: string, enabled = true): KeyValueEntry {
  return { id: key, key, value, enabled }
}

describe('toCurl', () => {
  it('builds a GET command with headers', () => {
    const request = createEmptyRequest({
      method: 'GET',
      url: 'https://api.example.com/things',
      headers: [entry('X-Test', 'yes')],
    })
    const curl = toCurl(request)
    expect(curl).toContain('curl -X GET')
    expect(curl).toContain("-H 'X-Test: yes'")
    expect(curl).toContain("'https://api.example.com/things'")
  })

  it('includes enabled query params in the URL and skips disabled ones', () => {
    const request = createEmptyRequest({
      url: 'https://api.example.com/things',
      params: [entry('page', '2'), entry('debug', 'true', false)],
    })
    const curl = toCurl(request)
    expect(curl).toContain("things?page=2'")
    expect(curl).not.toContain('debug')
  })

  it('includes -d for an enabled body', () => {
    const request = createEmptyRequest({
      method: 'POST',
      body: '{"a":1}',
      bodyEnabled: true,
    })
    expect(toCurl(request)).toContain(`-d '{"a":1}'`)
  })

  it('omits -d when the body is disabled', () => {
    const request = createEmptyRequest({
      method: 'POST',
      body: '{"a":1}',
      bodyEnabled: false,
    })
    expect(toCurl(request)).not.toContain('-d')
  })

  it('adds -u for basic auth', () => {
    const request = createEmptyRequest({
      auth: { type: 'basic', username: 'user', password: 'pass' },
    })
    expect(toCurl(request)).toContain("-u 'user:pass'")
  })

  it('adds a Bearer header for bearer auth', () => {
    const request = createEmptyRequest({
      auth: { type: 'bearer', token: 'xyz' },
    })
    expect(toCurl(request)).toContain("-H 'Authorization: Bearer xyz'")
  })
})
