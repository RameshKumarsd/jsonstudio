import { createContext, useContext } from 'react'
import type { TreeActions } from '@/features/tree/hooks/useTreeActions'
import type { TreeNode } from '@/features/tree/lib/buildTree'
import type { JsonPath } from '@/lib/json/mutate'

export interface DragInfo {
  parentId: string
  parentPath: JsonPath
  index: number
}

export interface TreeViewValue {
  actions: TreeActions
  searchTerm: string
  /** Whether a node's children should render (respects search + user toggles). */
  isExpanded: (node: TreeNode) => boolean
  toggle: (id: string) => void
  /** Whether a node is visible under the current search filter. */
  isVisible: (node: TreeNode) => boolean
  /** Scroll to and select the node's text in Monaco. */
  reveal: (path: JsonPath) => void
  beginDrag: (info: DragInfo) => void
  dropOn: (target: DragInfo) => void
}

const TreeViewContext = createContext<TreeViewValue | null>(null)

export const TreeViewProvider = TreeViewContext.Provider

export function useTreeView(): TreeViewValue {
  const value = useContext(TreeViewContext)
  if (!value) {
    throw new Error('useTreeView must be used within a TreeViewProvider')
  }
  return value
}
