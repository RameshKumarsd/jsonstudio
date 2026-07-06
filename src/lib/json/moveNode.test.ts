import { describe, expect, it } from 'vitest'
import { getAtPath, moveNode } from '@/lib/json/mutate'

describe('moveNode', () => {
  it('reorders within the same array', () => {
    const root = { list: [1, 2, 3] }
    const next = moveNode(root, ['list', 0], ['list'], 2)
    expect(getAtPath(next, ['list'])).toEqual([2, 3, 1])
  })

  it('moves an array item into another array', () => {
    const root = { a: [1, 2], b: [9] }
    const next = moveNode(root, ['a', 0], ['b'], 0)
    expect(getAtPath(next, ['a'])).toEqual([2])
    expect(getAtPath(next, ['b'])).toEqual([1, 9])
  })

  it('moves an object property into another object, keeping its key', () => {
    const root = { a: { x: 1 }, b: {} }
    const next = moveNode(root, ['a', 'x'], ['b'], 0)
    expect(getAtPath(next, ['a'])).toEqual({})
    expect(getAtPath(next, ['b', 'x'])).toBe(1)
  })

  it('uniquifies a colliding key on move', () => {
    const root = { a: { x: 1 }, b: { x: 9 } }
    const next = moveNode(root, ['a', 'x'], ['b'], 0)
    expect(getAtPath(next, ['b', 'x'])).toBe(9)
    expect(getAtPath(next, ['b', 'x2'])).toBe(1)
  })

  it('refuses to move a node into its own subtree', () => {
    const root = { a: { b: { c: 1 } } }
    const next = moveNode(root, ['a'], ['a', 'b'], 0)
    expect(next).toBe(root)
  })
})
