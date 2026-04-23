'use client';

import { useModelsStore } from '@/app/store/models';
import { useEffect } from 'react';

export function useModels() {
  const {
    activeModels,
    selectedModelIds,
    catalogueModels,
    isLoading,
    toggleModel,
    selectAll,
    deselectAll,
    refreshActive,
  } = useModelsStore();

  useEffect(() => {
    refreshActive();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    activeModels,
    selectedModelIds,
    selectedModels: activeModels.filter((m) => selectedModelIds.includes(m.id)),
    catalogueModels,
    isLoading,
    toggleModel,
    selectAll,
    deselectAll,
    refreshActive,
  };
}
