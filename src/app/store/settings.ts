'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  systemPrompt: string;
  connectionStatus: Record<string, 'untested' | 'connected' | 'failed'>;
  deploymentCounts: Record<string, number>;
  setSystemPrompt: (prompt: string) => void;
  setConnectionStatus: (id: string, status: 'untested' | 'connected' | 'failed') => void;
  setDeploymentCount: (id: string, count: number) => void;
  testConnection: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      systemPrompt: 'You are a helpful assistant.',
      connectionStatus: {},
      deploymentCounts: {},

      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

      setConnectionStatus: (id, status) =>
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, [id]: status },
        })),

      setDeploymentCount: (id, count) =>
        set((state) => ({
          deploymentCounts: { ...state.deploymentCounts, [id]: count },
        })),

      testConnection: async () => {
        try {
          const res = await fetch('/api/deployments');
          if (!res.ok) throw new Error('Failed');
          const data = await res.json();
          const deployments = data.deployments ?? [];

          // Group by endpoint
          const byEndpoint: Record<string, number> = {};
          for (const d of deployments) {
            const epId = d.endpointId;
            byEndpoint[epId] = (byEndpoint[epId] ?? 0) + 1;
          }

          set({
            connectionStatus: Object.fromEntries(
              Object.keys(byEndpoint).map((k) => [k, 'connected' as const]),
            ),
            deploymentCounts: byEndpoint,
          });

          return deployments.length > 0;
        } catch {
          set({
            connectionStatus: {
              australiaeast: 'failed',
              eastus2: 'failed',
            },
          });
          return false;
        }
      },
    }),
    {
      name: 'chorus-settings',
      partialize: (state) => ({
        systemPrompt: state.systemPrompt,
      }),
    },
  ),
);
