import { Callout } from '@/features/help/components/illustrations/Callout'

export function RequestIllustration() {
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
        width="56"
        height="26"
        rx="6"
        className="fill-primary/15 stroke-primary"
      />
      <rect
        x="76"
        y="14"
        width="240"
        height="26"
        rx="6"
        className="fill-muted/40 stroke-border"
      />
      <rect
        x="88"
        y="23"
        width="160"
        height="8"
        rx="2"
        className="fill-muted-foreground/40"
      />
      <rect
        x="324"
        y="14"
        width="64"
        height="26"
        rx="6"
        className="fill-primary/20 stroke-primary"
      />
      <rect
        x="12"
        y="52"
        width="90"
        height="142"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      <rect
        x="22"
        y="64"
        width="60"
        height="8"
        rx="2"
        className="fill-muted-foreground/40"
      />
      <rect
        x="22"
        y="80"
        width="70"
        height="8"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="22"
        y="96"
        width="50"
        height="8"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="112"
        y="52"
        width="276"
        height="142"
        rx="6"
        className="fill-muted/20 stroke-border"
      />
      <rect
        x="124"
        y="64"
        width="40"
        height="14"
        rx="4"
        className="fill-primary/25 stroke-primary"
      />
      <rect
        x="124"
        y="88"
        width="220"
        height="8"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="124"
        y="104"
        width="180"
        height="8"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <Callout x={40} y={27} n={1} />
      <Callout x={280} y={27} n={2} />
      <Callout x={57} y={64} n={3} />
    </svg>
  )
}
