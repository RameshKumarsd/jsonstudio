export interface LineColumn {
  /** 1-based line number. */
  line: number
  /** 1-based column number. */
  column: number
}

/**
 * Convert a character offset into a 1-based line/column pair. Framework-free so
 * it works in panels and tests without a Monaco model.
 */
export function offsetToLineColumn(text: string, offset: number): LineColumn {
  const clamped = Math.max(0, Math.min(offset, text.length))
  let line = 1
  let lastNewline = -1
  for (let i = 0; i < clamped; i++) {
    if (text.charCodeAt(i) === 10 /* \n */) {
      line++
      lastNewline = i
    }
  }
  return { line, column: clamped - lastNewline }
}
