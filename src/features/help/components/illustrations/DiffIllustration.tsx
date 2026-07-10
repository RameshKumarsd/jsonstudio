import { Callout } from '@/features/help/components/illustrations/Callout'

export function DiffIllustration() {
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
        width="180"
        height="170"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      <rect
        x="208"
        y="12"
        width="180"
        height="170"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      <rect
        x="24"
        y="26"
        width="140"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="24"
        y="44"
        width="150"
        height="10"
        rx="2"
        className="fill-destructive/30 stroke-destructive/60"
      />
      <rect
        x="24"
        y="62"
        width="120"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="220"
        y="26"
        width="140"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="220"
        y="44"
        width="155"
        height="10"
        rx="2"
        className="fill-primary/25 stroke-primary/60"
      />
      <rect
        x="220"
        y="62"
        width="130"
        height="10"
        rx="2"
        className="fill-primary/25 stroke-primary/60"
      />
      <rect
        x="220"
        y="80"
        width="120"
        height="10"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="12"
        y="192"
        width="376"
        height="18"
        rx="5"
        className="fill-muted stroke-border"
      />
      <Callout x={100} y={22} n={1} />
      <Callout x={297} y={54} n={2} />
      <Callout x={370} y={201} n={3} />
    </svg>
  )
}
