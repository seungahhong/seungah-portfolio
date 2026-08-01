import { TabContentWrapper } from '@/components/layout/TabContentWrapper';
import { JsonLd, buildHomeGraph } from '@/lib/seo';
import type { Locale } from '@/lib/i18n/constants';

/**
 * 홈 전용 셸 (한국어 `/`, 영어 `/en` 공용).
 *
 * 탭 셸을 홈에만 적용해, `/career/[slug]` 같은 상세 페이지가
 * 숨겨진 탭 패널 안에 렌더링되지 않도록 한다.
 * 구조화 데이터는 탭 패널 바깥에 두어 활성 탭과 무관하게 노출한다.
 */
export function HomeShell({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  return (
    <>
      <JsonLd schema={buildHomeGraph(locale)} />
      <TabContentWrapper locale={locale}>{children}</TabContentWrapper>
    </>
  );
}
