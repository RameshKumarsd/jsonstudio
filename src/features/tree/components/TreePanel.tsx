import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useDebouncedParse } from '@/hooks/useDebouncedParse'
import { parseJson } from '@/lib/json/parse'
import { findRangeForPath } from '@/lib/json/locate'
import type { JsonPath } from '@/lib/json/mutate'
import {
  buildTree,
  collectContainerIds,
  type TreeNode,
} from '@/features/tree/lib/buildTree'
import { computeSearchState } from '@/features/tree/lib/search'
import { useTreeActions } from '@/features/tree/hooks/useTreeActions'
import {
  TreeViewProvider,
  type DragInfo,
  type TreeViewValue,
} from '@/features/tree/TreeViewContext'
import { TreeToolbar } from '@/features/tree/components/TreeToolbar'
import { JsonTreeView } from '@/features/tree/components/JsonTreeView'

function topLevelContainerIds(root: TreeNode): Set<string> {
  return new Set(
    root.children?.filter((c) => c.isContainer).map((c) => c.id) ?? [],
  )
}

/**
 * Editable JSON tree kept in perfect sync with Monaco. Owns expand/collapse and
 * search state; all edits flow through useTreeActions back into the document.
 */
export function TreePanel() {
  const controller = useEditorController()
  const actions = useTreeActions()
  const { result } = useDebouncedParse()

  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const { documents, activeId } = useWorkspaceStore.getState()
    const parsed = parseJson(documents[activeId].content)
    if (!parsed.ok) return new Set()
    return topLevelContainerIds(buildTree(parsed.value))
  })
  const dragSource = useRef<DragInfo | null>(null)

  const tree = useMemo(
    () => (result.ok ? buildTree(result.value) : null),
    [result],
  )

  const searchState = useMemo(
    () =>
      tree && searchTerm.trim() ? computeSearchState(tree, searchTerm) : null,
    [tree, searchTerm],
  )

  const reveal = useCallback(
    (path: JsonPath) => {
      const { documents, activeId } = useWorkspaceStore.getState()
      const range = findRangeForPath(documents[activeId].content, path)
      if (range)
        controller.revealRange(range.offset, range.offset + range.length)
    },
    [controller],
  )

  const contextValue = useMemo<TreeViewValue>(
    () => ({
      actions,
      searchTerm,
      isVisible: (node) =>
        searchState ? searchState.visible.has(node.id) : true,
      isExpanded: (node) =>
        searchState ? searchState.expanded.has(node.id) : expanded.has(node.id),
      toggle: (id) =>
        setExpanded((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        }),
      reveal,
      beginDrag: (info) => {
        dragSource.current = info
      },
      dropOn: (target) => {
        const source = dragSource.current
        dragSource.current = null
        if (!source) return
        if (source.parentId !== target.parentId) {
          toast.error('Drag items within the same list or object')
          return
        }
        if (source.index !== target.index) {
          actions.reorder(target.parentPath, source.index, target.index)
        }
      },
    }),
    [actions, searchTerm, searchState, expanded, reveal],
  )

  const expandAll = () => {
    if (tree) setExpanded(new Set(collectContainerIds(tree)))
  }
  const collapseAll = () => setExpanded(new Set())

  return (
    <div className="flex h-full min-w-0 flex-col">
      <TreeToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />
      <div className="min-h-0 flex-1 overflow-auto px-1">
        {!result.ok ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground">
            <AlertTriangle className="size-5 text-warning" />
            <p>Fix JSON syntax to view the tree.</p>
            <p className="text-destructive">{result.error.message}</p>
          </div>
        ) : tree && tree.isContainer ? (
          <TreeViewProvider value={contextValue}>
            <JsonTreeView root={tree} />
          </TreeViewProvider>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
            Document root is a primitive value.
          </div>
        )}
      </div>
    </div>
  )
}
