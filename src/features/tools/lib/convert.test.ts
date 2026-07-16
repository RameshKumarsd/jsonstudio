import { describe, expect, it } from 'vitest'
import { toCsv, toYaml } from '@/features/tools/lib/convert'

describe('toYaml', () => {
  it('serializes a JSON value as YAML', () => {
    const yaml = toYaml({ name: 'Ada', tags: ['math', 'computing'] })
    expect(yaml).toBe('name: Ada\ntags:\n  - math\n  - computing\n')
  })
})

describe('toCsv', () => {
  it('converts an array of flat objects to CSV with a header row', () => {
    const result = toCsv([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' },
    ])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe('id,name\r\n1,Ada\r\n2,Grace\r\n')
    }
  })

  it('unions keys across rows and fills missing values with empty cells', () => {
    const result = toCsv([{ a: 1 }, { a: 2, b: 'x' }])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe('a,b\r\n1,\r\n2,x\r\n')
    }
  })

  it('quotes fields containing commas, quotes, or newlines', () => {
    const result = toCsv([{ note: 'a, "b"\nc' }])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe('note\r\n"a, ""b""\nc"\r\n')
    }
  })

  it('fails when the root value is not an array', () => {
    const result = toCsv({ a: 1 })
    expect(result.ok).toBe(false)
  })

  it('fails when the array is empty', () => {
    const result = toCsv([])
    expect(result.ok).toBe(false)
  })

  it('fails when an element is not a plain object', () => {
    const result = toCsv([1, 2, 3])
    expect(result.ok).toBe(false)
  })
})
