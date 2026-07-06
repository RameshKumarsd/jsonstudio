import diff, { type Difference } from 'microdiff'
import { parseJson } from '@/lib/json/parse'

export interface DiffSummary {
  changes: Difference[]
  created: number
  removed: number
  changed: number
}

export type StructuralDiffResult =
  | { ok: true; summary: DiffSummary }
  | { ok: false; error: string; side: 'left' | 'right' }

/**
 * Compute a structural diff between two JSON documents. Both must be valid JSON;
 * the returned summary counts creates/removes/changes and lists each change with
 * its path.
 */
export function structuralDiff(
  leftText: string,
  rightText: string,
): StructuralDiffResult {
  const left = parseJson(leftText)
  if (!left.ok) {
    return { ok: false, error: left.error.message, side: 'left' }
  }
  const right = parseJson(rightText)
  if (!right.ok) {
    return { ok: false, error: right.error.message, side: 'right' }
  }

  const leftObj = toComparable(left.value)
  const rightObj = toComparable(right.value)
  const changes = diff(leftObj, rightObj)

  return {
    ok: true,
    summary: {
      changes,
      created: changes.filter((c) => c.type === 'CREATE').length,
      removed: changes.filter((c) => c.type === 'REMOVE').length,
      changed: changes.filter((c) => c.type === 'CHANGE').length,
    },
  }
}

// microdiff compares objects/arrays; wrap primitives so they diff too.
function toComparable(value: unknown): Record<string, unknown> | unknown[] {
  if (value !== null && typeof value === 'object') {
    return value as Record<string, unknown> | unknown[]
  }
  return { value }
}

/** Render a change's path as a readable dotted string. */
export function formatDiffPath(path: (string | number)[]): string {
  return path.length === 0 ? '(root)' : path.join('.')
}
