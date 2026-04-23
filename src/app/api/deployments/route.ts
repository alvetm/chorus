import { getConfiguredProviders, getEndpointUrl } from '@/app/lib/foundry';
import { parseDeployments } from '@/app/lib/models';

export async function GET() {
  const providers = getConfiguredProviders();
  const allDeployments = [];

  for (const provider of providers) {
    if (!provider.apiKey) continue;

    try {
      const url = `${getEndpointUrl(provider.name)}/openai/deployments?api-version=2024-10-21`;
      const response = await fetch(url, {
        headers: { 'api-key': provider.apiKey },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`Failed to fetch deployments for ${provider.name}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const deployments = parseDeployments(data, provider.id);
      allDeployments.push(...deployments);
    } catch (err) {
      console.error(`Error fetching deployments for ${provider.name}:`, err);
    }
  }

  return Response.json({ deployments: allDeployments });
}
