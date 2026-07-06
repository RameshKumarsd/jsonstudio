import { describe, expect, it } from 'vitest'
import {
  getAtPath,
  insertIntoContainer,
  removeAtPath,
  renameKeyAtPath,
  reorderWithinParent,
  setAtPath,
} from '@/lib/json/mutate'

describe('json mutate', () => {
  const root = { a: { b: [1, 2, 3] }, c: 'x' }

  it('reads values at a path', () => {
    expect(getAtPath(root, ['a', 'b', 1])).toBe(2)
    expect(getAtPath(root, ['missing'])).toBeUndefined()
  })

  it('sets values immutably', () => {
    const next = setAtPath(root, ['a', 'b', 1], 99)
    expect(getAtPath(next, ['a', 'b', 1])).toBe(99)
    expect(root.a.b[1]).toBe(2) // original untouched
  })

  it('removes array elements and object keys', () => {
    expect(getAtPath(removeAtPath(root, ['a', 'b', 0]), ['a', 'b'])).toEqual([
      2, 3,
    ])
    expect(getAtPath(removeAtPath(root, ['c']), [])).toEqual({
      a: { b: [1, 2, 3] },
    })
  })

  it('renames a key preserving order', () => {
    const next = renameKeyAtPath(root, [], 'a', 'z')
    expect(Object.keys(next as object)).toEqual(['z', 'c'])
  })

  it('refuses to rename onto an existing key', () => {
    expect(renameKeyAtPath(root, [], 'a', 'c')).toBe(root)
  })

  it('inserts into arrays and objects', () => {
    expect(
      getAtPath(insertIntoContainer(root, ['a', 'b'], 3, 4), ['a', 'b']),
    ).toEqual([1, 2, 3, 4])
    expect(
      getAtPath(insertIntoContainer(root, ['a'], 'new', true), ['a', 'new']),
    ).toBe(true)
  })

  it('reorders array items', () => {
    expect(
      getAtPath(reorderWithinParent(root, ['a', 'b'], 0, 2), ['a', 'b']),
    ).toEqual([2, 3, 1])
  })

  it('reorders object keys', () => {
    const obj = { one: 1, two: 2, three: 3 }
    const next = reorderWithinParent(obj, [], 2, 0)
    expect(Object.keys(next as object)).toEqual(['three', 'one', 'two'])
  })
})
