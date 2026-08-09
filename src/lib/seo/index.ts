export * from './config';
export * from './schema';

// JsonLd(React 컴포넌트)는 여기서 재수출하지 않는다. 재수출하면 UI가 전혀 없는
// app/sitemap.ts·robots.ts·manifest.ts가 순수 값만 쓰면서 JSX 그래프를 전이 의존한다.
// 필요한 곳에서 '@/lib/seo/JsonLd'를 직접 import한다.
