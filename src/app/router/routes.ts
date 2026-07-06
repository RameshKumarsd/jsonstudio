import type { LucideIcon } from 'lucide-react'
import { FileJson, GitCompare, Search } from 'lucide-react'

export const ROUTES = {
  editor: '/editor',
  diff: '/diff',
  query: '/query',
} as const

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  description: string
}

/**
 * Primary navigation, consumed by the sidebar. Single source so nav and routes
 * never drift apart.
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    label: 'Editor',
    to: ROUTES.editor,
    icon: FileJson,
    description: 'Edit, format, and validate JSON',
  },
  {
    label: 'Diff',
    to: ROUTES.diff,
    icon: GitCompare,
    description: 'Compare two documents',
  },
  {
    label: 'Query',
    to: ROUTES.query,
    icon: Search,
    description: 'Run JSONPath queries',
  },
]
