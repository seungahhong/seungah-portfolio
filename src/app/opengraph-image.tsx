import { ImageResponse } from 'next/og';
import { blogStats, careers, experienceYears } from '@/helpers';
import { t } from '@/lib/i18n/t';
import { OG_IMAGE } from '@/lib/seo/config';

export const alt = `${t('en', 'profile.name')} — ${t('en', 'profile.role')}`;
// 크기를 여기 다시 적지 않는다. 이 값은 <meta og:image:width>로도 나가므로 두 곳에 두면
// 한쪽만 바뀌었을 때 실제 이미지와 메타데이터가 어긋나고, 그것을 잡는 검사가 없다.
export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = 'image/png';

/**
 * OG 이미지 (1200x630).
 *
 * 기본 폰트가 한글 글리프를 포함하지 않으므로 라틴 문자로만 구성한다.
 * 수치는 포트폴리오 데이터에서 직접 읽어 본문과 항상 일치시킨다.
 */
export default function OpengraphImage() {
  const stats = [
    `${experienceYears}+ years`,
    `${careers.length} companies`,
    `${blogStats.articles} articles`,
  ].join('   ·   ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0b0b0d 0%, #1c1c1e 60%, #0a2540 100%)',
          color: '#f5f5f7',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: '#86868b', textTransform: 'uppercase' }}>
          Portfolio
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 20, letterSpacing: -2 }}>
          {t('en', 'profile.name')}
        </div>
        <div style={{ fontSize: 42, marginTop: 8, color: '#2997ff', fontWeight: 600 }}>
          {t('en', 'profile.role')}
        </div>
        <div style={{ fontSize: 30, marginTop: 32, color: '#a1a1a6' }}>
          React · TypeScript · Next.js · Test Automation · AI Workflow
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            fontSize: 26,
            color: '#86868b',
            justifyContent: 'space-between',
          }}
        >
          <span>{stats}</span>
          <span>seungah-portfolio.vercel.app</span>
        </div>
      </div>
    ),
    size
  );
}
