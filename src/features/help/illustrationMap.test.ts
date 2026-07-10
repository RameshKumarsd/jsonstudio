import { describe, expect, it } from 'vitest'
import { HELP_SECTIONS } from '@/features/help/content'
import { HELP_ILLUSTRATIONS } from '@/features/help/illustrationMap'

describe('HELP_ILLUSTRATIONS', () => {
  it('has exactly one illustration per content section, matched by id', () => {
    const contentIds = HELP_SECTIONS.map((s) => s.id).sort()
    const illustrationIds = Object.keys(HELP_ILLUSTRATIONS).sort()
    expect(illustrationIds).toEqual(contentIds)
  })
})
