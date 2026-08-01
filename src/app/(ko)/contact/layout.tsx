import type { Metadata } from 'next';

/**
 * 홈의 Contact 섹션과 내용이 겹치는 레거시 단독 페이지다.
 * 중복 콘텐츠로 색인되지 않도록 noindex 처리하고 사이트맵에서도 제외한다.
 */
export const metadata: Metadata = {
  title: 'Contact',
  // noindex 페이지에 다른 URL을 가리키는 canonical을 함께 두면 신호가 모순된다 — noindex만 남긴다.
  robots: { index: false, follow: false },
};

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
