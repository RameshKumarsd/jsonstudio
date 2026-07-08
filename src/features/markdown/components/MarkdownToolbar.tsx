import { toast } from 'sonner'
import { Copy, Download, Upload } from 'lucide-react'
import { ToolbarButton } from '@/components/common/ToolbarButton'
import { copyToClipboard } from '@/lib/browser/clipboard'
import { downloadText, pickTextFile } from '@/lib/browser/file'

interface MarkdownToolbarProps {
  content: string
  onLoad: (content: string) => void
}

export function MarkdownToolbar({ content, onLoad }: MarkdownToolbarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-0.5 border-b px-2">
      <ToolbarButton
        label="Upload"
        onClick={async () => {
          const picked = await pickTextFile('.md,text/markdown,text/plain')
          if (picked) {
            onLoad(picked.content)
            toast.success(`Loaded ${picked.name}`)
          }
        }}
      >
        <Upload />
      </ToolbarButton>
      <ToolbarButton
        label="Download"
        onClick={() => downloadText(content, 'document.md', 'text/markdown')}
      >
        <Download />
      </ToolbarButton>
      <ToolbarButton
        label="Copy"
        onClick={() => {
          void copyToClipboard(content)
          toast.success('Copied to clipboard')
        }}
      >
        <Copy />
      </ToolbarButton>
    </div>
  )
}
