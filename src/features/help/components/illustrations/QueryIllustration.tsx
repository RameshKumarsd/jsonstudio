import { Callout } from '@/features/help/components/illustrations/Callout'

export function QueryIllustration() {
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
        y="14"
        width="320"
        height="26"
        rx="6"
        className="fill-muted/40 stroke-primary"
      />
      <rect
        x="24"
        y="23"
        width="200"
        height="8"
        rx="2"
        className="fill-primary/50"
      />
      <rect
        x="340"
        y="14"
        width="48"
        height="26"
        rx="6"
        className="fill-primary/20 stroke-primary"
      />
      <rect
        x="12"
        y="54"
        width="376"
        height="140"
        rx="6"
        className="fill-muted/20 stroke-border"
      />
      <rect
        x="24"
        y="66"
        width="220"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="24"
        y="84"
        width="260"
        height="10"
        rx="2"
        className="fill-primary/25 stroke-primary/60"
      />
      <rect
        x="24"
        y="102"
        width="200"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="24"
        y="120"
        width="260"
        height="10"
        rx="2"
        className="fill-primary/25 stroke-primary/60"
      />
      <rect
        x="24"
        y="138"
        width="180"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <Callout x={200} y={27} n={1} />
      <Callout x={288} y={89} n={2} />
      <Callout x={364} y={27} n={3} />
    </svg>
  )
}
