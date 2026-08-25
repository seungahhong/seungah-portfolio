import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ContactSection from '../ContactSection';
import { t } from '@/lib/i18n/t';

/**
 * API 경계: ① 네트워크 인터셉터(MSW). 실제 메일을 보내지 않는다.
 * fixture 출처와 한계는 ./fixtures/README.md 참고 — [스키마 유도, 실측 캡처 아님].
 */
import ok200 from './fixtures/contact.post.200.json';
import degraded503 from './fixtures/contact.post.503.json';
import failed500 from './fixtures/contact.post.500.json';

const ENDPOINT = new URL('/api/contact', window.location.origin).toString();

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** 셀렉터는 사다리 최상단부터 — getByRole(name)으로 접근한다 */
const nameBox = () => screen.getByRole('textbox', { name: t('ko', 'contact.name') });
const emailBox = () => screen.getByRole('textbox', { name: t('ko', 'contact.email') });
const messageBox = () => screen.getByRole('textbox', { name: t('ko', 'contact.message') });
const submit = () => screen.getByRole('button', { name: t('ko', 'contact.submit') });

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(nameBox(), '홍길동');
  await user.type(emailBox(), 'test@example.com');
  await user.type(messageBox(), '열 자 이상의 메시지입니다');
}

describe('ContactSection — 클라이언트 검증 (서버 호출 전에 막는다)', () => {
  it('[AC-7.1] 이름이 비면 전송하지 않고 오류를 알린다', async () => {
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await user.type(emailBox(), 'test@example.com');
    await user.type(messageBox(), '열 자 이상의 메시지입니다');
    await user.click(submit());
    // 핸들러를 등록하지 않았으므로, 요청이 나가면 onUnhandledRequest:'error'가 실패시킨다.
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ko', 'contact.validation.name'));
  });

  it('[AC-7.2] 이메일 형식이 틀리면 전송하지 않는다', async () => {
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await user.type(nameBox(), '홍길동');
    await user.type(emailBox(), 'not-an-email');
    await user.type(messageBox(), '열 자 이상의 메시지입니다');
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('ko', 'contact.validation.emailFormat')
    );
  });

  it('[AC-7.3] 메시지가 10자 미만이면 전송하지 않는다', async () => {
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await user.type(nameBox(), '홍길동');
    await user.type(emailBox(), 'test@example.com');
    await user.type(messageBox(), '짧음');
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('ko', 'contact.validation.messageLength')
    );
  });
});

describe('ContactSection — 서버 응답 분기', () => {
  it('[AC-7.4] 성공하면 안내를 띄우고 폼을 비운다', async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.json(ok200)));
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await fillValid(user);
    await user.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent(t('ko', 'contact.success'));
    // 폼이 비지 않으면 사용자가 같은 메일을 두 번 보낸다.
    await waitFor(() => expect(nameBox()).toHaveValue(''));
    expect(messageBox()).toHaveValue('');
  });

  // ADR 0005 — 자격증명이 없으면 죽는 대신 축소하고, 사용자에게 대체 경로를 준다.
  it('[AC-7.5] 503이면 직접 메일 보내기 대체 링크를 함께 띄운다', async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.json(degraded503, { status: 503 })));
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await fillValid(user);
    await user.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent(t('ko', 'contact.error'));
    const fallback = await screen.findByRole('link', { name: t('ko', 'contact.fallback') });
    expect(fallback).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });

  it('[AC-7.6] 그 외 실패는 대체 링크 없이 오류만 알린다', async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.json(failed500, { status: 500 })));
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await fillValid(user);
    await user.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent(t('ko', 'contact.error'));
    expect(screen.queryByRole('link', { name: t('ko', 'contact.fallback') })).toBeNull();
  });

  it('[AC-7.7] 네트워크 예외는 대체 경로 안내로 이어진다', async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.error()));
    const user = userEvent.setup();
    render(<ContactSection locale="ko" />);
    await fillValid(user);
    await user.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent(t('ko', 'contact.networkError'));
    expect(
      await screen.findByRole('link', { name: t('ko', 'contact.fallback') })
    ).toBeInTheDocument();
  });
});

describe('ContactSection — 로케일', () => {
  // 서버가 로케일을 아는 컴포넌트는 prop으로 받아 t(locale, key)를 직접 부른다.
  // 이 패턴이 깨지면 한 화면에 두 언어가 섞인다.
  it('[AC-7.8] locale prop이 화면 문구를 결정한다', () => {
    const { unmount } = render(<ContactSection locale="en" />);
    expect(
      screen.getByRole('button', { name: t('en', 'contact.submit') })
    ).toBeInTheDocument();
    unmount();
    render(<ContactSection locale="ko" />);
    expect(
      screen.getByRole('button', { name: t('ko', 'contact.submit') })
    ).toBeInTheDocument();
  });
});
