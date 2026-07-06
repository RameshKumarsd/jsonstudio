import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useEditorController } from '@/features/editor/EditorControllerContext'
import { useValidationStore } from '@/features/validation/validationStore'
import type { Problem } from '@/features/validation/lib/validate'
import { cn } from '@/lib/utils'

const SOURCE_LABEL: Record<Problem['source'], string> = {
  syntax: 'Syntax',
  schema: 'Schema',
  lint: 'Lint',
}

/**
 * Lists every validation problem with jump-to-error. Errors and warnings are
 * grouped visually; a clean document shows a success state.
 */
export function ProblemsPanel() {
  const controller = useEditorController()
  const { problems, errorCount, warningCount, hasSchema, schemaValid } =
    useValidationStore()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center gap-3 border-b px-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <XCircle className="size-3.5 text-destructive" />
          {errorCount}
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="size-3.5 text-warning" />
          {warningCount}
        </span>
        {hasSchema && (
          <span
            className={cn(
              'ml-auto flex items-center gap-1',
              schemaValid ? 'text-success' : 'text-destructive',
            )}
          >
            {schemaValid ? 'Matches schema' : 'Schema mismatch'}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {problems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="size-6 text-success" />
            <p>No problems detected.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {problems.map((problem) => (
              <li key={problem.id}>
                <button
                  type="button"
                  onClick={() =>
                    controller.revealRange(
                      problem.offset,
                      problem.offset + problem.length,
                    )
                  }
                  className="flex w-full items-start gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent/60"
                >
                  {problem.severity === 'error' ? (
                    <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{problem.message}</span>
                    <span className="text-muted-foreground">
                      {SOURCE_LABEL[problem.source]} · Ln {problem.line}, Col{' '}
                      {problem.column}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
