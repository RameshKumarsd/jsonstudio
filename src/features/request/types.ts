export type HttpMethod =
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface KeyValueEntry {
  id: string
  key: string
  value: string
  enabled: boolean
}

export type AuthType = 'none' | 'bearer' | 'basic'

export interface RequestAuth {
  type: AuthType
  token?: string
  username?: string
  password?: string
}

export interface HttpRequest {
  id: string
  name: string
  method: HttpMethod
  url: string
  params: KeyValueEntry[]
  headers: KeyValueEntry[]
  auth: RequestAuth
  body: string
  bodyEnabled: boolean
}

export interface HttpResponseMeta {
  status: number
  statusText: string
  durationMs: number
  sizeBytes: number
  headers: Record<string, string>
  body: string
  contentType: string | null
}

export interface Collection {
  id: string
  name: string
  requestIds: string[]
}

export interface HistoryEntry {
  id: string
  request: HttpRequest
  status: number | null
  timestamp: number
}
