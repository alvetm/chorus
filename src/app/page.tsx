'use client';

import { useState } from 'react';
import { SettingsDrawer } from '@/app/components/SettingsDrawer';
import { ModelSelectorDock } from '@/app/components/ModelSelectorDock';
import { ModelTabBar } from '@/app/components/ModelTabBar';
import { ResponsePanel } from '@/app/components/ResponsePanel';
import { ChatInput } from '@/app/components/ChatInput';
import { ModelCatalogue } from '@/app/components/ModelCatalogue';
import { useChat } from '@/app/hooks/useChat';
import { useModels } from '@/app/hooks/useModels';
import { Music } from 'lucide-react';

export default function Home() {
  const { selectedModels, selectedModelIds, refreshActive } = useModels();
  const {
    conversations,
    send,
    abort,
    clearModel,
    isAnyStreaming,
    systemPrompt,
    setSystemPrompt,
  } = useChat();

  const [activeTab, setActiveTab] = useState<string>('');
  const [catalogueOpen, setCatalogueOpen] = useState(false);

  const effectiveTab =
    activeTab && selectedModelIds.includes(activeTab)
      ? activeTab
      : selectedModelIds[0] ?? '';

  const activeModel = selectedModels.find((m) => m.id === effectiveTab);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Chorus</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshActive()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh models
          </button>
          <SettingsDrawer />
        </div>
      </header>

      {/* Model Selector Dock */}
      <ModelSelectorDock onBrowseAll={() => setCatalogueOpen(true)} />

      {/* Tab Bar */}
      <ModelTabBar
        models={selectedModels}
        conversations={conversations}
        activeTab={effectiveTab}
        onTabChange={setActiveTab}
      />

      {/* Response Panel */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeModel ? (
          <ResponsePanel
            model={activeModel}
            conversation={conversations[activeModel.id]}
            onAbort={() => abort(activeModel.id)}
            onClear={() => clearModel(activeModel.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <Music className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-sm">Select models above to start comparing responses</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        selectedCount={selectedModelIds.length}
        isStreaming={isAnyStreaming()}
        systemPrompt={systemPrompt}
        onSend={send}
        onSystemPromptChange={setSystemPrompt}
      />

      {/* Model Catalogue */}
      <ModelCatalogue open={catalogueOpen} onOpenChange={setCatalogueOpen} />
    </div>
  );
}
