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

function pathsEqual(a: JsonPath, b: JsonPath): boolean {
  return a.length === b.length && a.every((seg, i) => seg === b[i])
}

/** True if `prefix` is an ancestor-or-equal path of `path`. */
function isPrefix(prefix: JsonPath, path: JsonPath): boolean {
  return (
    prefix.length <= path.length &&
    pathsEqual(prefix, path.slice(0, prefix.length))
  )
}

function uniqueKeyName(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let counter = 2
  while (existing.includes(`${base}${counter}`)) counter += 1
  return `${base}${counter}`
}

// When an array element is removed, indices after it in that array shift down by
// one — adjust a target path that traverses the same array past the removed index.
function adjustPathAfterRemoval(
  fromPath: JsonPath,
  targetPath: JsonPath,
): JsonPath {
  const fromParent = fromPath.slice(0, -1)
  const fromKey = fromPath[fromPath.length - 1]
  if (typeof fromKey !== 'number') return targetPath
  if (
    targetPath.length <= fromParent.length ||
    !pathsEqual(fromParent, targetPath.slice(0, fromParent.length))
  ) {
    return targetPath
  }
  const seg = targetPath[fromParent.length]
  if (typeof seg === 'number' && seg > fromKey) {
    const adjusted = [...targetPath]
    adjusted[fromParent.length] = seg - 1
    return adjusted
  }
  return targetPath
}

/**
 * Move a node to a position within another container (drag-and-drop across
 * parents). Same-parent moves reorder; cross-parent array targets insert at the
 * index, object targets keep the source key (uniquified). No-op when dropping a
 * node into its own subtree.
 */
export function moveNode(
  root: JsonValue,
  fromPath: JsonPath,
  toParentPath: JsonPath,
  toIndex: number,
): JsonValue {
  if (fromPath.length === 0) return root
  if (isPrefix(fromPath, toParentPath)) return root

  const value = getAtPath(root, fromPath)
  if (value === undefined) return root

  const fromParent = fromPath.slice(0, -1)
  const fromKey = fromPath[fromPath.length - 1]

  if (pathsEqual(fromParent, toParentPath)) {
    const parent = getAtPath(root, toParentPath)
    if (!isContainer(parent)) return root
    const fromIndex = Array.isArray(parent)
      ? Number(fromKey)
      : Object.keys(parent).indexOf(String(fromKey))
    return reorderWithinParent(root, toParentPath, fromIndex, toIndex)
  }

  const removed = removeAtPath(root, fromPath)
  const adjustedParent = adjustPathAfterRemoval(fromPath, toParentPath)
  const targetParent = getAtPath(removed, adjustedParent)
  if (!isContainer(targetParent)) return root

  if (Array.isArray(targetParent)) {
    return insertIntoContainer(removed, adjustedParent, toIndex, value)
  }

  const baseKey = typeof fromKey === 'string' ? fromKey : 'item'
  const key = uniqueKeyName(baseKey, Object.keys(targetParent))
  return insertIntoContainer(removed, adjustedParent, key, value)
}
