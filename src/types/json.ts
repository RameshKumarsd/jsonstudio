/**
 * Structural JSON types and a small Result helper shared across features.
 */

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export interface JsonObject {
  [key: string]: JsonValue
}
export type JsonArray = JsonValue[]

/**
 * Discriminated result type for operations that can fail without throwing
 * (parsing, validation, transforms). Keeps error handling explicit.
 */
export type Result<T, E = Error> =
  { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })
