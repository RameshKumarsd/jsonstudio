import type { JsonValue } from '@/types/json'
import type { JsonNodeType } from '@/features/tree/lib/buildTree'

/** Display text for a primitive node value. */
export function formatPrimitive(value: JsonValue): string {
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

/** Short summary shown next to a collapsed container. */
export function containerSummary(value: JsonValue): string {
  if (Array.isArray(value)) {
    return `[] ${value.length} ${value.length === 1 ? 'item' : 'items'}`
  }
  if (value !== null && typeof value === 'object') {
    const count = Object.keys(value).length
    return `{} ${count} ${count === 1 ? 'key' : 'keys'}`
  }
  return ''
}

/**
 * Interpret user input from the inline editor. Tries JSON first (so `true`, `42`,
 * `null`, and `"quoted"` become their real types); otherwise treats the raw text
 * as a string.
 */
export function parseValueInput(input: string): JsonValue {
  const trimmed = input.trim()
  try {
    return JSON.parse(trimmed) as JsonValue
  } catch {
    return input
  }
}

/** Raw (unquoted) editable text for a primitive value. */
export function primitiveEditText(value: JsonValue): string {
  return typeof value === 'string' ? value : String(value)
}

/** Tailwind text color token per node type, for syntax-colored values. */
export function valueColorClass(type: JsonNodeType): string {
  switch (type) {
    case 'string':
      return 'text-success'
    case 'number':
      return 'text-warning'
    case 'boolean':
      return 'text-primary'
    case 'null':
      return 'text-muted-foreground'
    default:
      return 'text-foreground'
  }
}
