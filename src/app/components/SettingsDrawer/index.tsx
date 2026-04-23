'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/app/store/settings';
import { Settings, Plug } from 'lucide-react';

const ENDPOINTS = [
  { id: 'australiaeast', name: 'vd-foundry-project-resource', region: 'australiaeast' },
  { id: 'eastus2', name: 'vd-chats-resource', region: 'eastus2' },
];

export function SettingsDrawer() {
  const { connectionStatus, deploymentCounts, testConnection } = useSettingsStore();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const handleTest = async () => {
    setTesting(true);
    setTestResult('');
    const success = await testConnection();
    setTestResult(success ? 'Connected successfully' : 'Connection failed — check .env.local');
    setTesting(false);
  };

  const getStatusDot = (id: string) => {
    const status = connectionStatus[id] ?? 'untested';
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const hasAnyConnection = Object.values(connectionStatus).some((s) => s === 'connected');

  return (
    <Sheet>
      <SheetTrigger className="relative inline-flex items-center justify-center rounded-md text-sm font-medium p-2 hover:bg-accent hover:text-accent-foreground">
        <Settings className="h-5 w-5" />
        {!hasAnyConnection && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        {!hasAnyConnection && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 mt-4">
            <p className="text-sm text-amber-200">
              Configure your Azure AI Foundry API keys in <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> and restart the dev server.
              See <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local.example</code> for the required variables.
            </p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {ENDPOINTS.map((endpoint) => (
            <div
              key={endpoint.id}
              className="border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${getStatusDot(endpoint.id)}`} />
                <h3 className="font-medium text-sm">{endpoint.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {endpoint.region}
                </Badge>
              </div>
              {deploymentCounts[endpoint.id] != null && (
                <p className="text-xs text-muted-foreground">
                  {deploymentCounts[endpoint.id]} deployment{deploymentCounts[endpoint.id] !== 1 ? 's' : ''} discovered
                </p>
              )}
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={handleTest}
            disabled={testing}
            className="w-full"
          >
            <Plug className="h-3.5 w-3.5 mr-1.5" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>

          {testResult && (
            <p className={`text-xs text-center ${testResult.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {testResult}
            </p>
          )}

          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs text-muted-foreground">
              API keys are stored server-side in <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> — they never reach the browser.
              No CORS-disabled browser required.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
