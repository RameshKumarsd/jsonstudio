import Ajv, { type ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'

export type { ErrorObject }

/**
 * Create a configured Ajv instance. `allErrors` so the panel can show every
 * problem at once; `strict: false` to tolerate real-world schemas.
 */
export function createAjv(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  })
  addFormats(ajv)
  return ajv
}
