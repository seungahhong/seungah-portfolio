'use client';

import { MarkdownRenderer } from '../../lib/chat/markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg font-bold mt-4 mb-2 text-[var(--foreground)]">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-semibold mt-3 mb-1.5 text-[var(--foreground)]">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold mt-2 mb-1 text-[var(--foreground)]">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-[#424245] dark:text-[#a1a1a6]">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-2 ml-4 space-y-1 list-disc text-[#424245] dark:text-[#a1a1a6]">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-2 ml-4 space-y-1 list-decimal text-[#424245] dark:text-[#a1a1a6]">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[var(--foreground)]">{children}</strong>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block bg-[#1d1d1f] text-green-400 rounded-xl px-4 py-3 text-xs font-mono overflow-x-auto my-2">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-[var(--surface-secondary)] text-[var(--foreground)] rounded-md px-1.5 py-0.5 text-xs font-mono">
        {children}
      </code>
    );
  },
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent)] hover:underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
};

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={[
          'max-w-[85%] px-5 py-3.5 text-sm',
          isUser
            ? 'bg-[var(--accent)] text-white rounded-2xl rounded-br-md shadow-sm'
            : 'apple-surface text-[var(--foreground)] rounded-2xl rounded-bl-md',
        ].join(' ')}
      >
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer components={markdownComponents}>
              {content}
            </MarkdownRenderer>
            {isStreaming && (
              <span className="inline-flex gap-1 ml-1 align-middle">
                <span className="w-1.5 h-1.5 rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
