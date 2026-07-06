import { visit } from 'jsonc-parser'
import type { ValidateFunction } from 'ajv'
import type { JsonValue } from '@/types/json'
import type { JsonPath } from '@/lib/json/mutate'
import { findRangeForPath } from '@/lib/json/locate'
import { offsetToLineColumn } from '@/lib/json/position'
import { createAjv, type ErrorObject } from '@/lib/ajv/createAjv'

export type ProblemSeverity = 'error' | 'warning'
export type ProblemSource = 'syntax' | 'schema' | 'lint'

export interface Problem {
  id: string
  severity: ProblemSeverity
  source: ProblemSource
  message: string
  path: JsonPath
  offset: number
  length: number
  line: number
  column: number
}

const ajv = createAjv()
const validatorCache = new Map<
  string,
  { validate?: ValidateFunction; error?: string }
>()

/** Compile (and cache) a validator for the given schema text. */
function getValidator(schemaText: string) {
  const cached = validatorCache.get(schemaText)
  if (cached) return cached

  let entry: { validate?: ValidateFunction; error?: string }
  try {
    const schema = JSON.parse(schemaText) as Record<string, unknown>
    entry = { validate: ajv.compile(schema) }
  } catch (error) {
    entry = {
      error: error instanceof Error ? error.message : 'Invalid schema',
    }
  }
  validatorCache.set(schemaText, entry)
  return entry
}

/** Convert an AJV instancePath ("/a/b/0") into a JsonPath. */
function instancePathToJsonPath(instancePath: string): JsonPath {
  if (!instancePath) return []
  return instancePath
    .split('/')
    .slice(1)
    .map((segment) => {
      const decoded = segment.replace(/~1/g, '/').replace(/~0/g, '~')
      return /^\d+$/.test(decoded) ? Number(decoded) : decoded
    })
}

function makeProblem(
  content: string,
  path: JsonPath,
  message: string,
  severity: ProblemSeverity,
  source: ProblemSource,
): Problem {
  const range = findRangeForPath(content, path)
  const offset = range?.offset ?? 0
  const length = range?.length ?? 1
  const { line, column } = offsetToLineColumn(content, offset)
  return {
    id: `${source}:${path.join('.')}:${message}`,
    severity,
    source,
    message,
    path,
    offset,
    length,
    line,
    column,
  }
}

function mapAjvError(content: string, error: ErrorObject): Problem {
  const path = instancePathToJsonPath(error.instancePath)
  const property =
    error.keyword === 'required' &&
    typeof error.params.missingProperty === 'string'
      ? ` "${error.params.missingProperty}"`
      : ''
  const message = `${error.message ?? 'is invalid'}${property}`
  return makeProblem(content, path, message, 'error', 'schema')
}

/** Detect duplicate object keys (silently dropped by JSON.parse) as warnings. */
export function detectDuplicateKeys(content: string): Problem[] {
  const problems: Problem[] = []
  const scopes: Set<string>[] = []

  visit(content, {
    onObjectBegin: () => {
      scopes.push(new Set())
    },
    onObjectEnd: () => {
      scopes.pop()
    },
    onObjectProperty: (property, offset, length) => {
      const scope = scopes[scopes.length - 1]
      if (!scope) return
      if (scope.has(property)) {
        const { line, column } = offsetToLineColumn(content, offset)
        problems.push({
          id: `lint:dup:${offset}`,
          severity: 'warning',
          source: 'lint',
          message: `Duplicate key "${property}"`,
          path: [],
          offset,
          length,
          line,
          column,
        })
      } else {
        scope.add(property)
      }
    },
  })

  return problems
}

interface CollectArgs {
  content: string
  value: JsonValue
  schemaText: string | null
}

export interface ValidationOutcome {
  problems: Problem[]
  /** True when a schema is attached and the document satisfies it. */
  schemaValid: boolean
  /** Present when the attached schema itself is invalid. */
  schemaError?: string
}

/**
 * Run all validation for a successfully-parsed document: duplicate-key lint plus
 * (if a schema is attached) AJV schema validation. Every problem carries a
 * document offset for editor markers and jump-to-error.
 */
export function collectProblems({
  content,
  value,
  schemaText,
}: CollectArgs): ValidationOutcome {
  const problems: Problem[] = [...detectDuplicateKeys(content)]

  if (!schemaText || !schemaText.trim()) {
    return { problems, schemaValid: false }
  }

  const validator = getValidator(schemaText)
  if (validator.error || !validator.validate) {
    problems.push(
      makeProblem(
        content,
        [],
        `Schema error: ${validator.error ?? 'invalid schema'}`,
        'error',
        'schema',
      ),
    )
    return { problems, schemaValid: false, schemaError: validator.error }
  }

  const valid = validator.validate(value)
  if (!valid && validator.validate.errors) {
    for (const error of validator.validate.errors) {
      problems.push(mapAjvError(content, error))
    }
  }

  return { problems, schemaValid: valid }
}
