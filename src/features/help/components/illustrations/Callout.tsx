interface CalloutProps {
  x: number
  y: number
  n: number
}

/** A small numbered circle used inside help illustrations to point at a
 * detail, numbered to match that section's "how to" bullet list. */
export function Callout({ x, y, n }: CalloutProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} className="fill-primary" />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-primary-foreground text-[10px] font-semibold"
      >
        {n}
      </text>
    </g>
  )
}
