import type { TreeNode } from '@/features/tree/lib/buildTree'
import { formatPrimitive } from '@/features/tree/lib/nodeValue'

export interface SearchState {
  /** Node ids that should render (matches and their ancestors). */
  visible: Set<string>
  /** Container ids to force-expand (ancestors of matches). */
  expanded: Set<string>
}

function nodeMatches(node: TreeNode, term: string): boolean {
  if (node.key !== null && String(node.key).toLowerCase().includes(term)) {
    return true
  }
  if (!node.isContainer) {
    return formatPrimitive(node.value).toLowerCase().includes(term)
  }
  return false
}

/**
 * Compute which nodes to show for a search term in one traversal. A node is
 * visible if it matches or has a matching descendant; ancestors of matches are
 * force-expanded so the hit is revealed.
 */
export function computeSearchState(
  root: TreeNode,
  rawTerm: string,
): SearchState {
  const term = rawTerm.trim().toLowerCase()
  const visible = new Set<string>()
  const expanded = new Set<string>()

  const walk = (node: TreeNode): boolean => {
    let descendantMatched = false
    for (const child of node.children ?? []) {
      if (walk(child)) descendantMatched = true
    }

    const selfMatched = nodeMatches(node, term)
    const matched = selfMatched || descendantMatched

    if (matched) visible.add(node.id)
    if (descendantMatched && node.isContainer) expanded.add(node.id)

    return matched
  }

  walk(root)
  return { visible, expanded }
}
