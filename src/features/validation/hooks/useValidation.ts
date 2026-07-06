import { useEffect, useMemo } from 'react'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useActiveDocument } from '@/hooks/useActiveDocument'
import { useDebouncedParse } from '@/hooks/useDebouncedParse'
import { offsetToLineColumn } from '@/lib/json/position'
import { useValidationStore } from '@/features/validation/validationStore'
import {
  collectProblems,
  type Problem,
} from '@/features/validation/lib/validate'
import type { EditorMarker } from '@/features/editor/types'

/**
 * Real-time validation runner. Mounted once inside the editor providers, it
 * derives problems from the debounced document + attached schema, publishes
 * markers to Monaco, and pushes results to the validation store. Renders
 * nothing.
 */
export function useValidation(): void {
  const controller = useEditorController()
  const { document } = useActiveDocument()
  const { content, result } = useDebouncedParse()
  const setResult = useValidationStore((s) => s.setResult)

  const schemaText = document.schema

  const outcome = useMemo(() => {
    if (!result.ok) {
      const { line, column } = offsetToLineColumn(content, result.error.offset)
      const syntaxProblem: Problem = {
        id: `syntax:${result.error.offset}`,
        severity: 'error',
        source: 'syntax',
        message: result.error.message,
        path: [],
        offset: result.error.offset,
        length: Math.max(1, result.error.length),
        line,
        column,
      }
      return { problems: [syntaxProblem], schemaValid: false }
    }
    return collectProblems({ content, value: result.value, schemaText })
  }, [content, result, schemaText])

  useEffect(() => {
    // Monaco already marks syntax errors; only publish schema/lint markers.
    const markers: EditorMarker[] = outcome.problems
      .filter((problem) => problem.source !== 'syntax')
      .map((problem) => ({
        startOffset: problem.offset,
        endOffset: problem.offset + problem.length,
        message: problem.message,
        severity: problem.severity,
      }))
    controller.setMarkers(markers)

    const errorCount = outcome.problems.filter(
      (p) => p.severity === 'error',
    ).length
    const warningCount = outcome.problems.length - errorCount

    setResult({
      problems: outcome.problems,
      errorCount,
      warningCount,
      hasSchema: Boolean(schemaText && schemaText.trim()),
      schemaValid: outcome.schemaValid,
      schemaError: outcome.schemaError,
    })
  }, [outcome, controller, setResult, schemaText])
}
