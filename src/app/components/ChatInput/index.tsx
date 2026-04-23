'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatInputProps {
  selectedCount: number;
  isStreaming: boolean;
  systemPrompt: string;
  onSend: (message: string) => void;
  onSystemPromptChange: (prompt: string) => void;
}

export function ChatInput({
  selectedCount,
  isStreaming,
  systemPrompt,
  onSend,
  onSystemPromptChange,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || selectedCount === 0) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const tokenEstimate = Math.round(value.length / 4);

  return (
    <div className="border-t border-border bg-background">
      {/* System prompt section */}
      <div className="px-4">
        <button
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          className="flex items-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showSystemPrompt ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          System prompt
        </button>
        {showSystemPrompt && (
          <Textarea
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="You are a helpful assistant."
            className="text-sm mb-2 min-h-[60px] max-h-[120px] resize-none"
            rows={2}
          />
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 px-4 pb-4">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCount > 0
                ? `Message ${selectedCount} model${selectedCount !== 1 ? 's' : ''}...`
                : 'Select models to start chatting...'
            }
            className="min-h-[44px] max-h-[200px] resize-none pr-16 text-sm"
            rows={1}
            disabled={selectedCount === 0}
          />
          {value.length > 0 && (
            <span className="absolute right-3 bottom-2 text-[10px] text-muted-foreground">
              ~{tokenEstimate} tokens
            </span>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!value.trim() || isStreaming || selectedCount === 0}
          className="h-[44px] px-4"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="ml-2 text-sm">
            {isStreaming ? 'Streaming...' : `Send to ${selectedCount}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
