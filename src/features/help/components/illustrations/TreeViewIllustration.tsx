import { Callout } from '@/features/help/components/illustrations/Callout'

export function TreeViewIllustration() {
  return (
    <svg viewBox="0 0 400 220" className="h-auto w-full" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="398"
        height="218"
        rx="10"
        className="fill-background stroke-border"
      />
      <path d="M20 30 l6 5 l-6 5 Z" className="fill-muted-foreground" />
      <rect
        x="36"
        y="24"
        width="140"
        height="16"
        rx="4"
        className="fill-muted stroke-border"
      />
      <path d="M44 58 l6 5 l-6 5 Z" className="fill-muted-foreground" />
      <rect
        x="60"
        y="52"
        width="120"
        height="16"
        rx="4"
        className="fill-muted stroke-border"
      />
      <circle cx="330" cy="60" r="1.6" className="fill-muted-foreground" />
      <circle cx="336" cy="60" r="1.6" className="fill-muted-foreground" />
      <circle cx="342" cy="60" r="1.6" className="fill-muted-foreground" />
      <rect
        x="60"
        y="78"
        width="150"
        height="16"
        rx="4"
        className="fill-muted stroke-border"
      />
      <rect
        x="60"
        y="104"
        width="100"
        height="16"
        rx="4"
        className="fill-muted stroke-border"
      />
      <rect
        x="90"
        y="150"
        width="160"
        height="18"
        rx="4"
        className="fill-primary/20 stroke-primary"
        strokeDasharray="4 3"
      />
      <rect x="60" y="180" width="160" height="2" className="fill-primary" />
      <Callout x={20} y={30} n={1} />
      <Callout x={170} y={158} n={2} />
      <Callout x={355} y={60} n={3} />
    </svg>
  )
}
