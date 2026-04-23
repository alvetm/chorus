export interface FoundryEndpoint {
  id: string;
  name: string;
  accountUrl: string;
  apiKey: string;
  region: string;
}

export interface ModelDeployment {
  id: string;
  deploymentName: string;
  displayName: string;
  provider: ModelProvider;
  endpointId: string;
  reasoningModel: boolean;
  capabilities: ModelCapability[];
  contextWindow?: number;
}

export type ModelProvider =
  | 'openai' | 'deepseek' | 'meta' | 'xai'
  | 'microsoft' | 'mistral' | 'alibaba' | 'cohere' | 'unknown';

export type ModelCapability = 'chat' | 'code' | 'reasoning' | 'vision' | 'embedding';

export interface CatalogueModel {
  name: string;
  provider: ModelProvider;
  description?: string;
  capabilities: ModelCapability[];
  contextWindow?: number;
  deployed: boolean;
  deploymentId?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ModelConversation {
  modelId: string;
  messages: ChatMessage[];
  streamingContent: string;
  reasoningContent: string;
  status: 'idle' | 'streaming' | 'done' | 'error';
  latencyMs?: number;
  tokenCount?: number;
  error?: string;
}

export const PROVIDER_COLORS: Record<ModelProvider, string> = {
  openai: 'bg-emerald-500',
  deepseek: 'bg-violet-500',
  meta: 'bg-blue-500',
  xai: 'bg-zinc-700',
  microsoft: 'bg-cyan-500',
  mistral: 'bg-orange-500',
  alibaba: 'bg-red-500',
  cohere: 'bg-rose-400',
  unknown: 'bg-gray-500',
};
