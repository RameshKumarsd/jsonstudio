import { useState, type DragEvent } from 'react'
import {
  ChevronRight,
  Copy,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/browser/clipboard'
import type { JsonValue } from '@/types/json'
import type { JsonPath } from '@/lib/json/mutate'
import { useTreeView } from '@/features/tree/TreeViewContext'
import type { TreeNode } from '@/features/tree/lib/buildTree'
import {
  containerSummary,
  formatPrimitive,
  parseValueInput,
  primitiveEditText,
  valueColorClass,
} from '@/features/tree/lib/nodeValue'
import { InlineEdit } from '@/features/tree/components/InlineEdit'

interface TreeNodeRowProps {
  node: TreeNode
  depth: number
  index: number
  parentId: string
  parentPath: JsonPath
  parentType: 'object' | 'array' | 'root'
}

const INDENT_PX = 14

function uniqueKey(existing: string[]): string {
  const base = 'newKey'
  let candidate = base
  let counter = 1
  while (existing.includes(candidate)) {
    counter += 1
    candidate = `${base}${counter}`
  }
  return candidate
}

export function TreeNodeRow({
  node,
  depth,
  index,
  parentId,
  parentPath,
  parentType,
}: TreeNodeRowProps) {
  const { actions, isExpanded, toggle, isVisible, reveal, beginDrag, dropOn } =
    useTreeView()

  const [editingKey, setEditingKey] = useState(false)
  const [editingValue, setEditingValue] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  if (!isVisible(node)) return null

  const expanded = isExpanded(node)
  const canRenameKey = parentType === 'object' && typeof node.key === 'string'
  const dragInfo = { parentId, parentPath, index }

  const addChild = (value: JsonValue) => {
    if (node.type === 'array') {
      actions.addChild(node.path, (node.value as JsonValue[]).length, value)
    } else if (node.type === 'object') {
      const key = uniqueKey(
        Object.keys(node.value as Record<string, JsonValue>),
      )
      actions.addChild(node.path, key, value)
    }
    if (!expanded) toggle(node.id)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    dropOn(dragInfo)
  }

  return (
    <div>
      <div
        draggable={!editingKey && !editingValue}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move'
          beginDrag(dragInfo)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{ paddingLeft: depth * INDENT_PX }}
        className={cn(
          'group flex h-7 items-center gap-1 rounded-sm pr-1 text-xs hover:bg-accent/60',
          dragOver && 'border-t-2 border-primary',
        )}
      >
        <GripVertical className="size-3 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 group-hover:opacity-100" />

        {node.isContainer ? (
          <button
            type="button"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => toggle(node.id)}
            className="flex size-4 shrink-0 items-center justify-center rounded hover:bg-accent"
          >
            <ChevronRight
              className={cn(
                'size-3.5 transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}

        {/* Key */}
        {node.key !== null &&
          (editingKey ? (
            <InlineEdit
              aria-label="Rename key"
              initial={String(node.key)}
              onCommit={(next) => {
                setEditingKey(false)
                if (next && next !== node.key) {
                  actions.renameKey(parentPath, String(node.key), next)
                }
              }}
              onCancel={() => setEditingKey(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => reveal(node.path)}
              onDoubleClick={() => canRenameKey && setEditingKey(true)}
              className={cn(
                'shrink-0 font-mono',
                parentType === 'array'
                  ? 'text-muted-foreground'
                  : 'text-foreground',
              )}
            >
              {parentType === 'array' ? node.key : `"${node.key}"`}
            </button>
          ))}

        {node.key !== null && <span className="text-muted-foreground">:</span>}

        {/* Value */}
        {node.isContainer ? (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            className="shrink-0 font-mono text-muted-foreground"
          >
            {containerSummary(node.value)}
          </button>
        ) : editingValue ? (
          <InlineEdit
            aria-label="Edit value"
            initial={primitiveEditText(node.value)}
            onCommit={(next) => {
              setEditingValue(false)
              actions.setValue(node.path, parseValueInput(next))
            }}
            onCancel={() => setEditingValue(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => reveal(node.path)}
            onDoubleClick={() => setEditingValue(true)}
            className={cn('truncate font-mono', valueColorClass(node.type))}
          >
            {formatPrimitive(node.value)}
          </button>
        )}

        {/* Row actions */}
        <div className="ml-auto opacity-0 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                aria-label="Node actions"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {node.isContainer && (
                <>
                  <DropdownMenuLabel>Add</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => addChild('')}>
                    <Plus /> Value
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => addChild({})}>
                    <Plus /> Object
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => addChild([])}>
                    <Plus /> Array
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {canRenameKey && (
                <DropdownMenuItem onSelect={() => setEditingKey(true)}>
                  <Pencil /> Rename key
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={() => {
                  void copyToClipboard(JSON.stringify(node.value, null, 2))
                  toast.success('Node copied')
                }}
              >
                <Copy /> Copy
              </DropdownMenuItem>
              {node.path.length > 0 && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => actions.deleteNode(node.path)}
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {node.isContainer &&
        expanded &&
        node.children?.map((child, childIndex) => (
          <TreeNodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            index={childIndex}
            parentId={node.id}
            parentPath={node.path}
            parentType={node.type === 'array' ? 'array' : 'object'}
          />
        ))}
    </div>
  )
}
