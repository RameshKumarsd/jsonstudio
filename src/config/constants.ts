/**
 * App-wide constants. Keep magic strings/numbers here.
 */

export const APP_NAME = 'JSON Studio'

export const STORAGE_KEYS = {
  settings: 'json-studio:settings',
  workspace: 'json-studio:workspace',
  request: 'json-studio:request',
} as const

export const IDB = {
  name: 'json-studio',
  version: 1,
} as const

/** Debounce (ms) applied to live validation / derived recomputation. */
export const VALIDATION_DEBOUNCE_MS = 250

/** Timeout (ms) for remote import requests. */
export const HTTP_TIMEOUT_MS = 15_000

/** Timeout (ms) for requests sent from the HTTP request client. */
export const REQUEST_TIMEOUT_MS = 30_000

/** Maximum number of entries kept in the HTTP request history. */
export const HISTORY_LIMIT = 50
