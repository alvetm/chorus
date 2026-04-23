'use client';

import { useChatStore } from '@/app/store/chat';
import { useSettingsStore } from '@/app/store/settings';

export function useChat() {
  const conversations = useChatStore((s) => s.conversations);
  const sendToAll = useChatStore((s) => s.sendToAll);
  const abortModel = useChatStore((s) => s.abortModel);
  const abortAll = useChatStore((s) => s.abortAll);
  const clearAll = useChatStore((s) => s.clearAll);
  const clearModel = useChatStore((s) => s.clearModel);
  const isAnyStreaming = useChatStore((s) => s.isAnyStreaming);
  const systemPrompt = useSettingsStore((s) => s.systemPrompt);
  const setSystemPrompt = useSettingsStore((s) => s.setSystemPrompt);

  const send = (message: string) => {
    sendToAll(message);
  };

  const abort = (modelId?: string) => {
    if (modelId) {
      abortModel(modelId);
    } else {
      abortAll();
    }
  };

  return {
    conversations,
    send,
    abort,
    clearAll,
    clearModel,
    isAnyStreaming,
    systemPrompt,
    setSystemPrompt,
  };
}
