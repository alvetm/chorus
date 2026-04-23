'use client';

import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PROVIDER_COLORS, type ModelProvider, type ModelCapability } from '@/app/types';
import { useModels } from '@/app/hooks/useModels';
import { cn } from '@/lib/utils';
import { Search, ExternalLink } from 'lucide-react';

interface ModelCatalogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROVIDER_FILTERS: ModelProvider[] = [
  'openai', 'deepseek', 'meta', 'xai', 'microsoft', 'mistral', 'alibaba', 'cohere',
];

const CAPABILITY_FILTERS: ModelCapability[] = [
  'chat', 'code', 'reasoning', 'vision', 'embedding',
];

export function ModelCatalogue({ open, onOpenChange }: ModelCatalogueProps) {
  const { catalogueModels, selectedModelIds, toggleModel } = useModels();
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<ModelProvider | null>(null);
  const [capabilityFilter, setCapabilityFilter] = useState<ModelCapability | null>(null);

  const filtered = useMemo(() => {
    return catalogueModels.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (providerFilter && m.provider !== providerFilter) return false;
      if (capabilityFilter && !m.capabilities.includes(capabilityFilter)) return false;
      return true;
    });
  }, [catalogueModels, search, providerFilter, capabilityFilter]);

  const deployed = filtered.filter((m) => m.deployed);
  const available = filtered.filter((m) => !m.deployed);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle>Model Catalogue</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PROVIDER_FILTERS.map((provider) => (
              <button
                key={provider}
                onClick={() => setProviderFilter(providerFilter === provider ? null : provider)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors',
                  providerFilter === provider
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', PROVIDER_COLORS[provider])} />
                {provider}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CAPABILITY_FILTERS.map((cap) => (
              <button
                key={cap}
                onClick={() => setCapabilityFilter(capabilityFilter === cap ? null : cap)}
                className={cn(
                  'px-2 py-1 rounded-full text-xs transition-colors',
                  capabilityFilter === cap
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="px-4 pb-4 space-y-4">
            {deployed.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Deployed ({deployed.length})
                </h3>
                {deployed.map((model) => {
                  const isSelected = model.deploymentId ? selectedModelIds.includes(model.deploymentId) : false;
                  return (
                    <button
                      key={model.name}
                      onClick={() => model.deploymentId && toggleModel(model.deploymentId)}
                      className={cn(
                        'w-full text-left border rounded-lg p-3 transition-colors',
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('h-2 w-2 rounded-full', PROVIDER_COLORS[model.provider])} />
                        <span className="text-sm font-medium">{model.name}</span>
                        <Badge variant="default" className="text-[10px] bg-green-500/20 text-green-400 hover:bg-green-500/20">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {model.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-[10px]">{cap}</Badge>
                        ))}
                        {model.contextWindow && (
                          <span className="text-[10px] text-muted-foreground">
                            {(model.contextWindow / 1000).toFixed(0)}K ctx
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <p className="text-xs text-muted-foreground mt-1.5">{model.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {deployed.length > 0 && available.length > 0 && <Separator />}

            {available.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Available to Deploy ({available.length})
                </h3>
                {available.map((model) => (
                  <div key={model.name} className="border border-border rounded-lg p-3 opacity-60">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('h-2 w-2 rounded-full', PROVIDER_COLORS[model.provider])} />
                      <span className="text-sm font-medium">{model.name}</span>
                      <Badge variant="secondary" className="text-[10px]">Available</Badge>
                      <a
                        href="https://ai.azure.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Deploy <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {model.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-[10px]">{cap}</Badge>
                      ))}
                      {model.contextWindow && (
                        <span className="text-[10px] text-muted-foreground">
                          {(model.contextWindow / 1000).toFixed(0)}K ctx
                        </span>
                      )}
                    </div>
                    {model.description && (
                      <p className="text-xs text-muted-foreground mt-1.5">{model.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
