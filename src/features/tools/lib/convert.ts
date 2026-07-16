import { dump } from 'js-yaml'
import { err, ok, type JsonValue, type Result } from '@/types/json'

/** Serialize a JSON value as YAML. */
export function toYaml(value: JsonValue): string {
  return dump(value)
}

function isPlainObject(
  value: JsonValue,
): value is Record<string, JsonValue> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function csvCell(value: JsonValue): string {
  const text =
    value === undefined || value === null
      ? ''
      : typeof value === 'string'
        ? value
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value)

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Convert an array of flat records into CSV text (header row + one row per
 * element, union of keys across all elements). Nested object/array values are
 * inlined as JSON text rather than rejected outright. Only accepts a
 * non-empty array of plain objects — anything else is ambiguous as a table.
 */
export function toCsv(value: JsonValue): Result<string, string> {
  if (!Array.isArray(value)) {
    return err('Only an array of objects can be converted to CSV')
  }
  if (value.length === 0) {
    return err('Cannot convert an empty array to CSV')
  }
  if (!value.every(isPlainObject)) {
    return err('Every element must be an object to convert to CSV')
  }

  const keys: string[] = []
  const seen = new Set<string>()
  for (const row of value) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        keys.push(key)
      }
    }
  }

  const lines = [keys.map(csvCell).join(',')]
  for (const row of value) {
    lines.push(keys.map((key) => csvCell(row[key])).join(','))
  }

  return ok(`${lines.join('\r\n')}\r\n`)
}
