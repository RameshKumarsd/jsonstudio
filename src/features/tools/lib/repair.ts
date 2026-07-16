import { jsonrepair, JSONRepairError } from 'jsonrepair'
import { err, ok, type Result } from '@/types/json'
import { parseJson, type JsonParseError } from '@/lib/json/parse'

export type RepairError = JsonParseError

/**
 * Attempt to fix common JSON mistakes (trailing commas, single-quoted
 * strings, unquoted keys, JS-style comments, ...), then re-parse and
 * pretty-print through the normal JSON pipeline so the result matches this
 * app's formatting.
 */
export function repairJson(
  text: string,
  indent = 2,
): Result<string, RepairError> {
  let repaired: string
  try {
    repaired = jsonrepair(text)
  } catch (error) {
    if (error instanceof JSONRepairError) {
      return err({ message: error.message, offset: error.position, length: 1 })
    }
    return err({
      message: 'Could not repair this document',
      offset: 0,
      length: text.length,
    })
  }

  const parsed = parseJson(repaired)
  if (!parsed.ok) return parsed
  return ok(JSON.stringify(parsed.value, null, indent))
}
