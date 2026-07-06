import { TreeNodeRow } from '@/features/tree/components/TreeNodeRow'
import type { TreeNode } from '@/features/tree/lib/buildTree'

/**
 * Renders the root's children as tree rows. The root itself is implicit, so the
 * top-level keys/items are always shown; nesting is controlled per node.
 */
export function JsonTreeView({ root }: { root: TreeNode }) {
  return (
    <div className="py-1">
      {root.children?.map((child, index) => (
        <TreeNodeRow
          key={child.id}
          node={child}
          depth={0}
          index={index}
          parentId={root.id}
          parentPath={root.path}
          parentType={root.type === 'array' ? 'array' : 'object'}
        />
      ))}
    </div>
  )
}
