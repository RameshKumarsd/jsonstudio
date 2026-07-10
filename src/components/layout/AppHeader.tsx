import { Braces } from 'lucide-react'
import { APP_NAME } from '@/config/constants'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ImportUrlDialog } from '@/features/import-url/components/ImportUrlDialog'
import { HelpTrigger } from '@/features/help/components/HelpTrigger'
import { Separator } from '@/components/ui/separator'

/**
 * Top app bar: brand, and global actions (theme toggle). Feature-specific
 * actions live in each feature's own toolbar, not here.
 */
export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
      <div className="flex items-center gap-2">
        <Braces className="size-5 text-primary" />
        <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="ml-auto flex items-center gap-1">
        <ImportUrlDialog />
        <HelpTrigger />
        <ThemeToggle />
      </div>
    </header>
  )
}
