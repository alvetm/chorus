'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { ModelConversation, ModelDeployment } from '@/app/types';
import { Copy, Trash2, Square, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsePanelProps {
  model: ModelDeployment;
  conversation?: ModelConversation;
  onAbort: () => void;
  onClear: () => void;
  onRetry?: () => void;
}

export function ResponsePanel({ model, conversation, onAbort, onClear, onRetry }: ResponsePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);

  const content =
    conversation?.streamingContent ||
    conversation?.messages?.findLast((m) => m.role === 'assistant')?.content ||
    '';
  const reasoning = conversation?.reasoningContent || '';
  const isStreaming = conversation?.status === 'streaming';
  const isError = conversation?.status === 'error';

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, reasoning, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const hasMessages = (conversation?.messages?.length ?? 0) > 0 || content.length > 0;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef} onScroll={handleScroll}>
        <div className="p-4 space-y-4">
          {conversation?.messages?.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'text-sm',
                msg.role === 'user'
                  ? 'bg-muted/50 rounded-lg p-3'
                  : 'prose prose-invert prose-sm max-w-none',
              )}
            >
              {msg.role === 'user' ? (
                <p className="text-foreground">{msg.content}</p>
              ) : (
                <Markdown rehypePlugins={[rehypeHighlight]}>{msg.content}</Markdown>
              )}
            </div>
          ))}

          {/* Reasoning block */}
          {model.reasoningModel && reasoning.length > 0 && (
            <div className="border border-border/50 rounded-lg">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2 w-full p-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className={cn('h-3 w-3 transition-transform', showReasoning && 'rotate-90')} />
                Show reasoning ({reasoning.length} chars)
              </button>
              {showReasoning && (
                <div className="px-3 pb-3">
                  <pre className="text-xs text-muted-foreground italic font-mono whitespace-pre-wrap leading-relaxed">
                    {reasoning}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Streaming content */}
          {isStreaming && content && (
            <div className="prose prose-invert prose-sm max-w-none">
              <Markdown rehypePlugins={[rehypeHighlight]}>{content}</Markdown>
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="border border-red-500/50 rounded-lg p-3 space-y-2">
              <p className="text-sm text-red-400">{conversation?.error}</p>
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Empty state */}
          {!hasMessages && !isStreaming && !isError && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Send a message to start chatting with {model.displayName}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
        <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!content} className="text-xs">
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copy
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear} className="text-xs">
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
        {isStreaming && (
          <Button size="sm" variant="destructive" onClick={onAbort} className="text-xs ml-auto">
            <Square className="h-3 w-3 mr-1" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
