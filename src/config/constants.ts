/**
 * App-wide constants. Keep magic strings/numbers here.
 */

export const APP_NAME = 'JSON Studio'

export const STORAGE_KEYS = {
  settings: 'json-studio:settings',
  workspace: 'json-studio:workspace',
} as const

export const IDB = {
  name: 'json-studio',
  version: 1,
} as const

/** Debounce (ms) applied to live validation / derived recomputation. */
export const VALIDATION_DEBOUNCE_MS = 250

/** Timeout (ms) for remote import requests. */
export const HTTP_TIMEOUT_MS = 15_000
