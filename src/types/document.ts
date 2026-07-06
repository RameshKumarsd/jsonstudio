/**
 * A single JSON document in the workspace. `content` (the raw text) is the
 * single source of truth; the tree, validation errors, and statistics are all
 * derived from it.
 */
export interface JsonDocument {
  id: string
  name: string
  content: string
  /** Optional JSON Schema text this document is validated against. */
  schema: string | null
  createdAt: number
  updatedAt: number
}
