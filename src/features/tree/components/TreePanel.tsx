import { useCallback, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
import { flattenTree } from '@/features/tree/lib/flatten'
import { computeSearchState } from '@/features/tree/lib/search'
import { useTreeActions } from '@/features/tree/hooks/useTreeActions'
import {
  TreeViewProvider,
  type DragInfo,
  type TreeViewValue,
} from '@/features/tree/TreeViewContext'
import { TreeToolbar } from '@/features/tree/components/TreeToolbar'
import { TreeRow } from '@/features/tree/components/TreeRow'

const ROW_HEIGHT = 28

function topLevelContainerIds(root: TreeNode): Set<string> {
  return new Set(
    root.children?.filter((c) => c.isContainer).map((c) => c.id) ?? [],
  )
}

const samePath = (a: JsonPath, b: JsonPath) =>
  a.length === b.length && a.every((seg, i) => seg === b[i])

/**
 * Editable JSON tree kept in perfect sync with Monaco. Owns expand/collapse and
 * search state; renders a virtualized, flattened row list so very large
 * documents stay responsive. Edits flow through useTreeActions.
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
  const scrollRef = useRef<HTMLDivElement>(null)

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
      if (range) {
        controller.revealRange(range.offset, range.offset + range.length)
      }
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
        if (!source || samePath(source.path, target.path)) return
        if (samePath(source.parentPath, target.parentPath)) {
          if (source.index !== target.index) {
            actions.reorder(target.parentPath, source.index, target.index)
          }
        } else {
          actions.move(source.path, target.parentPath, target.index)
        }
      },
    }),
    [actions, searchTerm, searchState, expanded, reveal],
  )

  const rows = useMemo(() => {
    if (!tree || !tree.isContainer) return []
    return flattenTree(tree, {
      isVisible: contextValue.isVisible,
      isExpanded: contextValue.isExpanded,
    })
  }, [tree, contextValue])

  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer is designed to be called during render
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 16,
  })

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

      {!result.ok ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground">
          <AlertTriangle className="size-5 text-warning" />
          <p>Fix JSON syntax to view the tree.</p>
          <p className="text-destructive">{result.error.message}</p>
        </div>
      ) : tree && tree.isContainer ? (
        <TreeViewProvider value={contextValue}>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-1">
            <div
              style={{
                height: virtualizer.getTotalSize(),
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((item) => {
                const row = rows[item.index]
                return (
                  <div
                    key={row.node.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: item.size,
                      transform: `translateY(${item.start}px)`,
                    }}
                  >
                    <TreeRow row={row} />
                  </div>
                )
              })}
            </div>
          </div>
        </TreeViewProvider>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-muted-foreground">
          Document root is a primitive value.
        </div>
      )}
    </div>
  )
}
