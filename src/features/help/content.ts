import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  FileJson,
  FileText,
  GitCompare,
  ListTree,
  Search,
  Send,
  Wrench,
} from 'lucide-react'

export interface HelpSectionData {
  id: string
  title: string
  icon: LucideIcon
  caption: string
  bullets: string[]
}

/**
 * Content for the in-app user manual (see HelpTrigger/HelpPanel). Each
 * entry's `bullets` are numbered 1..n and matched to the same-numbered
 * callouts inside that section's illustration component — keep them in
 * the order the illustration points them out.
 */
export const HELP_SECTIONS: HelpSectionData[] = [
  {
    id: 'editor',
    title: 'Editor',
    icon: FileJson,
    caption: 'Edit JSON with Monaco, across multiple tabs.',
    bullets: [
      'Type or paste JSON — Monaco highlights syntax errors as you go',
      'Use the toolbar to format, minify, or fix trailing commas',
      'Open several documents at once with tabs at the top',
    ],
  },
  {
    id: 'tree',
    title: 'Tree View',
    icon: ListTree,
    caption: 'Browse and rearrange your JSON as a structural tree.',
    bullets: [
      'Click the caret to expand or collapse a node',
      'Drag a row to reorder it or move it to a new parent',
      'Right-click a node for add/rename/delete actions',
    ],
  },
  {
    id: 'validation',
    title: 'Validation',
    icon: AlertCircle,
    caption: 'Catch errors instantly, with optional JSON Schema checks.',
    bullets: [
      'Syntax and schema errors show up in the Problems list as you type',
      'Attach a JSON Schema to validate structure and types',
      'Click an error to jump straight to it in the editor',
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: Wrench,
    caption: 'One-click transforms for common JSON cleanup.',
    bullets: [
      'Format or minify the whole document',
      'Sort keys alphabetically, recursively',
      'Escape or unescape a JSON string for embedding elsewhere',
    ],
  },
  {
    id: 'diff',
    title: 'Diff',
    icon: GitCompare,
    caption: 'Compare two JSON documents side by side.',
    bullets: [
      'Load or paste a document into each side',
      'Added, removed, and changed lines are highlighted inline',
      'A summary count shows how many keys changed',
    ],
  },
  {
    id: 'query',
    title: 'Query',
    icon: Search,
    caption: 'Extract values with JSONPath expressions.',
    bullets: [
      'Type a JSONPath expression like $.store.book[*].title',
      'Matching values highlight live as you type',
      'Copy the results as JSON',
    ],
  },
  {
    id: 'request',
    title: 'Request client',
    icon: Send,
    caption: 'Build and send HTTP requests, Postman-style.',
    bullets: [
      'Set the method, URL, params, headers, auth, and body',
      'Paste a curl command into the URL bar to import it instantly',
      'Import a Postman collection, or save requests into your own collections',
    ],
  },
  {
    id: 'markdown',
    title: 'Markdown viewer',
    icon: FileText,
    caption: 'Write Markdown with a live, GitHub-flavored preview.',
    bullets: [
      'Edit the source on the left; the preview updates live on the right',
      'Tables, task lists, and code blocks render via GitHub-flavored Markdown',
      'Download as .md, standalone .html, or print to PDF',
    ],
  },
]
