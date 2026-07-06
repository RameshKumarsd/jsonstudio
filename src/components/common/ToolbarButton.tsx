import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ToolbarButtonProps extends ComponentProps<typeof Button> {
  /** Accessible label and tooltip text. */
  label: string
  /** Optional keyboard hint shown in the tooltip (e.g. "⌘Z"). */
  shortcut?: string
  children: ReactNode
}

/**
 * Icon button with a tooltip, used across feature toolbars for a consistent,
 * dense, keyboard-hinted control surface.
 */
export function ToolbarButton({
  label,
  shortcut,
  children,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>{label}</span>
        {shortcut && (
          <span className="ml-2 text-primary-foreground/60">{shortcut}</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
