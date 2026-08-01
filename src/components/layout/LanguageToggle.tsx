'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n/useT';
import { localizedPath, neutralPath } from '@/lib/i18n/constants';

/**
 * 언어 전환.
 *
 * 로케일이 URL에 있으므로 상태 토글이 아니라 같은 문서의 다른 언어 버전으로 이동한다.
 * 링크라서 검색엔진이 두 언어 버전의 관계를 따라갈 수 있고, 주소를 그대로 공유할 수 있다.
 */
export function LanguageToggle() {
  const pathname = usePathname();
  const { t, locale } = useT();
  const target = locale === 'ko' ? 'en' : 'ko';
  const href = localizedPath(target, neutralPath(pathname));

  return (
    <Link
      href={href}
      hrefLang={target}
      className="h-8 px-3 inline-flex items-center rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
      aria-label={t('lang.switchTo')}
      lang={target}
    >
      {t('lang.toggle')}
    </Link>
  );
}
