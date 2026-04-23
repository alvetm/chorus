'use client';

import { create } from 'zustand';
import type { ChatMessage, ModelConversation } from '@/app/types';
import { useModelsStore } from '@/app/store/models';
import { useSettingsStore } from '@/app/store/settings';

interface ChatState {
  conversations: Record<string, ModelConversation>;
  abortControllers: Record<string, AbortController>;
  appendToken: (modelId: string, token: string, isReasoning: boolean) => void;
  setStatus: (modelId: string, status: ModelConversation['status']) => void;
  setError: (modelId: string, error: string) => void;
  setLatency: (modelId: string, ms: number) => void;
  setTokenCount: (modelId: string, n: number) => void;
  sendToAll: (userMessage: string) => void;
  abortModel: (modelId: string) => void;
  abortAll: () => void;
  clearAll: () => void;
  clearModel: (modelId: string) => void;
  isAnyStreaming: () => boolean;
}

function createEmptyConversation(modelId: string): ModelConversation {
  return {
    modelId,
    messages: [],
    streamingContent: '',
    reasoningContent: '',
    status: 'idle',
  };
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: {},
  abortControllers: {},

  appendToken: (modelId, token, isReasoning) =>
    set((state) => {
      const conv = state.conversations[modelId] ?? createEmptyConversation(modelId);
      return {
        conversations: {
          ...state.conversations,
          [modelId]: {
            ...conv,
            ...(isReasoning
              ? { reasoningContent: conv.reasoningContent + token }
              : { streamingContent: conv.streamingContent + token }),
          },
        },
      };
    }),

  setStatus: (modelId, status) =>
    set((state) => {
      const conv = state.conversations[modelId] ?? createEmptyConversation(modelId);
      return {
        conversations: { ...state.conversations, [modelId]: { ...conv, status } },
      };
    }),

  setError: (modelId, error) =>
    set((state) => {
      const conv = state.conversations[modelId] ?? createEmptyConversation(modelId);
      return {
        conversations: {
          ...state.conversations,
          [modelId]: { ...conv, status: 'error', error },
        },
      };
    }),

  setLatency: (modelId, ms) =>
    set((state) => {
      const conv = state.conversations[modelId] ?? createEmptyConversation(modelId);
      return {
        conversations: {
          ...state.conversations,
          [modelId]: { ...conv, latencyMs: ms },
        },
      };
    }),

  setTokenCount: (modelId, n) =>
    set((state) => {
      const conv = state.conversations[modelId] ?? createEmptyConversation(modelId);
      return {
        conversations: {
          ...state.conversations,
          [modelId]: { ...conv, tokenCount: n },
        },
      };
    }),

  sendToAll: (userMessage: string) => {
    const { selectedModelIds } = useModelsStore.getState();
    const { systemPrompt } = useSettingsStore.getState();
    const state = get();

    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    const systemMsg = { role: 'system' as const, content: systemPrompt };

    const newConversations = { ...state.conversations };
    const newAbortControllers = { ...state.abortControllers };

    for (const modelId of selectedModelIds) {
      const existing = newConversations[modelId] ?? createEmptyConversation(modelId);
      const messages = [...existing.messages, userMsg];

      newConversations[modelId] = {
        ...existing,
        messages,
        streamingContent: '',
        reasoningContent: '',
        status: 'streaming',
        error: undefined,
        latencyMs: undefined,
        tokenCount: undefined,
      };

      const controller = new AbortController();
      newAbortControllers[modelId] = controller;

      const apiMessages = [systemMsg, ...messages.map((m) => ({ role: m.role, content: m.content }))];
      const startTime = Date.now();

      // Fire and forget — each model streams independently via /api/chat
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, messages: apiMessages }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(errorData.error || `HTTP ${res.status}`);
          }

          const reader = res.body?.getReader();
          if (!reader) throw new Error('No response body');

          const decoder = new TextDecoder();
          let tokenCount = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            if (chunk) {
              tokenCount += Math.max(1, Math.round(chunk.length / 4));
              get().appendToken(modelId, chunk, false);
            }
          }

          const latencyMs = Date.now() - startTime;
          const currentConv = get().conversations[modelId];
          if (currentConv) {
            const assistantMsg: ChatMessage = {
              role: 'assistant',
              content: currentConv.streamingContent,
              timestamp: Date.now(),
            };
            set((s) => ({
              conversations: {
                ...s.conversations,
                [modelId]: {
                  ...s.conversations[modelId],
                  messages: [...s.conversations[modelId].messages, assistantMsg],
                  status: 'done',
                  latencyMs,
                  tokenCount,
                },
              },
            }));
          }
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return;
          get().setError(modelId, err.message);
        });
    }

    set({ conversations: newConversations, abortControllers: newAbortControllers });
  },

  abortModel: (modelId) => {
    const controller = get().abortControllers[modelId];
    controller?.abort();
    set((state) => ({
      conversations: {
        ...state.conversations,
        [modelId]: {
          ...(state.conversations[modelId] ?? createEmptyConversation(modelId)),
          status: 'done',
        },
      },
    }));
  },

  abortAll: () => {
    const controllers = get().abortControllers;
    Object.values(controllers).forEach((c) => c.abort());
    set((state) => {
      const convs = { ...state.conversations };
      for (const id of Object.keys(convs)) {
        if (convs[id].status === 'streaming') {
          convs[id] = { ...convs[id], status: 'done' };
        }
      }
      return { conversations: convs };
    });
  },

  clearAll: () => {
    get().abortAll();
    set({ conversations: {}, abortControllers: {} });
  },

  clearModel: (modelId) => {
    get().abortModel(modelId);
    set((state) => {
      const convs = { ...state.conversations };
      delete convs[modelId];
      return { conversations: convs };
    });
  },

  isAnyStreaming: () =>
    Object.values(get().conversations).some((c) => c.status === 'streaming'),
}));
