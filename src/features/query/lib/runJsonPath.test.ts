import { describe, expect, it } from 'vitest'
import { runJsonPath } from '@/features/query/lib/runJsonPath'

const data = {
  contributors: [
    { name: 'Ada', commits: 128 },
    { name: 'Grace', commits: 97 },
  ],
}

describe('runJsonPath', () => {
  it('returns matches for a valid expression', () => {
    const result = runJsonPath(data, '$.contributors[*].name')
    expect(result).toEqual({ ok: true, matches: ['Ada', 'Grace'] })
  })

  it('filters with predicates', () => {
    const result = runJsonPath(data, '$.contributors[?(@.commits>100)].name')
    expect(result.ok && result.matches).toEqual(['Ada'])
  })

  it('returns empty matches for an empty path', () => {
    expect(runJsonPath(data, '  ')).toEqual({ ok: true, matches: [] })
  })

  it('reports an error for a malformed filter expression', () => {
    const result = runJsonPath(data, '$.contributors[?(@.commits ===)]')
    expect(result.ok).toBe(false)
  })
})
