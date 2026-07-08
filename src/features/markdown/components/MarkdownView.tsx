import { useState } from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SplitPane } from '@/components/layout/SplitPane'
import { RouteLoader } from '@/components/common/RouteLoader'
import { useSettingsStore } from '@/stores/settingsStore'
import { MarkdownToolbar } from '@/features/markdown/components/MarkdownToolbar'
import { MarkdownStatusBar } from '@/features/markdown/components/MarkdownStatusBar'
import { SAMPLE_MARKDOWN } from '@/features/markdown/lib/sample'

/**
 * Markdown editor + live preview, independent of the JSON document model.
 * Content is local component state (ephemeral, like the Diff view) — there's
 * no workspace tab or persistence for Markdown in v1.
 */
export function MarkdownView() {
  const [content, setContent] = useState(SAMPLE_MARKDOWN)
  const prefs = useSettingsStore((s) => s.editor)

  return (
    <div className="flex h-full flex-col">
      <MarkdownToolbar content={content} onLoad={setContent} />
      <div className="min-h-0 flex-1">
        <SplitPane
          left={
            <Editor
              language="markdown"
              value={content}
              onChange={(next) => setContent(next ?? '')}
              loading={<RouteLoader />}
              options={{
                fontSize: prefs.fontSize,
                tabSize: prefs.tabSize,
                wordWrap: 'on',
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          }
          right={
            <div className="prose h-full max-w-none overflow-auto p-6 dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          }
        />
      </div>
      <MarkdownStatusBar content={content} />
    </div>
  )
}
