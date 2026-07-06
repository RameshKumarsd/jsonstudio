import { err, ok, type JsonValue, type Result } from '@/types/json'
import { parseJson, type JsonParseError } from '@/lib/json/parse'

export type TransformError = JsonParseError

type Transform = (
  text: string,
  indent?: number,
) => Result<string, TransformError>

const DEFAULT_INDENT = 2

/** Run `fn` against parsed JSON, threading parse errors through as a Result. */
function withParsed(
  text: string,
  fn: (value: JsonValue) => string,
): Result<string, TransformError> {
  const parsed = parseJson(text)
  if (!parsed.ok) return parsed
  return ok(fn(parsed.value))
}

/** Pretty-print with the given indent (default 2 spaces). */
export const format: Transform = (text, indent = DEFAULT_INDENT) =>
  withParsed(text, (value) => JSON.stringify(value, null, indent))

/** Alias kept explicit for the toolbar's "Beautify" action. */
export const beautify: Transform = (text, indent = DEFAULT_INDENT) =>
  format(text, indent)

/** Collapse to a single line with no insignificant whitespace. */
export const minify: Transform = (text) =>
  withParsed(text, (value) => JSON.stringify(value))

/** Recursively sort object keys alphabetically; arrays keep their order. */
export const sortKeys: Transform = (text, indent = DEFAULT_INDENT) =>
  withParsed(text, (value) =>
    JSON.stringify(sortValueKeys(value), null, indent),
  )

function sortValueKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortValueKeys)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, JsonValue>>((acc, key) => {
        acc[key] = sortValueKeys(value[key])
        return acc
      }, {})
  }
  return value
}

function isEmptyValue(value: JsonValue): boolean {
  if (value === null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Recursively drop null, empty string, empty array, and empty object members.
 * Containers that become empty after pruning are removed too.
 */
export const removeEmptyValues: Transform = (text, indent = DEFAULT_INDENT) =>
  withParsed(text, (value) => JSON.stringify(pruneEmpty(value), null, indent))

function pruneEmpty(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(pruneEmpty).filter((item) => !isEmptyValue(item))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, JsonValue>>(
      (acc, [key, child]) => {
        const pruned = pruneEmpty(child)
        if (!isEmptyValue(pruned)) acc[key] = pruned
        return acc
      },
      {},
    )
  }
  return value
}

/**
 * Normalize duplicate object keys (last occurrence wins). Re-serializing parsed
 * JSON already collapses duplicates, so this is an explicit, named round-trip.
 */
export const removeDuplicateKeys: Transform = (text, indent = DEFAULT_INDENT) =>
  withParsed(text, (value) => JSON.stringify(value, null, indent))

/**
 * Flatten nested structures into a single-level object keyed by path, using dot
 * notation for object keys and `[i]` for array indices.
 */
export const flatten: Transform = (text, indent = DEFAULT_INDENT) =>
  withParsed(text, (value) => JSON.stringify(flattenValue(value), null, indent))

function flattenValue(value: JsonValue): Record<string, JsonValue> {
  const result: Record<string, JsonValue> = {}

  const walk = (node: JsonValue, path: string): void => {
    if (Array.isArray(node)) {
      if (node.length === 0) {
        if (path) result[path] = []
        return
      }
      node.forEach((item, index) => walk(item, `${path}[${index}]`))
      return
    }
    if (node !== null && typeof node === 'object') {
      const keys = Object.keys(node)
      if (keys.length === 0) {
        if (path) result[path] = {}
        return
      }
      keys.forEach((key) => {
        const childPath = path ? `${path}.${key}` : key
        walk(node[key], childPath)
      })
      return
    }
    result[path] = node
  }

  walk(value, '')
  return result
}

/** Inverse of `flatten`: expand dot/bracket paths back into nested structures. */
export const unflatten: Transform = (text, indent = DEFAULT_INDENT) =>
  withParsed(text, (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return JSON.stringify(value, null, indent)
    }
    return JSON.stringify(unflattenObject(value), null, indent)
  })

interface PathSegment {
  key: string
  isIndex: boolean
}

function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = []
  const regex = /[^.[\]]+|\[(\d+)\]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(path)) !== null) {
    if (match[1] !== undefined) {
      segments.push({ key: match[1], isIndex: true })
    } else {
      segments.push({ key: match[0], isIndex: false })
    }
  }
  return segments
}

// A structural container we mutate while rebuilding. Arrays accept numeric
// string keys at runtime (`arr["0"] = x`) and still serialize as arrays.
type Container = Record<string, JsonValue>

const asContainer = (value: JsonValue): Container =>
  value as unknown as Container

function unflattenObject(flat: Record<string, JsonValue>): JsonValue {
  const root: JsonValue = {}

  for (const [path, value] of Object.entries(flat)) {
    const segments = parsePath(path)
    let cursor = asContainer(root)

    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        cursor[segment.key] = value
        return
      }
      if (cursor[segment.key] === undefined) {
        cursor[segment.key] = segments[index + 1].isIndex ? [] : {}
      }
      cursor = asContainer(cursor[segment.key])
    })
  }

  return root
}

/** Wrap the document as an escaped JSON string literal. */
export function escapeJson(text: string): Result<string, TransformError> {
  return ok(JSON.stringify(text))
}

/** Reverse `escapeJson`: interpret the document as a quoted JSON string. */
export function unescapeJson(text: string): Result<string, TransformError> {
  const trimmed = text.trim()
  const parsed = parseJson(trimmed)
  if (!parsed.ok) return parsed
  if (typeof parsed.value !== 'string') {
    return err({
      message: 'Document is not an escaped JSON string',
      offset: 0,
      length: trimmed.length,
    })
  }
  return ok(parsed.value)
}
