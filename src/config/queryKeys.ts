/**
 * Centralized React Query keys. All async caches derive their keys from here so
 * invalidation stays consistent and typo-free.
 */
export const queryKeys = {
  remoteImport: (url: string) => ['remote-import', url] as const,
  httpRequest: () => ['http-request'] as const,
} as const
