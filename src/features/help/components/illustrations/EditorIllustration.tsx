import { Callout } from '@/features/help/components/illustrations/Callout'

export function EditorIllustration() {
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
      <rect
        x="12"
        y="12"
        width="80"
        height="22"
        rx="5"
        className="fill-primary/15 stroke-primary"
      />
      <rect
        x="98"
        y="12"
        width="80"
        height="22"
        rx="5"
        className="fill-muted stroke-border"
      />
      <rect
        x="12"
        y="44"
        width="60"
        height="18"
        rx="4"
        className="fill-muted stroke-border"
      />
      <rect
        x="78"
        y="44"
        width="60"
        height="18"
        rx="4"
        className="fill-muted stroke-border"
      />
      <rect
        x="12"
        y="72"
        width="376"
        height="134"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      <line x1="40" y1="72" x2="40" y2="206" className="stroke-border" />
      {[220, 160, 260, 140, 200, 100].map((w, i) => (
        <line
          key={w}
          x1="50"
          y1={92 + i * 20}
          x2={50 + w}
          y2={92 + i * 20}
          className="stroke-border"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <Callout x={300} y={132} n={1} />
      <Callout x={108} y={53} n={2} />
      <Callout x={150} y={23} n={3} />
    </svg>
  )
}
