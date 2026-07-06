import { useMutation } from '@tanstack/react-query'
import { fetchRemoteText } from '@/features/import-url/api/fetchRemoteText'
import type { NormalizedHttpError } from '@/lib/http/axiosClient'

/**
 * React Query mutation for fetching remote JSON/schema text. Exposes loading and
 * normalized error state to the import dialog.
 */
export function useImportUrl() {
  return useMutation<string, NormalizedHttpError, string>({
    mutationFn: fetchRemoteText,
  })
}
