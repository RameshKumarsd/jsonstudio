import {
  parse as parseJsonc,
  printParseErrorCode,
  type ParseError,
} from 'jsonc-parser'
import { err, ok, type JsonValue, type Result } from '@/types/json'

export interface JsonParseError {
  message: string
  /** Character offset into the source text where the error begins. */
  offset: number
  length: number
}

/**
 * Parse strict JSON, returning a Result rather than throwing. Uses jsonc-parser
 * so we get an exact character offset for the first error (mapped to editor
 * markers and tree highlighting elsewhere).
 */
export function parseJson(text: string): Result<JsonValue, JsonParseError> {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return err({ message: 'Document is empty', offset: 0, length: 0 })
  }

  const errors: ParseError[] = []
  const value = parseJsonc(text, errors, {
    allowTrailingComma: false,
    disallowComments: true,
  }) as JsonValue

  if (errors.length > 0) {
    const first = errors[0]
    return err({
      message: printParseErrorCode(first.error),
      offset: first.offset,
      length: first.length,
    })
  }

  return ok(value)
}

/** Convenience guard: is the text valid strict JSON? */
export function isValidJson(text: string): boolean {
  return parseJson(text).ok
}
