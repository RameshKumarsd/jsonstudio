import { err, ok, type JsonValue, type Result } from '@/types/json'

export interface DecodedJwt {
  header: JsonValue
  payload: JsonValue
  issuedAt: Date | null
  expiresAt: Date | null
  isExpired: boolean
}

function decodeSegment(segment: string): Result<JsonValue, string> {
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    )
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return ok(JSON.parse(new TextDecoder().decode(bytes)) as JsonValue)
  } catch {
    return err('not valid base64url-encoded JSON')
  }
}

function numberClaim(payload: JsonValue, key: string): number | null {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }
  const value = (payload as Record<string, JsonValue>)[key]
  return typeof value === 'number' ? value : null
}

/**
 * Decode a JWT's header and payload (does not verify the signature — this is
 * a client-side inspection tool, not an auth library). `exp`/`iat` are Unix
 * seconds per the JWT spec, converted to Dates.
 */
export function decodeJwt(token: string): Result<DecodedJwt, string> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    return err(
      'A JWT has three dot-separated parts: header.payload.signature',
    )
  }

  const [headerPart, payloadPart] = parts
  const header = decodeSegment(headerPart)
  if (!header.ok) return err(`Header is ${header.error}`)
  const payload = decodeSegment(payloadPart)
  if (!payload.ok) return err(`Payload is ${payload.error}`)

  const exp = numberClaim(payload.value, 'exp')
  const iat = numberClaim(payload.value, 'iat')
  const expiresAt = exp !== null ? new Date(exp * 1000) : null

  return ok({
    header: header.value,
    payload: payload.value,
    issuedAt: iat !== null ? new Date(iat * 1000) : null,
    expiresAt,
    isExpired: expiresAt !== null && expiresAt.getTime() < Date.now(),
  })
}
