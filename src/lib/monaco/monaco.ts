/**
 * Canonical Monaco entry point for the app.
 *
 * Importing the full `monaco-editor` package bundles 60+ language grammars.
 * JSON Studio only needs the editor core plus the JSON language, so we import
 * the lean editor API and register just the JSON contribution here. Every other
 * module imports Monaco from THIS file.
 */
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'

export { monaco }
