'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, Send, Trash2, Sparkles } from 'lucide-react';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  code?: boolean;
  createdAt: Date;
}

const STARTER: ChatMessage = {
  id: 'starter',
  role: 'assistant',
  content:
    "I'm analyzing the active dataset. Ask me to adjust parameters, compare models, or explain any signal.",
  createdAt: new Date(),
};

const SUGGESTED = [
  'Tighten stop loss by 10%',
  'Switch to LSTM model',
  'Explain the last BUY signal',
];

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function StrategyAssistantChat({ stacked }: { stacked?: boolean }) {
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [threadScroll, setThreadScroll] = useState(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending, threadScroll]);

  const clear = useCallback(() => {
    setMessages([{ ...STARTER, id: `starter-${Date.now()}`, createdAt: new Date() }]);
    setThreadScroll(false);
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || pending) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThreadScroll(true);
    setPending(true);
    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content:
          'This is a scaffold reply (no MCP call yet). When wired, responses will use your workspace context and dataset metadata.',
        createdAt: new Date(),
      };
      setMessages((m) => [...m, reply]);
      setPending(false);
    }, 600);
  }, [input, pending]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const rootClass = stacked
    ? threadScroll
      ? 'flex min-h-0 w-full flex-col h-[min(70vh,720px)] sm:h-[min(72vh,780px)]'
      : 'flex w-full flex-col'
    : 'flex h-full min-h-0 flex-col rounded-xl border border-white/[0.08] bg-[#0a0a0a]';

  const listClass = stacked
    ? threadScroll
      ? 'min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 sm:px-4'
      : 'max-h-44 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4'
    : 'min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4';

  return (
    <div className={rootClass} aria-labelledby={titleId}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-semibold text-white tracking-tight truncate">
            Strategy Assistant
          </h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            <span className="inline-flex items-center rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-zinc-400">
              GPT-4o
            </span>
            <span className="text-zinc-600 mx-1">·</span>
            Mock
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
          aria-label="Clear conversation"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div ref={listRef} className={listClass} role="log" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group max-w-[92%] rounded-xl border px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'border-institutional-green/30 bg-institutional-green/10 text-zinc-100'
                    : 'border-white/[0.08] bg-white/[0.04] text-zinc-300'
                }`}
              >
                {msg.code ? (
                  <pre className="whitespace-pre-wrap rounded border border-white/[0.08] bg-black/40 p-2.5 text-xs font-mono text-zinc-300 overflow-x-auto">
                    {msg.content}
                  </pre>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <p className="mt-1 text-[10px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 tabular-nums">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {pending ? (
          <p className="text-xs text-zinc-500 pl-1 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-tan/70 animate-pulse" aria-hidden />
            Thinking…
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-white/[0.08] px-3 py-2.5 sm:px-4 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Suggested</span>
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="mb-1.5 rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-400 transition-colors"
            aria-label="Attach dataset (UI only)"
          >
            <Paperclip className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = 'auto';
              const max = 96;
              el.style.height = `${Math.min(max, el.scrollHeight)}px`;
            }}
            onKeyDown={onKeyDown}
            placeholder="Message…"
            className="min-h-[40px] max-h-24 flex-1 resize-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none ring-institutional-green/20 focus:ring-1"
          />
          <button
            type="button"
            onClick={send}
            disabled={pending || !input.trim()}
            className="mb-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-institutional-green/40 bg-institutional-green/15 text-tan hover:bg-institutional-green/25 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Send"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
