/**
 * Type shims for Monaco's deep ESM entry points.
 *
 * We import the lean editor API and the JSON language contribution by subpath
 * to avoid bundling every language grammar. Those subpaths ship `.d.ts` files
 * but aren't surfaced through the package's `exports` "types" condition under
 * bundler resolution, so we map them to the main declarations here. This only
 * affects type-checking; Vite still resolves the real lean modules at build.
 */
declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor'
}

declare module 'monaco-editor/esm/vs/language/json/monaco.contribution'
