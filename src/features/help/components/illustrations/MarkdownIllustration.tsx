import { Callout } from '@/features/help/components/illustrations/Callout'

export function MarkdownIllustration() {
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
        width="90"
        height="20"
        rx="5"
        className="fill-primary/15 stroke-primary"
      />
      <rect
        x="12"
        y="44"
        width="180"
        height="164"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      {[120, 90, 140, 70, 110, 60].map((w, i) => (
        <line
          key={w}
          x1="24"
          y1={62 + i * 24}
          x2={24 + w}
          y2={62 + i * 24}
          className="stroke-border"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <rect
        x="208"
        y="44"
        width="180"
        height="164"
        rx="6"
        className="fill-muted/20 stroke-border"
      />
      <rect
        x="220"
        y="58"
        width="100"
        height="12"
        rx="3"
        className="fill-primary/30"
      />
      <rect
        x="220"
        y="80"
        width="150"
        height="8"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="220"
        y="96"
        width="140"
        height="8"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="220"
        y="116"
        width="150"
        height="26"
        rx="4"
        className="fill-muted stroke-border"
      />
      <Callout x={102} y={126} n={1} />
      <Callout x={298} y={129} n={2} />
      <Callout x={57} y={22} n={3} />
    </svg>
  )
}
