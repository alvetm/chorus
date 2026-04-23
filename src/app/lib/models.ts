import type { ModelDeployment, ModelProvider, CatalogueModel } from '@/app/types';

const PROVIDER_PATTERNS: [RegExp, ModelProvider][] = [
  [/^(gpt-|o4-|o3-|o1-)/, 'openai'],
  [/^DeepSeek-/, 'deepseek'],
  [/^Llama-/, 'meta'],
  [/^grok-/, 'xai'],
  [/^Phi-/, 'microsoft'],
  [/^(Mistral-|Mixtral-)/, 'mistral'],
  [/^Qwen-/, 'alibaba'],
  [/^command-/, 'cohere'],
];

export function detectProvider(deploymentName: string): ModelProvider {
  for (const [pattern, provider] of PROVIDER_PATTERNS) {
    if (pattern.test(deploymentName)) return provider;
  }
  return 'unknown';
}

const DISPLAY_NAME_MAP: Record<string, string> = {
  'gpt-4.1-mini': 'gpt-4.1-mini',
  'DeepSeek-R1-0528': 'R1',
  'gpt-5.2-chat': 'gpt-5.2',
  'o4-mini': 'o4-mini',
  'grok-4-fast-reasoning': 'grok-4',
  'DeepSeek-V3.1': 'V3.1',
  'Llama-4-Maverick-17B-128E-Instruct-FP8': 'Llama-4',
};

export function shortenDisplayName(deploymentName: string): string {
  return DISPLAY_NAME_MAP[deploymentName] ?? deploymentName;
}

const REASONING_MODELS = new Set([
  'o4-mini', 'o3-mini', 'o1-mini', 'o1-preview',
  'DeepSeek-R1-0528', 'DeepSeek-R1',
  'grok-4-fast-reasoning',
]);

export function isReasoningModel(deploymentName: string): boolean {
  return REASONING_MODELS.has(deploymentName);
}

export function parseDeployments(
  data: { data?: Array<{ id: string; model?: string }> },
  endpointId: string,
): ModelDeployment[] {
  return (data.data ?? []).map((d) => {
    const deploymentName = d.id;
    const provider = detectProvider(deploymentName);
    return {
      id: `${endpointId}/${deploymentName}`,
      deploymentName,
      displayName: shortenDisplayName(deploymentName),
      provider,
      endpointId,
      reasoningModel: isReasoningModel(deploymentName),
      capabilities: ['chat' as const],
    };
  });
}

export const CATALOGUE_MODELS: CatalogueModel[] = [
  { name: 'gpt-4.1-mini', provider: 'openai', capabilities: ['chat', 'code'], contextWindow: 1047576, deployed: false, description: 'Fast, affordable small model for focused tasks' },
  { name: 'gpt-4.1', provider: 'openai', capabilities: ['chat', 'code'], contextWindow: 1047576, deployed: false, description: 'Flagship GPT model for complex tasks' },
  { name: 'gpt-5.2-chat', provider: 'openai', capabilities: ['chat', 'code', 'reasoning'], contextWindow: 1047576, deployed: false, description: 'Latest frontier model' },
  { name: 'o4-mini', provider: 'openai', capabilities: ['chat', 'code', 'reasoning'], contextWindow: 200000, deployed: false, description: 'Small reasoning model' },
  { name: 'o3-mini', provider: 'openai', capabilities: ['chat', 'code', 'reasoning'], contextWindow: 200000, deployed: false, description: 'Previous-gen small reasoning model' },
  { name: 'DeepSeek-R1-0528', provider: 'deepseek', capabilities: ['chat', 'code', 'reasoning'], contextWindow: 131072, deployed: false, description: 'DeepSeek reasoning model' },
  { name: 'DeepSeek-V3.1', provider: 'deepseek', capabilities: ['chat', 'code'], contextWindow: 131072, deployed: false, description: 'DeepSeek chat model' },
  { name: 'grok-4-fast-reasoning', provider: 'xai', capabilities: ['chat', 'code', 'reasoning'], contextWindow: 131072, deployed: false, description: 'xAI fast reasoning model' },
  { name: 'Llama-4-Maverick-17B-128E-Instruct-FP8', provider: 'meta', capabilities: ['chat', 'code'], contextWindow: 131072, deployed: false, description: 'Meta Llama 4 Maverick' },
  { name: 'Phi-4', provider: 'microsoft', capabilities: ['chat', 'code'], contextWindow: 16384, deployed: false, description: 'Microsoft small language model' },
  { name: 'Mistral-Large-2', provider: 'mistral', capabilities: ['chat', 'code'], contextWindow: 131072, deployed: false, description: 'Mistral flagship model' },
  { name: 'Qwen-2.5-72B-Instruct', provider: 'alibaba', capabilities: ['chat', 'code'], contextWindow: 131072, deployed: false, description: 'Alibaba large language model' },
  { name: 'command-r-plus', provider: 'cohere', capabilities: ['chat'], contextWindow: 128000, deployed: false, description: 'Cohere enterprise model' },
];
