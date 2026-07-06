import { describe, expect, it } from 'vitest'
import {
  escapeJson,
  flatten,
  minify,
  removeEmptyValues,
  sortKeys,
  unescapeJson,
  unflatten,
} from '@/features/tools/lib/transformers'

const unwrap = (result: { ok: true; value: string } | { ok: false }) => {
  if (!result.ok) throw new Error('expected ok result')
  return result.value
}

describe('transformers', () => {
  it('minifies valid JSON', () => {
    expect(unwrap(minify('{\n  "a": 1\n}'))).toBe('{"a":1}')
  })

  it('returns an error for invalid JSON', () => {
    const result = minify('{ not json }')
    expect(result.ok).toBe(false)
  })

  it('sorts object keys deeply, preserving array order', () => {
    const input = '{"b":1,"a":{"d":4,"c":3},"list":[3,1,2]}'
    expect(unwrap(sortKeys(input, 0))).toBe(
      '{"a":{"c":3,"d":4},"b":1,"list":[3,1,2]}',
    )
  })

  it('removes empty values recursively', () => {
    const input = '{"a":1,"b":null,"c":"","d":[],"e":{},"f":{"g":null}}'
    expect(unwrap(removeEmptyValues(input, 0))).toBe('{"a":1}')
  })

  it('round-trips flatten and unflatten', () => {
    const input = '{"a":{"b":[1,{"c":2}]},"d":true}'
    const flat = unwrap(flatten(input, 0))
    expect(JSON.parse(flat)).toEqual({
      'a.b[0]': 1,
      'a.b[1].c': 2,
      d: true,
    })
    const restored = unwrap(unflatten(flat, 0))
    expect(JSON.parse(restored)).toEqual(JSON.parse(input))
  })

  it('escapes and unescapes JSON text', () => {
    const original = '{"a":1}'
    const escaped = unwrap(escapeJson(original))
    expect(escaped).toBe('"{\\"a\\":1}"')
    expect(unwrap(unescapeJson(escaped))).toBe(original)
  })

  it('rejects unescape when the document is not a string', () => {
    expect(unescapeJson('{"a":1}').ok).toBe(false)
  })
})
