'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n/useT';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestionChips } from './SuggestionChips';
import { A2UICards } from './A2UICards';

export function ChatTab() {
  const { t } = useT();
  const { messages, inputValue, setInputValue, isStreaming, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => setAvailable(data.available === true))
      .catch(() => setAvailable(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showWelcome = messages.length === 0;
  const isUnavailable = available === false;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="max-w-lg w-full text-center mb-10 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--surface-secondary)] flex items-center justify-center shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]" aria-hidden="true">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
              </div>
              <h2
                className="text-3xl font-bold tracking-tight mb-3 text-[var(--foreground)]"
                style={{ letterSpacing: '-0.03em' }}
              >
                {t('chat.tab.welcome.title')}
              </h2>
              <p className="text-base text-[#86868b] leading-relaxed">
                {t('chat.tab.welcome.subtitle')}
              </p>
            </div>
            <div className="max-w-lg w-full animate-fade-in-up stagger-1">
              <SuggestionChips onSelect={sendMessage} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg, index) => (
              <div key={msg.id}>
                <ChatMessage
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && msg.role === 'assistant' && msg.id === messages[messages.length - 1]?.id}
                />
                {msg.role === 'assistant' && msg.content && !isStreaming && (
                  <A2UICards
                    userMessage={messages[index - 1]?.content || ''}
                  />
                )}
              </div>
            ))}
            {error && (
              <div className="mx-auto max-w-sm mt-3 px-5 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Unavailable notice */}
      {isUnavailable && (
        <div className="text-center py-3 text-sm text-[#86868b]">
          {t('chat.unavailable')}
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 max-w-3xl mx-auto w-full px-4 pb-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          disabled={isStreaming || isUnavailable}
        />
      </div>
    </div>
  );
}
