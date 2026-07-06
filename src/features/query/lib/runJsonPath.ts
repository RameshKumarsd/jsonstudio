import { JSONPath } from 'jsonpath-plus'
import type { JsonValue } from '@/types/json'

export type JsonPathResult =
  { ok: true; matches: JsonValue[] } | { ok: false; error: string }

/**
 * Evaluate a JSONPath expression against a parsed value. Returns matches or a
 * readable error for invalid expressions.
 */
export function runJsonPath(json: JsonValue, path: string): JsonPathResult {
  const trimmed = path.trim()
  if (!trimmed) return { ok: true, matches: [] }
  try {
    const matches = JSONPath({ path: trimmed, json, wrap: true }) as JsonValue[]
    return { ok: true, matches }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid JSONPath',
    }
  }
}
