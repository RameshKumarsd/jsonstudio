import { describe, expect, it } from 'vitest'
import { decodeJwt } from '@/features/tools/lib/jwt'

/** header={"alg":"HS256","typ":"JWT"}, payload={"sub":"1234","name":"Ada","iat":1000000000,"exp":1000003600} */
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkFkYSIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAzNjAwfQ.signature-not-verified'

describe('decodeJwt', () => {
  it('decodes the header and payload as JSON', () => {
    const result = decodeJwt(SAMPLE_JWT)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.header).toEqual({ alg: 'HS256', typ: 'JWT' })
      expect(result.value.payload).toEqual({
        sub: '1234',
        name: 'Ada',
        iat: 1000000000,
        exp: 1000003600,
      })
    }
  })

  it('reads exp/iat claims into Dates and flags it as expired (long in the past)', () => {
    const result = decodeJwt(SAMPLE_JWT)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.issuedAt?.getTime()).toBe(1000000000 * 1000)
      expect(result.value.expiresAt?.getTime()).toBe(1000003600 * 1000)
      expect(result.value.isExpired).toBe(true)
    }
  })

  it('handles tokens with no exp claim (never expires)', () => {
    const result = decodeJwt('eyJhbGciOiJub25lIn0.e30.sig')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.expiresAt).toBeNull()
      expect(result.value.isExpired).toBe(false)
    }
  })

  it('fails on input that is not three dot-separated parts', () => {
    const result = decodeJwt('not-a-jwt')
    expect(result.ok).toBe(false)
  })

  it('fails on a segment that is not valid base64url JSON', () => {
    const result = decodeJwt('not-json.also-not-json.sig')
    expect(result.ok).toBe(false)
  })
})
