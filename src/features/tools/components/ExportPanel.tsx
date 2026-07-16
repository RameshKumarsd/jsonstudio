import { Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useActiveDocument } from '@/hooks/useActiveDocument'
import { parseJson } from '@/lib/json/parse'
import { copyToClipboard } from '@/lib/browser/clipboard'
import { downloadText } from '@/lib/browser/file'
import { toCsv, toYaml } from '@/features/tools/lib/convert'

interface ExportFormat {
  label: string
  filename: string
  mimeType: string
  convert: (documentContent: string) => { ok: true; text: string } | { ok: false; error: string }
}

const FORMATS: ExportFormat[] = [
  {
    label: 'YAML',
    filename: 'document.yaml',
    mimeType: 'text/yaml',
    convert: (content) => {
      const parsed = parseJson(content)
      if (!parsed.ok) return { ok: false, error: parsed.error.message }
      return { ok: true, text: toYaml(parsed.value) }
    },
  },
  {
    label: 'CSV',
    filename: 'document.csv',
    mimeType: 'text/csv',
    convert: (content) => {
      const parsed = parseJson(content)
      if (!parsed.ok) return { ok: false, error: parsed.error.message }
      const csv = toCsv(parsed.value)
      if (!csv.ok) return { ok: false, error: csv.error }
      return { ok: true, text: csv.value }
    },
  },
]

/**
 * Convert the active document to CSV/YAML for copy/download. Unlike the
 * Transform tools, this never overwrites the live JSON document — the output
 * usually isn't valid JSON, and Tree View/Validation/Query all assume it is.
 */
export function ExportPanel() {
  const { document } = useActiveDocument()

  const run = (format: ExportFormat, action: 'copy' | 'download') => {
    const result = format.convert(document.content)
    if (!result.ok) {
      toast.error(`Could not convert to ${format.label}`, {
        description: result.error,
      })
      return
    }
    if (action === 'copy') {
      void copyToClipboard(result.text)
      toast.success(`Copied as ${format.label}`)
    } else {
      downloadText(result.text, format.filename, format.mimeType)
    }
  }

  return (
    <div className="space-y-2">
      {FORMATS.map((format) => (
        <div key={format.label} className="flex items-center gap-2">
          <span className="w-14 text-xs text-muted-foreground">
            {format.label}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start"
            onClick={() => run(format, 'copy')}
          >
            <Copy /> Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start"
            onClick={() => run(format, 'download')}
          >
            <Download /> Download
          </Button>
        </div>
      ))}
    </div>
  )
}
