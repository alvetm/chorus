'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PROVIDER_COLORS, type ModelDeployment, type ModelConversation } from '@/app/types';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, Minus } from 'lucide-react';

interface ModelTabBarProps {
  models: ModelDeployment[];
  conversations: Record<string, ModelConversation>;
  activeTab: string;
  onTabChange: (modelId: string) => void;
}

function StatusBadge({ conv }: { conv?: ModelConversation }) {
  if (!conv || conv.status === 'idle') {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  if (conv.status === 'streaming') {
    return <Loader2 className="h-3 w-3 animate-spin text-blue-400" />;
  }
  if (conv.status === 'error') {
    return <X className="h-3 w-3 text-red-400" />;
  }
  return (
    <div className="flex items-center gap-1">
      <Check className="h-3 w-3 text-green-400" />
      {conv.latencyMs != null && (
        <span className="text-[10px] text-muted-foreground">
          {(conv.latencyMs / 1000).toFixed(1)}s
          {conv.tokenCount != null && ` · ${conv.tokenCount} tok`}
        </span>
      )}
    </div>
  );
}

export function ModelTabBar({ models, conversations, activeTab, onTabChange }: ModelTabBarProps) {
  if (models.length === 0) return null;

  return (
    <div className="flex w-full overflow-x-auto border-b border-border">
      {models.map((model) => {
        const conv = conversations[model.id];
        const isActive = activeTab === model.id;
        const preview =
          conv?.streamingContent?.slice(0, 120) ||
          conv?.messages?.findLast((m) => m.role === 'assistant')?.content?.slice(0, 120);

        return (
          <Tooltip key={model.id}>
            <TooltipTrigger
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              onClick={() => onTabChange(model.id)}
            >
              <span className={cn('h-2 w-2 rounded-full flex-shrink-0', PROVIDER_COLORS[model.provider])} />
              <span className={cn('text-sm', isActive && 'font-medium')}>{model.displayName}</span>
              <StatusBadge conv={conv} />
            </TooltipTrigger>
            {preview && (
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                {preview}...
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}
