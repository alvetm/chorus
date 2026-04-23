import { streamText } from 'ai';
import { getAzureProvider, getConfiguredProviders } from '@/app/lib/foundry';

export async function POST(req: Request) {
  try {
    const { modelId, messages } = await req.json();
    // modelId format: "<endpointId>/<deploymentName>"
    const [endpointId, ...rest] = modelId.split('/');
    const deploymentName = rest.join('/');
    const ep = getConfiguredProviders().find((p) => p.id === endpointId);

    if (!ep || !ep.apiKey) {
      return Response.json(
        { error: `Endpoint "${endpointId}" not configured` },
        { status: 400 },
      );
    }

    const azure = getAzureProvider(ep.name, ep.apiKey);

    const result = streamText({
      model: azure(deploymentName),
      messages,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
