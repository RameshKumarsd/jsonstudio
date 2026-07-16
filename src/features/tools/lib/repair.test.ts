import { describe, expect, it } from 'vitest'
import { repairJson } from '@/features/tools/lib/repair'

describe('repairJson', () => {
  it('removes trailing commas', () => {
    const result = repairJson('{"a": 1, "b": 2,}')
    expect(result.ok).toBe(true)
    if (result.ok) expect(JSON.parse(result.value)).toEqual({ a: 1, b: 2 })
  })

  it('quotes unquoted keys and converts single-quoted strings', () => {
    const result = repairJson("{name: 'John', age: 30}")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(JSON.parse(result.value)).toEqual({ name: 'John', age: 30 })
    }
  })

  it('strips JS-style comments', () => {
    const result = repairJson('{\n  // a comment\n  "a": 1\n}')
    expect(result.ok).toBe(true)
    if (result.ok) expect(JSON.parse(result.value)).toEqual({ a: 1 })
  })

  it('pretty-prints the repaired output with the given indent', () => {
    const result = repairJson('{"a":1,}', 4)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toBe('{\n    "a": 1\n}')
  })

  it('fails on input that cannot be repaired', () => {
    const result = repairJson('not json at all {{{')
    expect(result.ok).toBe(false)
  })
})
