import axios, { AxiosError } from 'axios'
import { HTTP_TIMEOUT_MS } from '@/config/constants'

/**
 * Shared Axios instance for remote imports. Kept minimal and header-light so it
 * works against arbitrary public JSON/schema URLs.
 */
export const httpClient = axios.create({
  timeout: HTTP_TIMEOUT_MS,
})

export interface NormalizedHttpError {
  message: string
  status?: number
}

/**
 * Convert any thrown value into a stable, user-presentable error shape.
 */
export function normalizeHttpError(error: unknown): NormalizedHttpError {
  if (error instanceof AxiosError) {
    return {
      message:
        error.code === 'ECONNABORTED'
          ? 'Request timed out'
          : (error.message ?? 'Network request failed'),
      status: error.response?.status,
    }
  }
  if (error instanceof Error) {
    return { message: error.message }
  }
  return { message: 'Unknown network error' }
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeHttpError(error)),
)
