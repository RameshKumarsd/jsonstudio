import { describe, expect, it } from 'vitest'
import {
  collectProblems,
  detectDuplicateKeys,
} from '@/features/validation/lib/validate'
import { generateSchema } from '@/features/validation/lib/generateSchema'

describe('detectDuplicateKeys', () => {
  it('flags duplicate keys as warnings', () => {
    const problems = detectDuplicateKeys('{"a":1,"a":2}')
    expect(problems).toHaveLength(1)
    expect(problems[0].severity).toBe('warning')
    expect(problems[0].message).toContain('Duplicate key "a"')
  })

  it('ignores same key names in different objects', () => {
    expect(detectDuplicateKeys('{"a":{"x":1},"b":{"x":2}}')).toHaveLength(0)
  })
})

describe('collectProblems', () => {
  const content = '{"name":"Ada","age":30}'
  const value = { name: 'Ada', age: 30 }

  it('reports no problems without a schema', () => {
    const outcome = collectProblems({ content, value, schemaText: null })
    expect(outcome.problems).toHaveLength(0)
  })

  it('validates against a schema and passes', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'number' } },
      required: ['name', 'age'],
    })
    const outcome = collectProblems({ content, value, schemaText: schema })
    expect(outcome.schemaValid).toBe(true)
    expect(outcome.problems).toHaveLength(0)
  })

  it('reports schema violations with offsets', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: { age: { type: 'string' } },
    })
    const outcome = collectProblems({ content, value, schemaText: schema })
    expect(outcome.schemaValid).toBe(false)
    expect(outcome.problems.length).toBeGreaterThan(0)
    expect(outcome.problems[0].offset).toBeGreaterThan(0)
  })

  it('surfaces an invalid schema as an error', () => {
    const outcome = collectProblems({
      content,
      value,
      schemaText: '{ not json',
    })
    expect(outcome.problems[0].message).toContain('Schema error')
  })
})

describe('generateSchema', () => {
  it('infers types, required keys, and array item schemas', () => {
    const schema = generateSchema({ id: 1, tags: ['a', 'b'], active: true })
    expect(schema).toMatchObject({
      type: 'object',
      properties: {
        id: { type: 'integer' },
        tags: { type: 'array', items: { type: 'string' } },
        active: { type: 'boolean' },
      },
      required: ['id', 'tags', 'active'],
    })
  })

  it('round-trips: generated schema validates its source', () => {
    const value = { a: 1, b: ['x'], c: { d: true } }
    const schema = JSON.stringify(generateSchema(value))
    const outcome = collectProblems({
      content: JSON.stringify(value),
      value,
      schemaText: schema,
    })
    expect(outcome.schemaValid).toBe(true)
  })
})
