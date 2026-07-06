import type { JsonValue } from '@/types/json'

type Schema = Record<string, unknown>

function schemaForValue(value: JsonValue): Schema {
  if (value === null) return { type: 'null' }
  if (Array.isArray(value)) return schemaForArray(value)
  switch (typeof value) {
    case 'boolean':
      return { type: 'boolean' }
    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' }
    case 'string':
      return { type: 'string' }
    case 'object':
      return schemaForObject(value as Record<string, JsonValue>)
    default:
      return {}
  }
}

function schemaForArray(items: JsonValue[]): Schema {
  if (items.length === 0) return { type: 'array', items: {} }

  const itemSchemas = items.map(schemaForValue)
  const unique = new Map<string, Schema>()
  for (const schema of itemSchemas) {
    unique.set(JSON.stringify(schema), schema)
  }
  const variants = [...unique.values()]

  return {
    type: 'array',
    items: variants.length === 1 ? variants[0] : { anyOf: variants },
  }
}

function schemaForObject(object: Record<string, JsonValue>): Schema {
  const properties: Record<string, Schema> = {}
  const keys = Object.keys(object)
  for (const key of keys) {
    properties[key] = schemaForValue(object[key])
  }
  return {
    type: 'object',
    properties,
    required: keys,
    additionalProperties: false,
  }
}

/**
 * Infer a draft-07 JSON Schema from an example value. Objects require all
 * present keys and forbid extras; arrays union their element schemas.
 */
export function generateSchema(value: JsonValue): Schema {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...schemaForValue(value),
  }
}
