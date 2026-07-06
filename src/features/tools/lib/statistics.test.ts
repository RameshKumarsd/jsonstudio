import { describe, expect, it } from 'vitest'
import { computeStatistics, formatBytes } from '@/features/tools/lib/statistics'

describe('computeStatistics', () => {
  it('counts nodes, containers, keys, and depth', () => {
    const value = { a: 1, b: [2, { c: 3 }], d: null }
    const text = JSON.stringify(value)
    const stats = computeStatistics(value, text)

    // nodes: root obj, 1, array, 2, inner obj, 3, null = 7
    expect(stats.nodeCount).toBe(7)
    expect(stats.objectCount).toBe(2)
    expect(stats.arrayCount).toBe(1)
    expect(stats.keyCount).toBe(4) // a, b, d, c
    expect(stats.depth).toBe(4) // root > b > {c} > 3
    expect(stats.fileSizeBytes).toBe(text.length)
  })
})

describe('formatBytes', () => {
  it('formats byte magnitudes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
