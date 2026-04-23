import { createAzure } from '@ai-sdk/azure';

export function getAzureProvider(accountName: string, apiKey: string) {
  return createAzure({
    resourceName: accountName,
    apiKey,
    baseURL: `https://${accountName}.cognitiveservices.azure.com/openai`,
  });
}

export function getConfiguredProviders() {
  return [
    {
      id: 'australiaeast',
      name: process.env.FOUNDRY_AUSTRALIAEAST_NAME!,
      apiKey: process.env.FOUNDRY_AUSTRALIAEAST_API_KEY!,
      region: 'australiaeast',
    },
    {
      id: 'eastus2',
      name: process.env.FOUNDRY_EASTUS2_NAME!,
      apiKey: process.env.FOUNDRY_EASTUS2_API_KEY!,
      region: 'eastus2',
    },
  ];
}

export function getEndpointUrl(accountName: string) {
  return `https://${accountName}.cognitiveservices.azure.com`;
}
