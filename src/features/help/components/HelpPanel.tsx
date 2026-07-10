import { HELP_SECTIONS } from '@/features/help/content'
import { HELP_ILLUSTRATIONS } from '@/features/help/illustrationMap'
import { HelpSection } from '@/features/help/components/HelpSection'

function scrollToSection(id: string) {
  document
    .getElementById(`help-${id}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Content of the user manual sheet: a jump-to-section TOC followed by one
 * visual-first card per feature. */
export function HelpPanel() {
  return (
    <div className="space-y-6">
      <nav
        aria-label="Manual sections"
        className="flex flex-wrap gap-2 border-b pb-4"
      >
        {HELP_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {section.title}
          </button>
        ))}
      </nav>

      <div>
        {HELP_SECTIONS.map((section) => {
          const Illustration = HELP_ILLUSTRATIONS[section.id]
          return (
            <HelpSection
              key={section.id}
              section={section}
              illustration={<Illustration />}
            />
          )
        })}
      </div>
    </div>
  )
}
