import { describe, expect, it } from 'vitest'
import { structuralDiff } from '@/features/diff/lib/structuralDiff'

describe('structuralDiff', () => {
  it('counts creates, removes, and changes', () => {
    const left = '{"a":1,"b":2,"c":3}'
    const right = '{"a":1,"b":20,"d":4}'
    const result = structuralDiff(left, right)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.changed).toBe(1) // b
    expect(result.summary.removed).toBe(1) // c
    expect(result.summary.created).toBe(1) // d
  })

  it('reports the offending side on invalid JSON', () => {
    const result = structuralDiff('{"a":1}', '{ oops')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.side).toBe('right')
  })

  it('finds no differences for equal documents', () => {
    const result = structuralDiff('{"a":[1,2]}', '{"a":[1,2]}')
    expect(result.ok && result.summary.changes.length).toBe(0)
  })
})
