import { Input } from '@/components/ui/input'
import type { RequestAuth } from '@/features/request/types'

interface RequestAuthTabProps {
  auth: RequestAuth
  onChange: (auth: RequestAuth) => void
}

const OPTIONS: { value: RequestAuth['type']; label: string }[] = [
  { value: 'none', label: 'No auth' },
  { value: 'bearer', label: 'Bearer token' },
  { value: 'basic', label: 'Basic auth' },
]

/** Auth-type picker plus the fields it needs; writes into draft.auth. */
export function RequestAuthTab({ auth, onChange }: RequestAuthTabProps) {
  return (
    <div className="space-y-3 p-3">
      <div className="flex gap-4 text-sm">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name="auth-type"
              checked={auth.type === option.value}
              onChange={() => onChange({ type: option.value })}
            />
            {option.label}
          </label>
        ))}
      </div>

      {auth.type === 'bearer' && (
        <Input
          value={auth.token ?? ''}
          placeholder="Token"
          onChange={(event) => onChange({ ...auth, token: event.target.value })}
          className="font-mono text-xs"
        />
      )}

      {auth.type === 'basic' && (
        <div className="flex gap-2">
          <Input
            value={auth.username ?? ''}
            placeholder="Username"
            onChange={(event) =>
              onChange({ ...auth, username: event.target.value })
            }
          />
          <Input
            value={auth.password ?? ''}
            type="password"
            placeholder="Password"
            onChange={(event) =>
              onChange({ ...auth, password: event.target.value })
            }
          />
        </div>
      )}
    </div>
  )
}
