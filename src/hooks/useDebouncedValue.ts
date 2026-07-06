import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * quiet. Used to keep expensive derived work (parsing, stats, validation) off
 * the hot path while typing in large documents.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
