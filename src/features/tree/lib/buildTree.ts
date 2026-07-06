import type { JsonValue } from '@/types/json'
import type { JsonPath } from '@/lib/json/mutate'

export type JsonNodeType =
  'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

export interface TreeNode {
  /** Stable id derived from the path; used as React key and selection id. */
  id: string
  path: JsonPath
  /** Object key, array index, or null for the root. */
  key: string | number | null
  value: JsonValue
  type: JsonNodeType
  children?: TreeNode[]
  /** True for objects/arrays. */
  isContainer: boolean
}

export function getNodeType(value: JsonValue): JsonNodeType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  const type = typeof value
  if (type === 'object') return 'object'
  return type as 'string' | 'number' | 'boolean'
}

function pathId(path: JsonPath): string {
  return path.length === 0 ? '$' : `$.${path.join('.')}`
}

/** Build a display tree from a parsed JSON value. */
export function buildTree(value: JsonValue): TreeNode {
  const build = (
    node: JsonValue,
    key: string | number | null,
    path: JsonPath,
  ): TreeNode => {
    const type = getNodeType(node)
    const isContainer = type === 'object' || type === 'array'

    const treeNode: TreeNode = {
      id: pathId(path),
      path,
      key,
      value: node,
      type,
      isContainer,
    }

    if (type === 'array') {
      treeNode.children = (node as JsonValue[]).map((item, index) =>
        build(item, index, [...path, index]),
      )
    } else if (type === 'object') {
      treeNode.children = Object.entries(node as Record<string, JsonValue>).map(
        ([childKey, childValue]) =>
          build(childValue, childKey, [...path, childKey]),
      )
    }

    return treeNode
  }

  return build(value, null, [])
}

/** Collect the ids of every container node (for expand-all). */
export function collectContainerIds(root: TreeNode): string[] {
  const ids: string[] = []
  const walk = (node: TreeNode) => {
    if (node.isContainer) {
      ids.push(node.id)
      node.children?.forEach(walk)
    }
  }
  walk(root)
  return ids
}

/** Count total descendants of a container node (for summary labels). */
export function countDescendants(node: TreeNode): number {
  if (!node.children) return 0
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0,
  )
}
