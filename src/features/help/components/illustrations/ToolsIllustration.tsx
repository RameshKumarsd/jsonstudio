import { Callout } from '@/features/help/components/illustrations/Callout'

export function ToolsIllustration() {
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
        height="24"
        rx="5"
        className="fill-primary/15 stroke-primary"
      />
      <rect
        x="100"
        y="12"
        width="80"
        height="24"
        rx="5"
        className="fill-muted stroke-border"
      />
      <rect
        x="188"
        y="12"
        width="80"
        height="24"
        rx="5"
        className="fill-muted stroke-border"
      />
      <rect
        x="276"
        y="12"
        width="112"
        height="24"
        rx="5"
        className="fill-muted stroke-border"
      />
      <rect
        x="12"
        y="48"
        width="376"
        height="158"
        rx="6"
        className="fill-muted/30 stroke-border"
      />
      {[200, 160, 240, 120, 180, 90, 220].map((w, i) => (
        <line
          key={w}
          x1="26"
          y1={66 + i * 20}
          x2={26 + w}
          y2={66 + i * 20}
          className="stroke-border"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <Callout x={52} y={24} n={1} />
      <Callout x={140} y={24} n={2} />
      <Callout x={332} y={24} n={3} />
    </svg>
  )
}
