import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 720px; margin: 40px auto; padding: 0 20px; }
  h1, h2, h3, h4 { font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.25; }
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 1em 0; }
  a { color: #2563eb; }
  code { background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 4px; font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace; font-size: 0.9em; }
  pre { background: #0f172a; color: #e2e8f0; padding: 1em; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; color: inherit; }
  blockquote { border-left: 4px solid #cbd5e1; margin: 1em 0; padding: 0.25em 1em; color: #64748b; font-style: italic; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e2e8f0; padding: 0.5em 0.75em; text-align: left; }
  th { background: #f8fafc; font-weight: 600; }
  ul, ol { margin: 1em 0; padding-left: 1.5em; }
  li { margin: 0.25em 0; }
  img { max-width: 100%; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
`

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Render Markdown source to a self-contained standalone HTML document (own
 * inline styles, no external stylesheet dependency) using the same
 * ReactMarkdown + remark-gfm pipeline as the live preview, so the exported
 * file matches what's on screen.
 */
export function renderMarkdownToHtmlDocument(
  content: string,
  title = 'Document',
): string {
  const bodyHtml = renderToStaticMarkup(
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>,
  )

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${STYLES}</style>
</head>
<body>
<article>${bodyHtml}</article>
</body>
</html>
`
}
