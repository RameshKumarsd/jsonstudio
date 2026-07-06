import type { JsonValue } from '@/types/json'

export interface JsonStatistics {
  /** UTF-8 byte length of the source text. */
  fileSizeBytes: number
  /** Total number of nodes (every value, including primitives). */
  nodeCount: number
  /** Maximum nesting depth (root object/array = 1). */
  depth: number
  arrayCount: number
  objectCount: number
  /** Total number of object keys across the document. */
  keyCount: number
}

const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

function byteLength(text: string): number {
  if (encoder) return encoder.encode(text).length
  // Fallback for environments without TextEncoder.
  return unescape(encodeURIComponent(text)).length
}

/**
 * Compute structural statistics for a parsed JSON value plus the byte size of
 * its source text. Single traversal; safe for deeply nested input.
 */
export function computeStatistics(
  value: JsonValue,
  sourceText: string,
): JsonStatistics {
  const stats: JsonStatistics = {
    fileSizeBytes: byteLength(sourceText),
    nodeCount: 0,
    depth: 0,
    arrayCount: 0,
    objectCount: 0,
    keyCount: 0,
  }

  const walk = (node: JsonValue, depth: number): void => {
    stats.nodeCount++
    if (depth > stats.depth) stats.depth = depth

    if (Array.isArray(node)) {
      stats.arrayCount++
      for (const item of node) walk(item, depth + 1)
      return
    }
    if (node !== null && typeof node === 'object') {
      stats.objectCount++
      const keys = Object.keys(node)
      stats.keyCount += keys.length
      for (const key of keys) walk(node[key], depth + 1)
    }
  }

  walk(value, 1)
  return stats
}

/** Human-readable byte size (e.g. "1.4 KB"). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}
