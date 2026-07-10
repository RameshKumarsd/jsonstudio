import type { ComponentType } from 'react'
import { EditorIllustration } from '@/features/help/components/illustrations/EditorIllustration'
import { TreeViewIllustration } from '@/features/help/components/illustrations/TreeViewIllustration'
import { ValidationIllustration } from '@/features/help/components/illustrations/ValidationIllustration'
import { ToolsIllustration } from '@/features/help/components/illustrations/ToolsIllustration'
import { DiffIllustration } from '@/features/help/components/illustrations/DiffIllustration'
import { QueryIllustration } from '@/features/help/components/illustrations/QueryIllustration'
import { RequestIllustration } from '@/features/help/components/illustrations/RequestIllustration'
import { MarkdownIllustration } from '@/features/help/components/illustrations/MarkdownIllustration'

/** id → illustration component, keyed the same as HELP_SECTIONS in content.ts. */
export const HELP_ILLUSTRATIONS: Record<string, ComponentType> = {
  editor: EditorIllustration,
  tree: TreeViewIllustration,
  validation: ValidationIllustration,
  tools: ToolsIllustration,
  diff: DiffIllustration,
  query: QueryIllustration,
  request: RequestIllustration,
  markdown: MarkdownIllustration,
}
