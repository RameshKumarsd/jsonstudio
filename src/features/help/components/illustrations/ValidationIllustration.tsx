import { Callout } from '@/features/help/components/illustrations/Callout'

export function ValidationIllustration() {
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
        width="110"
        height="20"
        rx="5"
        className="fill-muted stroke-border"
      />
      <rect
        x="12"
        y="46"
        width="376"
        height="34"
        rx="6"
        className="fill-destructive/10 stroke-destructive/50"
      />
      <circle cx="26" cy="63" r="5" className="fill-destructive" />
      <rect
        x="40"
        y="57"
        width="220"
        height="12"
        rx="3"
        className="fill-destructive/40"
      />
      <rect
        x="12"
        y="88"
        width="376"
        height="34"
        rx="6"
        className="fill-destructive/10 stroke-destructive/50"
      />
      <circle cx="26" cy="105" r="5" className="fill-destructive" />
      <rect
        x="40"
        y="99"
        width="180"
        height="12"
        rx="3"
        className="fill-destructive/40"
      />
      <rect
        x="12"
        y="134"
        width="376"
        height="72"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      <rect
        x="26"
        y="148"
        width="200"
        height="10"
        rx="2"
        className="fill-muted-foreground/40"
      />
      <rect
        x="26"
        y="164"
        width="260"
        height="10"
        rx="2"
        className="fill-primary/30 stroke-primary"
      />
      <rect
        x="26"
        y="180"
        width="150"
        height="10"
        rx="2"
        className="fill-muted-foreground/40"
      />
      <Callout x={200} y={63} n={1} />
      <Callout x={67} y={22} n={2} />
      <Callout x={230} y={169} n={3} />
    </svg>
  )
}
