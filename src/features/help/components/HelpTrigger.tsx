import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { HelpPanel } from '@/features/help/components/HelpPanel'

/** Header "?" button that opens the in-app user manual. */
export function HelpTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open user manual">
          <HelpCircle />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User manual</SheetTitle>
          <SheetDescription>
            A quick visual reference for every part of {'JSON Studio'}.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <HelpPanel />
        </div>
      </SheetContent>
    </Sheet>
  )
}
