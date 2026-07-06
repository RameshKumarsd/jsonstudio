import type { editor } from 'monaco-editor'

export const MONACO_DARK = 'studio-dark'
export const MONACO_LIGHT = 'studio-light'

/**
 * Editor themes tuned to match the app's design tokens. Defined explicitly
 * (rather than relying on built-ins) so the editor chrome matches the shell.
 */
export const studioDark: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'string.key.json', foreground: '7dd3fc' },
    { token: 'string.value.json', foreground: 'a5d6a4' },
    { token: 'number.json', foreground: 'f0a868' },
    { token: 'keyword.json', foreground: 'c792ea' },
  ],
  colors: {
    'editor.background': '#0f1117',
    'editor.foreground': '#e6e6e6',
    'editorLineNumber.foreground': '#4b5563',
    'editorLineNumber.activeForeground': '#9ca3af',
    'editor.selectionBackground': '#2a3350',
    'editor.lineHighlightBackground': '#171a22',
    'editorIndentGuide.background1': '#1f2430',
  },
}

export const studioLight: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'string.key.json', foreground: '0369a1' },
    { token: 'string.value.json', foreground: '15803d' },
    { token: 'number.json', foreground: 'b45309' },
    { token: 'keyword.json', foreground: '7c3aed' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1e293b',
    'editorLineNumber.foreground': '#cbd5e1',
    'editorLineNumber.activeForeground': '#64748b',
    'editor.lineHighlightBackground': '#f8fafc',
  },
}
