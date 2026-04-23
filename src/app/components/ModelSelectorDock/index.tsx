'use client';

import { useModels } from '@/app/hooks/useModels';
import { PROVIDER_COLORS } from '@/app/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ModelSelectorDockProps {
  onBrowseAll: () => void;
}

export function ModelSelectorDock({ onBrowseAll }: ModelSelectorDockProps) {
  const { activeModels, selectedModelIds, isLoading, toggleModel } = useModels();
  const selectedCount = selectedModelIds.length;

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Discovering models...
        </div>
      ) : activeModels.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          No models found. Configure endpoints in Settings, then restart.
        </div>
      ) : (
        <>
          {activeModels.map((model) => {
            const isSelected = selectedModelIds.includes(model.id);
            return (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30'
                    : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full flex-shrink-0', PROVIDER_COLORS[model.provider])} />
                {model.displayName}
              </button>
            );
          })}

          <div className="flex items-center gap-2 ml-2 border-l border-border pl-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {selectedCount} selected
            </span>
            <button
              onClick={onBrowseAll}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              Browse All
            </button>
          </div>
        </>
      )}
    </div>
  );
}
