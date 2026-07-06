import { findNodeAtLocation, parseTree } from 'jsonc-parser'
import type { JsonPath } from '@/lib/json/mutate'

export interface OffsetRange {
  offset: number
  length: number
}

/**
 * Find the character range of the value at `path` within `text`, using the
 * jsonc AST. Returns null when the path can't be located.
 */
export function findRangeForPath(
  text: string,
  path: JsonPath,
): OffsetRange | null {
  const root = parseTree(text)
  if (!root) return null
  const node = findNodeAtLocation(root, path as (string | number)[])
  if (!node) return null
  return { offset: node.offset, length: node.length }
}
