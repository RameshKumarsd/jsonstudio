import { createId } from '@/lib/utils/id'
import type { HttpRequest, KeyValueEntry } from '@/features/request/types'

export function createKeyValueEntry(key = '', value = ''): KeyValueEntry {
  return { id: createId(), key, value, enabled: true }
}

/** A blank request draft, seeded with one empty param and header row. */
export function createEmptyRequest(
  overrides: Partial<HttpRequest> = {},
): HttpRequest {
  return {
    id: createId(),
    name: 'Untitled request',
    method: 'GET',
    url: '',
    params: [createKeyValueEntry()],
    headers: [createKeyValueEntry()],
    auth: { type: 'none' },
    body: '',
    bodyEnabled: false,
    bodyMode: 'raw',
    bodyFields: [createKeyValueEntry()],
    ...overrides,
  }
}
