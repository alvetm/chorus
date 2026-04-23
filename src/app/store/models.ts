'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModelDeployment, CatalogueModel } from '@/app/types';
import { CATALOGUE_MODELS } from '@/app/lib/models';

interface ModelsState {
  activeModels: ModelDeployment[];
  selectedModelIds: string[];
  catalogueModels: CatalogueModel[];
  isLoading: boolean;
  toggleModel: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  refreshActive: () => Promise<void>;
}

export const useModelsStore = create<ModelsState>()(
  persist(
    (set, get) => ({
      activeModels: [],
      selectedModelIds: [],
      catalogueModels: CATALOGUE_MODELS,
      isLoading: false,

      toggleModel: (id) =>
        set((state) => {
          const selected = new Set(state.selectedModelIds);
          if (selected.has(id)) {
            selected.delete(id);
          } else {
            selected.add(id);
          }
          return { selectedModelIds: Array.from(selected) };
        }),

      selectAll: () =>
        set((state) => ({
          selectedModelIds: state.activeModels.map((m) => m.id),
        })),

      deselectAll: () => set({ selectedModelIds: [] }),

      refreshActive: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/deployments');
          if (!res.ok) throw new Error('Failed to fetch deployments');
          const data = await res.json();
          const models: ModelDeployment[] = data.deployments ?? [];
          const currentSelected = get().selectedModelIds;
          const modelIds = new Set(models.map((m) => m.id));

          const catalogue = CATALOGUE_MODELS.map((c) => {
            const deployed = models.find((m) => m.deploymentName === c.name);
            return { ...c, deployed: !!deployed, deploymentId: deployed?.id };
          });

          const validSelected = currentSelected.filter((id) => modelIds.has(id));
          const selectedModelIds =
            validSelected.length > 0 ? validSelected : models.map((m) => m.id);

          set({
            activeModels: models,
            selectedModelIds,
            catalogueModels: catalogue,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'chorus-models',
      partialize: (state) => ({
        selectedModelIds: state.selectedModelIds,
      }),
    },
  ),
);
