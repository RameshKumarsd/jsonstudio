import { useValidation } from '@/features/validation/hooks/useValidation'

/**
 * Mounts the real-time validation runner. Renders nothing; kept as a component
 * so it lives inside the editor providers and runs regardless of which sidebar
 * tab is active.
 */
export function ValidationRunner() {
  useValidation()
  return null
}
