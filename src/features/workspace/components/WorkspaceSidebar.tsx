import { AlertCircle, FileJson2, ListTree, Wrench } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TreePanel } from '@/features/tree/components/TreePanel'
import { ProblemsPanel } from '@/features/validation/components/ProblemsPanel'
import { SchemaPanel } from '@/features/validation/components/SchemaPanel'
import { ToolsPanel } from '@/features/tools/components/ToolsPanel'
import { useValidationStore } from '@/features/validation/validationStore'

/**
 * Right-hand workspace panel: the tree, problems, schema, and tools surfaces as
 * tabs sharing the space beside the editor.
 */
export function WorkspaceSidebar() {
  const problemCount = useValidationStore((s) => s.errorCount + s.warningCount)

  return (
    <Tabs defaultValue="tree" className="h-full min-h-0">
      <div className="shrink-0 border-b p-1.5">
        <TabsList className="w-full">
          <TabsTrigger value="tree">
            <ListTree /> Tree
          </TabsTrigger>
          <TabsTrigger value="problems">
            <AlertCircle /> Problems
            {problemCount > 0 && (
              <span className="rounded-full bg-muted-foreground/20 px-1.5 text-[10px] tabular-nums">
                {problemCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="schema">
            <FileJson2 /> Schema
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench /> Tools
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="tree" className="min-h-0">
        <TreePanel />
      </TabsContent>
      <TabsContent value="problems" className="min-h-0">
        <ProblemsPanel />
      </TabsContent>
      <TabsContent value="schema" className="min-h-0">
        <SchemaPanel />
      </TabsContent>
      <TabsContent value="tools" className="flex min-h-0 flex-col">
        <ToolsPanel />
      </TabsContent>
    </Tabs>
  )
}
