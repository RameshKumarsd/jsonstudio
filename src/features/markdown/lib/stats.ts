export interface MarkdownStats {
  words: number
  characters: number
  readingTimeMinutes: number
}

const WORDS_PER_MINUTE = 200

/** Word/character count and estimated reading time for Markdown source text. */
export function computeMarkdownStats(text: string): MarkdownStats {
  const trimmed = text.trim()
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
  const readingTimeMinutes =
    words === 0 ? 0 : Math.max(1, Math.round(words / WORDS_PER_MINUTE))

  return { words, characters: text.length, readingTimeMinutes }
}
