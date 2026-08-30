'use client';
// ChatInput은 'use client' 모듈이다 — arch-guard R2 대응(vitest에서는 no-op).

import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';
import { I18nProvider } from '@/lib/i18n/provider';
import { t } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/constants';

/** API 경계: 네트워크 호출 없음. ChatInput은 전송 요청을 부모(onSend)에게 위임한다. */

/** ChatInput은 제어 컴포넌트다 — 실제 사용처처럼 값을 들고 있는 부모를 세운다 */
function Harness({
  onSend,
  locale = 'ko',
  disabled = false,
  initialValue = '',
}: {
  onSend: (message: string) => void;
  locale?: Locale;
  disabled?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <I18nProvider locale={locale}>
      <ChatInput
        locale={locale}
        value={value}
        onChange={setValue}
        onSend={onSend}
        disabled={disabled}
      />
    </I18nProvider>
  );
}

/**
 * ⚠️ 이 textarea에는 접근 가능한 이름이 없다 — placeholder만 있고 aria-label/<label>이 없어서
 * accname 계산에 잡히지 않는다(스크린리더에 "편집" 정도로만 읽힌다).
 * 이름으로 찾을 수 없으므로 역할로 찾고, 문구는 placeholder 속성으로 단정한다.
 * 이름 부여는 이 테스트의 범위 밖이라 여기서 고치지 않고 보고만 한다.
 */
const textbox = () => screen.getByRole('textbox');
const sendButton = (locale: Locale = 'ko') =>
  screen.getByRole('button', { name: t(locale, 'chat.send') });

describe('ChatInput — 전송 트리거', () => {
  it('[AC-21.1] Enter로 전송한다', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    await user.type(textbox(), '안녕하세요{Enter}');

    expect(onSend).toHaveBeenCalledWith('안녕하세요');
  });

  it('[AC-21.2] Shift+Enter는 전송하지 않는다 (줄바꿈)', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    await user.type(textbox(), '첫 줄{Shift>}{Enter}{/Shift}둘째 줄');

    expect(onSend).not.toHaveBeenCalled();
    expect(textbox()).toHaveValue('첫 줄\n둘째 줄');
  });

  it('[AC-21.3] 전송 버튼으로도 보낼 수 있다', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    await user.type(textbox(), '버튼으로 전송');
    await user.click(sendButton());

    expect(onSend).toHaveBeenCalledWith('버튼으로 전송');
  });
});

describe('ChatInput — 보내지 않아야 할 입력', () => {
  it('[AC-21.4] 앞뒤 공백을 제거하고 전달한다', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    await user.type(textbox(), '   공백 낀 메시지   {Enter}');

    expect(onSend).toHaveBeenCalledWith('공백 낀 메시지');
  });

  it('[AC-21.5] 공백만 있는 입력은 전송하지 않는다', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    await user.type(textbox(), '    {Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('[AC-21.6] 빈 입력이면 전송 버튼이 비활성이다', () => {
    render(<Harness onSend={vi.fn()} />);
    expect(sendButton()).toBeDisabled();
  });

  it('[AC-21.7] disabled면 입력과 전송이 모두 막힌다', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Harness onSend={onSend} disabled initialValue="스트리밍 중" />);

    expect(textbox()).toBeDisabled();
    expect(sendButton()).toBeDisabled();

    await user.click(sendButton());
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('ChatInput — 전송 후 상태', () => {
  it('[AC-21.8] 전송하면 입력이 비워진다', async () => {
    const user = userEvent.setup();
    render(<Harness onSend={vi.fn()} />);

    await user.type(textbox(), '보내고 나면 비어야 한다{Enter}');

    expect(textbox()).toHaveValue('');
  });
});

describe('ChatInput — 로케일', () => {
  it('[AC-21.9] locale prop이 문구를 결정한다 (컨텍스트보다 우선)', () => {
    // 서버가 로케일을 아는 컴포넌트는 prop으로 받아야 한다 — 아니면 한 화면에 두 언어가 섞인다
    render(<Harness onSend={vi.fn()} locale="en" />);
    expect(textbox()).toHaveAttribute('placeholder', t('en', 'chat.placeholder'));
    expect(sendButton('en')).toBeInTheDocument();
  });
});
