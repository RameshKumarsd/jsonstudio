import { describe, expect, it } from 'vitest'
import { renderMarkdownToHtmlDocument } from '@/features/markdown/lib/exportHtml'

describe('renderMarkdownToHtmlDocument', () => {
  it('produces a standalone HTML document with the given title', () => {
    const html = renderMarkdownToHtmlDocument('# Hello', 'My Doc')
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<title>My Doc</title>')
    expect(html).toContain('<h1>Hello</h1>')
  })

  it('escapes the title', () => {
    const html = renderMarkdownToHtmlDocument(
      'body',
      '<script>alert(1)</script>',
    )
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })

  it('renders GFM tables and task lists via remark-gfm', () => {
    const html = renderMarkdownToHtmlDocument(
      '| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] done',
    )
    expect(html).toContain('<table>')
    expect(html).toContain('checked=""')
  })

  it('embeds a self-contained stylesheet (no external dependency)', () => {
    const html = renderMarkdownToHtmlDocument('text')
    expect(html).toContain('<style>')
    expect(html).not.toContain('<link')
  })
})
