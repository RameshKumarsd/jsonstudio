import { toast } from 'sonner'
import {
  Copy,
  Download,
  FileCode,
  FileText,
  Printer,
  Upload,
} from 'lucide-react'
import { ToolbarButton } from '@/components/common/ToolbarButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { copyToClipboard } from '@/lib/browser/clipboard'
import { downloadText, pickTextFile } from '@/lib/browser/file'
import { renderMarkdownToHtmlDocument } from '@/features/markdown/lib/exportHtml'

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton label="Download">
            <Download />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onSelect={() =>
              downloadText(content, 'document.md', 'text/markdown')
            }
          >
            <FileText /> Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              downloadText(
                renderMarkdownToHtmlDocument(content, 'document'),
                'document.html',
                'text/html',
              )
            }
          >
            <FileCode /> HTML (.html)
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              // Browser print dialog — the user picks "Save as PDF" as the
              // destination. A print stylesheet isolates the preview pane
              // (#markdown-print-area) so only the rendered document prints.
              window.print()
            }}
          >
            <Printer /> PDF (via Print)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
