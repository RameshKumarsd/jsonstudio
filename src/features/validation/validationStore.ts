import { create } from 'zustand'
import type { Problem } from '@/features/validation/lib/validate'

interface ValidationState {
  problems: Problem[]
  errorCount: number
  warningCount: number
  hasSchema: boolean
  schemaValid: boolean
  schemaError?: string
  setResult: (result: Omit<ValidationState, 'setResult'>) => void
}

/**
 * Holds the latest validation results so the always-on validation runner and
 * the Problems/Schema panels stay decoupled.
 */
export const useValidationStore = create<ValidationState>()((set) => ({
  problems: [],
  errorCount: 0,
  warningCount: 0,
  hasSchema: false,
  schemaValid: false,
  schemaError: undefined,
  setResult: (result) => set(result),
}))
