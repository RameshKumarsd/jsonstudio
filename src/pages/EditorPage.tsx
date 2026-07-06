import { MonacoProvider } from '@/app/providers/MonacoProvider'
import { EditorControllerProvider } from '@/features/editor/EditorControllerContext'
import { EditorPanel } from '@/features/editor/components/EditorPanel'
import { WorkspaceSidebar } from '@/features/workspace/components/WorkspaceSidebar'
import { DocumentTabs } from '@/features/workspace/components/DocumentTabs'
import { ValidationRunner } from '@/features/validation/components/ValidationRunner'
import { SplitPane } from '@/components/layout/SplitPane'

/**
 * The editor workspace: document tabs on top; Monaco on the left; a tabbed
 * sidebar (tree, problems, schema, tools) on the right. MonacoProvider scopes
 * Monaco setup to this route; EditorControllerProvider shares one editor handle
 * across every panel so the views stay in lockstep. ValidationRunner drives
 * real-time validation.
 */
export function EditorPage() {
  return (
    <MonacoProvider>
      <EditorControllerProvider>
        <ValidationRunner />
        <div className="flex h-full flex-col">
          <DocumentTabs />
          <div className="min-h-0 flex-1">
            <SplitPane
              left={<EditorPanel />}
              right={<WorkspaceSidebar />}
              defaultLeft={58}
            />
          </div>
        </div>
      </EditorControllerProvider>
    </MonacoProvider>
  )
}
