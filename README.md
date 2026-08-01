# 홍승아 포트폴리오 | Seungah Hong Portfolio

프론트엔드에서 풀스택·AI 워크플로까지 반경을 넓혀온 개발자, 홍승아의 포트폴리오 웹사이트입니다.

## Features

- **2-Tab Layout** — Portfolio 탭(기본)과 AI Chat 탭(`?tab=chat`)으로 구성된 하이브리드 레이아웃
- **AI Chat (A2UI)** — Groq(Llama 3.3 70B) 기반 스트리밍 채팅 + 키워드 감지 카드 자동 첨부
- **Portfolio** — About, 경력(4개 회사), 프로젝트, 학습 아카이브, FAQ, Contact 섹션
- **Career 상세 페이지** — `/career/[slug]`·`/en/career/[slug]` SSG 페이지와 항목 단위 `#anchor` 딥링크
- **SEO / GEO** — JSON-LD(Person·WebSite·ProfilePage·FAQPage·BreadcrumbList·ItemList), sitemap, AI 봇 허용 robots, `/llms.txt`, 동적 OG 이미지
- **i18n** — 한국어(`/`)·영어(`/en`) 전용 URL. 모든 표시 문구를 `ko.json` / `en.json`에서 관리하고, 데이터 파일에는 구조만 둡니다
- **hreflang** — 두 언어 버전이 canonical·hreflang·사이트맵으로 서로 연결됩니다. 기술블로그 링크도 로케일에 맞는 번역본(`/ko/posts` ↔ `/en/posts`)으로 연결됩니다
- **Dark Mode** — next-themes 기반 FOUC-free 다크모드
- **Apple Design** — 미니멀 뉴트럴 디자인, 모바일 반응형
- **Server-First** — Portfolio는 SSR/SSG, Chat만 Client Component
- **Contact Form** — Gmail SMTP 연동 (rate limiting, input sanitization)
- **Accessibility** — WAI-ARIA Tabs 패턴, 스킵 링크, 키보드 네비게이션

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI**: Groq API (`groq-sdk`, Llama 3.3 70B)
- **Theme**: next-themes
- **Email**: Nodemailer (Gmail SMTP)
- **Markdown**: react-markdown + remark-gfm
- **Linting**: ESLint + husky + lint-staged

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

`.env.local` 파일을 생성하고 아래 변수를 설정하세요.

```env
# Groq API Key (AI Chat 기능에 필요)
GROQ_API_KEY=your_groq_api_key

# Gmail SMTP (Contact 폼에 필요)
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password

# 배포 도메인 (canonical / sitemap / JSON-LD 기준값, 미설정 시 기본값 사용)
NEXT_PUBLIC_SITE_URL=https://seungah-portfolio.vercel.app
```

> Groq API key 없이도 포트폴리오는 정상 동작합니다. AI Chat 탭이 비활성화됩니다.
> Gmail 설정 없이도 포트폴리오는 정상 동작합니다. Contact 폼이 mailto: 링크로 대체됩니다.

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint & Typecheck

```bash
pnpm lint
pnpm typecheck
```

## Project Structure

```
src/
├── app/
│   ├── (ko)/                      # 한국어 루트 레이아웃 (<html lang="ko">)
│   │   ├── (home)/                # /            — 탭 셸 + 홈 JSON-LD
│   │   ├── career/[slug]/         # /career/:slug (SSG)
│   │   └── contact/               # noindex 레거시 페이지
│   ├── (en)/en/                   # 영어 루트 레이아웃 (<html lang="en">)
│   │   ├── (home)/                # /en
│   │   └── career/[slug]/         # /en/career/:slug (SSG)
│   ├── api/
│   │   ├── chat/route.ts          # Groq AI chat API (streaming)
│   │   └── contact/route.ts       # Contact form email API
│   ├── llms.txt/route.ts          # AI 검색·에이전트용 평문 요약
│   ├── opengraph-image.tsx        # 동적 OG 이미지 (1200x630)
│   ├── robots.ts                  # AI 봇 포함 크롤링 정책
│   ├── sitemap.ts                 # 사이트맵
│   ├── manifest.ts                # 웹 매니페스트
│   ├── globals.css                # Global styles + design tokens
│   └── layout.tsx                 # Root layout (Server Component)
├── components/
│   ├── chat/                      # AI Chat tab (ChatTab, ChatInput, ChatMessage, A2UI cards)
│   ├── layout/                    # SiteHeader, TabNavigation, TabContentWrapper, Theme/Language toggles
│   ├── pages/                     # 로케일 공용 페이지 본문 (HomeShell, CareerDetailView)
│   ├── portfolio/                 # PortfolioContent, SectionNav, About/Career/Project/Study/Faq/Contact
│   ├── providers/                 # ClientProviders (Theme + I18n + Tab)
│   └── ui/                        # Reusable UI (SkillBadge, AnchorLink)
├── helpers/datas/                 # 언어 무관 데이터 (career, profile, projects, studies, faq)
├── hooks/                         # Custom hooks (useChat)
├── lib/
│   ├── blog.ts                    # 로케일별 기술블로그 URL 빌더
│   ├── chat/                      # Groq client, system prompt, keyword detector
│   ├── i18n/                      # 번역 JSON (ko/en), t()/tList(), useT(), LocaleSync, constants
│   └── seo/                       # SEO config, JSON-LD schema, JsonLd, llms.txt generator
└── types/                         # TypeScript interfaces (career, project)
```

## Architecture

- **Hybrid 2-Tab**: SSR Portfolio (`/`) + Client Chat overlay, controlled by TabContext
- **Locale Routing**: 로케일은 URL이 결정합니다 (`/` 한국어, `/en` 영어). `(ko)`/`(en)` route group이 각자 루트 레이아웃을 가져 `<html lang>`이 언어별로 정확합니다
- **Route Groups**: `(home)`이 탭 셸을 담당하고, 경력 상세는 탭 밖에서 독립 렌더링
- **Tab Navigation**: WAI-ARIA Tabs pattern with keyboard navigation
- **Static-Safe Tabs**: TabContext는 `useSearchParams` 대신 마운트 후 `window.location`을 읽는다 — `useSearchParams`는 정적 페이지를 클라이언트 렌더링으로 떨어뜨려 HTML 본문을 비워버린다
- **A2UI**: Client-side keyword detection attaches data cards below AI responses
- **useChat Hook**: Extracted chat state/streaming logic reused across components
- **i18n Dual Pattern**: Server `t(locale, key, params)` / `tList()` + Client `useT()`, 쿠키로 로케일 공유
- **JSON-only Copy**: 표시 문구는 전부 `src/lib/i18n/{ko,en}.json`에 있고 `src/helpers/datas/**`는 id·날짜·URL·이미지 경로만 담습니다
- **Server-safe Constants**: 서버에서 읽는 상수는 `'use client'` 모듈이 아닌 `src/lib/i18n/constants.ts`에 둡니다 (클라이언트 참조 프록시로 넘어가면 조용히 실패합니다)
- **Single Source of Truth**: 화면·JSON-LD·`/llms.txt`·AI 시스템 프롬프트가 모두 `src/helpers/datas/`를 참조
- **Groq Streaming**: ReadableStream for real-time response streaming
- **Security**: Rate limiting on API routes, input sanitization, server-only API keys

## Deployment

Vercel에 배포됩니다.

## Commit Convention

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `chore`: 기타 작업

Pre-commit hook이 설정되어 있어 staged `.ts`/`.tsx` 파일에 대해 ESLint가 자동 실행됩니다.

## License

MIT
