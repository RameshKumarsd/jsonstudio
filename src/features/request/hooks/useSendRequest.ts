import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendRequest } from '@/features/request/lib/sendRequest'
import { useRequestStore } from '@/stores/requestStore'
import { queryKeys } from '@/config/queryKeys'
import type { HttpRequest, HttpResponseMeta } from '@/features/request/types'
import type { NormalizedHttpError } from '@/lib/http/axiosClient'

/**
 * Sends the current draft request and records the result (response +
 * history) in the request store. Wraps sendRequest in React Query so the UI
 * gets loading/error state for free.
 */
export function useSendRequest() {
  const setLastResponse = useRequestStore((s) => s.setLastResponse)
  const addHistory = useRequestStore((s) => s.addHistory)
  const proxyPrefix = useRequestStore((s) => s.proxyPrefix)
  const activeEnvironmentId = useRequestStore((s) => s.activeEnvironmentId)
  const environments = useRequestStore((s) => s.environments)
  const variables = activeEnvironmentId
    ? (environments[activeEnvironmentId]?.variables ?? [])
    : []

  return useMutation<HttpResponseMeta, NormalizedHttpError, HttpRequest>({
    mutationKey: queryKeys.httpRequest(),
    mutationFn: (request) => sendRequest(request, proxyPrefix, variables),
    onSuccess: (response, request) => {
      setLastResponse(response)
      addHistory(request, response.status)
    },
    onError: (error, request) => {
      addHistory(request, null)
      toast.error('Request failed', { description: error.message })
    },
  })
}
