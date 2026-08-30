'use client';
// ChatMessage는 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

/** API 경계: 네트워크 호출 없음. 순수 표현 컴포넌트다. */

describe('ChatMessage — user와 assistant는 다르게 렌더된다', () => {
  it('[AC-23.1] 사용자 메시지는 마크다운을 해석하지 않고 평문으로 보여준다', () => {
    // 사용자가 친 문자열이 서식으로 둔갑하면 자기가 뭘 보냈는지 확인할 수 없다
    const { container } = render(<ChatMessage role="user" content="**굵게** 보이면 안 된다" />);

    expect(screen.getByText('**굵게** 보이면 안 된다')).toBeInTheDocument();
    expect(container.querySelector('strong')).toBeNull();
  });

  it('[AC-23.2] 어시스턴트 메시지는 마크다운을 해석한다', async () => {
    render(<ChatMessage role="assistant" content="**굵게** 보여야 한다" />);

    // MarkdownRenderer는 lazy + Suspense다 — 첫 프레임은 폴백이고 그 다음에 본문이 온다
    expect((await screen.findByText('굵게')).tagName).toBe('STRONG');
  });

  it('[AC-23.3] 사용자 메시지의 줄바꿈은 보존된다', () => {
    render(<ChatMessage role="user" content={'첫 줄\n둘째 줄'} />);
    // whitespace-pre-wrap이 없으면 두 줄이 한 줄로 붙는다
    expect(screen.getByText(/첫 줄/)).toHaveClass('whitespace-pre-wrap');
  });
});

describe('ChatMessage — 링크 안전성', () => {
  it('[AC-23.4] 어시스턴트가 만든 링크는 새 탭 안전 속성을 갖는다', async () => {
    // 모델 출력에서 온 링크다 — rel이 없으면 window.opener를 통해 원본 탭이 조작될 수 있다
    render(
      <ChatMessage role="assistant" content="[블로그](https://seungahhong.github.io/ko/)" />
    );

    const link = await screen.findByRole('link', { name: '블로그' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('ChatMessage — 스트리밍 표시', () => {
  it('[AC-23.5] 스트리밍 중에는 진행 표시가 붙는다', () => {
    const { container } = render(
      <ChatMessage role="assistant" content="생성 중" isStreaming />
    );
    // 진행 표시는 장식이라 역할·이름이 없다 — 셀렉터 사다리의 마지막 단계(locator)를 쓴다
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(3);
  });

  it('[AC-23.6] 스트리밍이 끝나면 진행 표시가 사라진다', () => {
    const { container } = render(<ChatMessage role="assistant" content="완료" />);
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(0);
  });

  it('[AC-23.7] 사용자 메시지에는 진행 표시가 붙지 않는다', () => {
    const { container } = render(<ChatMessage role="user" content="질문" isStreaming />);
    expect(container.querySelectorAll('.animate-bounce')).toHaveLength(0);
  });
});
