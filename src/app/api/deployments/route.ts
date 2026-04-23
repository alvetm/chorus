import { DefaultAzureCredential } from '@azure/identity';
import { getConfiguredProviders } from '@/app/lib/foundry';
import { parseDeployments } from '@/app/lib/models';

const ARM_API_VERSION = '2024-10-01';

async function getArmToken(): Promise<string> {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken('https://management.azure.com/.default');
  return token.token;
}

async function listArmDeployments(
  subscriptionId: string,
  resourceGroup: string,
  accountName: string,
  bearerToken: string,
): Promise<Array<{ id: string; model?: string }>> {
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.CognitiveServices/accounts/${accountName}/deployments?api-version=${ARM_API_VERSION}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` },
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = await response.json();
  // ARM returns { value: [...] }, normalise to { data: [...] } shape
  return (data.value ?? []).map((d: { name: string }) => ({ id: d.name }));
}

export async function GET() {
  const providers = getConfiguredProviders();
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  const resourceGroup = process.env.AZURE_RESOURCE_GROUP;

  if (!subscriptionId || !resourceGroup) {
    return Response.json(
      { error: 'AZURE_SUBSCRIPTION_ID and AZURE_RESOURCE_GROUP must be set' },
      { status: 500 },
    );
  }

  let bearerToken: string;
  try {
    bearerToken = await getArmToken();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: `Failed to acquire ARM token: ${message}` }, { status: 500 });
  }

  const allDeployments = [];

  for (const provider of providers) {
    if (!provider.name) continue;
    try {
      const rawDeployments = await listArmDeployments(
        subscriptionId,
        resourceGroup,
        provider.name,
        bearerToken,
      );
      const deployments = parseDeployments({ data: rawDeployments }, provider.id);
      allDeployments.push(...deployments);
    } catch (err) {
      console.error(`Error fetching deployments for ${provider.name}:`, err);
    }
  }

  return Response.json({ deployments: allDeployments });
}
