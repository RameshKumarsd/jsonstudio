import type { TreeNode } from '@/features/tree/lib/buildTree'
import type { JsonPath } from '@/lib/json/mutate'

export type ParentKind = 'object' | 'array' | 'root'

export interface FlatRow {
  node: TreeNode
  depth: number
  /** Position among its siblings. */
  index: number
  parentId: string
  parentPath: JsonPath
  parentType: ParentKind
}

interface FlattenOptions {
  isExpanded: (node: TreeNode) => boolean
  isVisible: (node: TreeNode) => boolean
}

function kindOf(node: TreeNode): ParentKind {
  if (node.type === 'array') return 'array'
  if (node.type === 'object') return 'object'
  return 'root'
}

/**
 * Flatten the visible tree into an ordered list of rows for virtualization.
 * Honors search visibility and expand/collapse state, so only rows that would
 * actually render are produced.
 */
export function flattenTree(
  root: TreeNode,
  options: FlattenOptions,
): FlatRow[] {
  const rows: FlatRow[] = []

  const walk = (parent: TreeNode, depth: number) => {
    const parentType = kindOf(parent)
    parent.children?.forEach((node, index) => {
      if (!options.isVisible(node)) return
      rows.push({
        node,
        depth,
        index,
        parentId: parent.id,
        parentPath: parent.path,
        parentType,
      })
      if (node.isContainer && options.isExpanded(node)) {
        walk(node, depth + 1)
      }
    })
  }

  walk(root, 0)
  return rows
}
