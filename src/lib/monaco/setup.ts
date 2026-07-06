import { loader } from '@monaco-editor/react'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { monaco } from '@/lib/monaco/monaco'
import {
  MONACO_DARK,
  MONACO_LIGHT,
  studioDark,
  studioLight,
} from '@/lib/monaco/themes'

let initialized = false

/**
 * Wire Monaco to Vite-bundled web workers (no CDN fetch), bind
 * `@monaco-editor/react` to the local `monaco` instance, register app themes,
 * and configure JSON language diagnostics. Idempotent.
 */
export function setupMonaco(): void {
  if (initialized) return
  initialized = true

  self.MonacoEnvironment = {
    getWorker(_workerId, label) {
      if (label === 'json') return new JsonWorker()
      return new EditorWorker()
    },
  }

  loader.config({ monaco })

  monaco.editor.defineTheme(MONACO_DARK, studioDark)
  monaco.editor.defineTheme(MONACO_LIGHT, studioLight)

  // Monaco's bundled JSON worker validates syntax out of the box. Schema-aware
  // diagnostics are configured in the validation feature (AJV-driven).
}
