import { NavLink } from 'react-router-dom'
import { PRIMARY_NAV } from '@/app/router/routes'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Slim, icon-first primary navigation rail. Route state comes from NavLink so
 * the active item stays in sync with the URL.
 */
export function AppSidebar() {
  return (
    <nav
      aria-label="Primary"
      className="flex w-14 flex-col items-center gap-1 border-r bg-sidebar py-3"
    >
      {PRIMARY_NAV.map(({ to, label, icon: Icon, description }) => (
        <Tooltip key={to}>
          <TooltipTrigger asChild>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex size-10 items-center justify-center rounded-md transition-colors',
                  'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  isActive &&
                    'bg-sidebar-accent font-medium text-sidebar-foreground',
                )
              }
              aria-label={label}
            >
              <Icon className="size-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{label}</p>
            <p className="text-xs text-primary-foreground/70">{description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  )
}
