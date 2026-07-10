import { describe, expect, it } from 'vitest'
import { HELP_SECTIONS } from '@/features/help/content'

describe('HELP_SECTIONS', () => {
  it('has exactly 8 sections', () => {
    expect(HELP_SECTIONS).toHaveLength(8)
  })

  it('has a unique, non-empty id for every section', () => {
    const ids = HELP_SECTIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id.trim().length).toBeGreaterThan(0)
    }
  })

  it('has a non-empty title, caption, and at least one bullet for every section', () => {
    for (const section of HELP_SECTIONS) {
      expect(section.title.trim().length).toBeGreaterThan(0)
      expect(section.caption.trim().length).toBeGreaterThan(0)
      expect(section.bullets.length).toBeGreaterThanOrEqual(1)
      for (const bullet of section.bullets) {
        expect(bullet.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
