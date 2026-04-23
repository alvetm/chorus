# Chorus

**Multi-LLM PWA** — broadcast prompts to multiple Azure AI Foundry models simultaneously, streaming responses into per-model tabs.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Vercel AI SDK** (`@ai-sdk/azure`) for streaming
- **Zustand** for state management
- **shadcn/ui** + **Tailwind CSS v4** for UI
- **next-pwa** for Progressive Web App support

## Quick Start

```bash
# 1. Clone
git clone https://github.com/alvetm/chorus.git && cd chorus

# 2. Install
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Azure AI Foundry API keys

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `FOUNDRY_AUSTRALIAEAST_NAME` | Resource name for Australia East endpoint |
| `FOUNDRY_AUSTRALIAEAST_API_KEY` | API key for Australia East endpoint |
| `FOUNDRY_EASTUS2_NAME` | Resource name for East US 2 endpoint |
| `FOUNDRY_EASTUS2_API_KEY` | API key for East US 2 endpoint |

API keys are server-side only — they never reach the browser.

## Architecture

```
Browser (PWA)  →  /api/chat (Next.js route)  →  Azure AI Foundry
                  /api/deployments            →  Model Discovery
```

- **Same-origin proxy** — no CORS issues, no browser flags needed
- **Concurrent streaming** — all selected models stream in parallel
- **Per-model tabs** — switch between responses with status badges

## Supported Models

gpt-4.1-mini · gpt-5.2-chat · o4-mini · DeepSeek-R1-0528 · DeepSeek-V3.1 · grok-4-fast-reasoning · Llama-4-Maverick
