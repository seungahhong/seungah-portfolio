'use client';

import { lazy, Suspense, ComponentProps } from 'react';

const ReactMarkdown = lazy(() => import('react-markdown'));

type MarkdownProps = ComponentProps<typeof ReactMarkdown>;

export function MarkdownRenderer(props: MarkdownProps) {
  return (
    <Suspense fallback={<span className="text-neutral-400 text-sm">Loading...</span>}>
      <ReactMarkdown {...props} />
    </Suspense>
  );
}
