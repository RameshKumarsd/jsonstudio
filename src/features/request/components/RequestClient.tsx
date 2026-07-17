import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SplitPane } from '@/components/layout/SplitPane'
import { CollectionsSidebar } from '@/features/request/components/CollectionsSidebar'
import { RequestTabs } from '@/features/request/components/RequestTabs'
import { RequestBar } from '@/features/request/components/RequestBar'
import { KeyValueEditor } from '@/features/request/components/KeyValueEditor'
import { RequestAuthTab } from '@/features/request/components/RequestAuthTab'
import { RequestBodyTab } from '@/features/request/components/RequestBodyTab'
import { ResponseViewer } from '@/features/request/components/ResponseViewer'
import { selectActiveDraft, useRequestStore } from '@/stores/requestStore'

function countLabel(count: number): string {
  return count > 0 ? ` (${count})` : ''
}

/**
 * Postman-style HTTP request client: collections rail, a request-tab strip
 * (multiple requests open at once, mirroring the Editor's document tabs),
 * request bar, a tabbed request editor (Params/Headers/Auth/Body), and the
 * response viewer.
 */
export function RequestClient() {
  const draft = useRequestStore(selectActiveDraft)
  const updateDraft = useRequestStore((s) => s.updateDraft)

  const enabledParams = draft.params.filter(
    (p) => p.enabled && p.key.trim(),
  ).length
  const enabledHeaders = draft.headers.filter(
    (h) => h.enabled && h.key.trim(),
  ).length

  return (
    <div className="flex h-full">
      <CollectionsSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <RequestTabs />
        <RequestBar />
        <div className="min-h-0 flex-1">
          <SplitPane
            defaultLeft={45}
            left={
              <Tabs defaultValue="params" className="h-full min-h-0">
                <TabsList className="m-2 w-fit">
                  <TabsTrigger value="params">
                    Params{countLabel(enabledParams)}
                  </TabsTrigger>
                  <TabsTrigger value="headers">
                    Headers{countLabel(enabledHeaders)}
                  </TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>
                <TabsContent value="params" className="overflow-auto">
                  <KeyValueEditor
                    entries={draft.params}
                    onChange={(params) => updateDraft({ params })}
                    keyPlaceholder="Param"
                  />
                </TabsContent>
                <TabsContent value="headers" className="overflow-auto">
                  <KeyValueEditor
                    entries={draft.headers}
                    onChange={(headers) => updateDraft({ headers })}
                    keyPlaceholder="Header"
                  />
                </TabsContent>
                <TabsContent value="auth" className="overflow-auto">
                  <RequestAuthTab
                    auth={draft.auth}
                    onChange={(auth) => updateDraft({ auth })}
                  />
                </TabsContent>
                <TabsContent value="body" className="min-h-0">
                  <RequestBodyTab
                    body={draft.body}
                    enabled={draft.bodyEnabled}
                    mode={draft.bodyMode}
                    fields={draft.bodyFields}
                    onBodyChange={(body) => updateDraft({ body })}
                    onEnabledChange={(bodyEnabled) =>
                      updateDraft({ bodyEnabled })
                    }
                    onModeChange={(bodyMode) => updateDraft({ bodyMode })}
                    onFieldsChange={(bodyFields) =>
                      updateDraft({ bodyFields })
                    }
                  />
                </TabsContent>
              </Tabs>
            }
            right={<ResponseViewer />}
          />
        </div>
      </div>
    </div>
  )
}
