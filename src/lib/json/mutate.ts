import type { JsonValue } from '@/types/json'

/** A path from the document root to a node: object keys and array indices. */
export type JsonPath = (string | number)[]

type Container = Record<string, JsonValue> | JsonValue[]

function isContainer(value: JsonValue | undefined): value is Container {
  return value !== null && value !== undefined && typeof value === 'object'
}

function cloneContainer(node: Container): Container {
  return Array.isArray(node) ? [...node] : { ...node }
}

/** Read the value at `path`, or undefined if any segment is missing. */
export function getAtPath(
  root: JsonValue,
  path: JsonPath,
): JsonValue | undefined {
  let cursor: JsonValue = root
  for (const segment of path) {
    if (!isContainer(cursor)) return undefined
    cursor = (cursor as Record<string, JsonValue>)[segment as string]
    if (cursor === undefined) return undefined
  }
  return cursor
}

/**
 * Immutably replace the value at `path`, cloning only the containers along the
 * path (structural sharing everywhere else).
 */
export function setAtPath(
  root: JsonValue,
  path: JsonPath,
  next: JsonValue,
): JsonValue {
  if (path.length === 0) return next
  if (!isContainer(root)) return root

  const [head, ...rest] = path
  const clone = cloneContainer(root)
  const current = (clone as Record<string, JsonValue>)[head as string]
  ;(clone as Record<string, JsonValue>)[head as string] = setAtPath(
    current,
    rest,
    next,
  )
  return clone
}

/** Immutably remove the node at `path` (array splice or object key delete). */
export function removeAtPath(root: JsonValue, path: JsonPath): JsonValue {
  if (path.length === 0) return root
  const parentPath = path.slice(0, -1)
  const last = path[path.length - 1]
  const parent = getAtPath(root, parentPath)
  if (!isContainer(parent)) return root

  const clone = cloneContainer(parent)
  if (Array.isArray(clone)) {
    clone.splice(Number(last), 1)
  } else {
    delete clone[last as string]
  }
  return setAtPath(root, parentPath, clone)
}

/**
 * Rename an object key while preserving key order. No-op if the parent isn't an
 * object or the new key already exists.
 */
export function renameKeyAtPath(
  root: JsonValue,
  parentPath: JsonPath,
  oldKey: string,
  newKey: string,
): JsonValue {
  if (oldKey === newKey) return root
  const parent = getAtPath(root, parentPath)
  if (parent === undefined || Array.isArray(parent) || !isContainer(parent)) {
    return root
  }
  const obj = parent as Record<string, JsonValue>
  if (!(oldKey in obj) || newKey in obj) return root

  const rebuilt: Record<string, JsonValue> = {}
  for (const key of Object.keys(obj)) {
    rebuilt[key === oldKey ? newKey : key] = obj[key]
  }
  return setAtPath(root, parentPath, rebuilt)
}

/** Insert/append a value into the container at `parentPath`. */
export function insertIntoContainer(
  root: JsonValue,
  parentPath: JsonPath,
  keyOrIndex: string | number,
  value: JsonValue,
): JsonValue {
  const parent = getAtPath(root, parentPath)
  if (!isContainer(parent)) return root

  const clone = cloneContainer(parent)
  if (Array.isArray(clone)) {
    const index = typeof keyOrIndex === 'number' ? keyOrIndex : clone.length
    clone.splice(index, 0, value)
  } else {
    clone[String(keyOrIndex)] = value
  }
  return setAtPath(root, parentPath, clone)
}

/**
 * Reorder a child within its parent container (array items or object keys).
 * Used for drag-and-drop between siblings.
 */
export function reorderWithinParent(
  root: JsonValue,
  parentPath: JsonPath,
  fromIndex: number,
  toIndex: number,
): JsonValue {
  const parent = getAtPath(root, parentPath)
  if (!isContainer(parent)) return root
  if (fromIndex === toIndex) return root

  if (Array.isArray(parent)) {
    const clone = [...parent]
    const [moved] = clone.splice(fromIndex, 1)
    clone.splice(toIndex, 0, moved)
    return setAtPath(root, parentPath, clone)
  }

  const entries = Object.entries(parent)
  const [moved] = entries.splice(fromIndex, 1)
  entries.splice(toIndex, 0, moved)
  return setAtPath(root, parentPath, Object.fromEntries(entries))
}
