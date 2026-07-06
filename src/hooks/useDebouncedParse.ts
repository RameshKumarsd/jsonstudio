import { useMemo } from 'react'
import { useActiveDocument } from '@/hooks/useActiveDocument'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { parseJson, type JsonParseError } from '@/lib/json/parse'
import { VALIDATION_DEBOUNCE_MS } from '@/config/constants'
import type { JsonValue, Result } from '@/types/json'

interface DebouncedParse {
  /** Debounced document text the parse result corresponds to. */
  content: string
  result: Result<JsonValue, JsonParseError>
}

/**
 * Parse the active document, debounced, so derived consumers (tree, stats,
 * validation) don't re-run on every keystroke in large files. All of them share
 * this one memoized parse.
 */
export function useDebouncedParse(): DebouncedParse {
  const { document } = useActiveDocument()
  const content = useDebouncedValue(document.content, VALIDATION_DEBOUNCE_MS)
  const result = useMemo(() => parseJson(content), [content])
  return { content, result }
}
