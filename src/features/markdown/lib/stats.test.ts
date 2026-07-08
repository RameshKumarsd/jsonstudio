import { describe, expect, it } from 'vitest'
import { computeMarkdownStats } from '@/features/markdown/lib/stats'

describe('computeMarkdownStats', () => {
  it('counts words and characters', () => {
    const stats = computeMarkdownStats('# Hello world\n\nThis is a test.')
    expect(stats.words).toBe(7) // #, Hello, world, This, is, a, test.
    expect(stats.characters).toBe(30)
  })

  it('treats empty content as zero words and zero reading time', () => {
    expect(computeMarkdownStats('')).toEqual({
      words: 0,
      characters: 0,
      readingTimeMinutes: 0,
    })
    expect(computeMarkdownStats('   \n  ').words).toBe(0)
  })

  it('rounds reading time to at least one minute for non-empty text', () => {
    const stats = computeMarkdownStats('word '.repeat(10))
    expect(stats.words).toBe(10)
    expect(stats.readingTimeMinutes).toBe(1)
  })

  it('scales reading time with word count', () => {
    const stats = computeMarkdownStats('word '.repeat(500))
    expect(stats.readingTimeMinutes).toBe(3)
  })
})
