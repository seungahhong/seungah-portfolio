'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useT } from '@/lib/i18n/useT';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const { t, locale } = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, locale }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // 성공 응답은 JSON이 아니라 text/plain 스트림이다(아래 res.body). JSON은 실패 시에만 나오므로
        // 이 값은 "응답 데이터"가 아니라 에러 페이로드다 — res.json()이 any라 이름이 유일한 단서다.
        const errorPayload = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setError(t('chat.rateLimit'));
        } else if (res.status === 503) {
          setError(t('chat.unavailable'));
        } else {
          setError(errorPayload.error || t('chat.error'));
        }
        setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const current = accumulated;
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, content: current } : m))
        );
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Chat error:', err);
      setError(t('chat.error'));
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, locale, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    messages,
    inputValue,
    setInputValue,
    isStreaming,
    error,
    sendMessage,
  };
}
