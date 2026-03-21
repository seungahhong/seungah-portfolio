# 홍승아 포트폴리오 | Seungah Hong Portfolio

도전하고 노력하며 공유하는 프론트엔드 개발자, 홍승아의 포트폴리오 웹사이트입니다.

## Features

- **2-Tab Layout** — Portfolio 탭과 AI Chat 탭으로 구성된 하이브리드 레이아웃
- **AI Chat (A2UI)** — Gemini API 기반 전체화면 채팅 + 키워드 감지 카드 자동 첨부
- **Portfolio** — 경력(4개 회사), 개인 프로젝트, About, Contact 카드 레이아웃
- **i18n** — 한국어/영어 다국어 지원
- **Dark Mode** — next-themes 기반 FOUC-free 다크모드
- **Apple Design** — 미니멀 뉴트럴 디자인, 모바일 반응형
- **Server-First** — Portfolio는 SSR (SEO 최적화), Chat은 Client Component
- **Contact Form** — Gmail SMTP 연동 (rate limiting, input sanitization)
- **Accessibility** — WAI-ARIA Tabs 패턴, 키보드 네비게이션

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API (`@google/generative-ai`)
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

`.env.local` 파일을 생성하고 아래 변수를 설정하세요 (`.env.local.example` 참고):

```env
# Gemini AI API Key (AI Chat 기능에 필요)
GEMINI_API_KEY=your_gemini_api_key

# Gmail SMTP (Contact 폼에 필요)
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
```

> Gemini API key 없이도 포트폴리오는 정상 동작합니다. AI Chat 탭이 비활성화됩니다.
> Gmail 설정 없이도 포트폴리오는 정상 동작합니다. Contact 폼이 mailto: 링크로 대체됩니다.

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Gemini AI chat API (streaming)
│   │   └── contact/route.ts       # Contact form email API
│   ├── globals.css                # Global styles + design tokens
│   ├── layout.tsx                 # Root layout (Server Component)
│   └── page.tsx                   # Home page (Server Component)
├── components/
│   ├── chat/                      # AI Chat tab (ChatTab, ChatInput, ChatMessage, A2UI cards)
│   ├── layout/                    # TabNavigation, TabContentWrapper, ThemeToggle, LanguageToggle
│   ├── portfolio/                 # PortfolioContent, About, Career, Project, Contact sections
│   ├── providers/                 # ClientProviders (Theme + I18n + Tab)
│   └── ui/                        # Reusable UI components (SkillBadge)
├── helpers/datas/                 # Static data (career, profile, projects)
├── hooks/                         # Custom hooks (useChat)
├── lib/
│   ├── chat/                      # Gemini client, system prompt, keyword detector
│   └── i18n/                      # Translations (ko/en), t(), useT()
└── types/                         # TypeScript interfaces
```

## Architecture

- **Hybrid 2-Tab**: SSR Portfolio (`/`) + Client Chat overlay, controlled by TabContext
- **Tab Navigation**: WAI-ARIA Tabs pattern with keyboard navigation
- **A2UI**: Client-side keyword detection attaches data cards below AI responses
- **useChat Hook**: Extracted chat state/streaming logic reused across components
- **i18n Dual Pattern**: Server `t(locale, key)` + Client `useT()` hook
- **Gemini Streaming**: ReadableStream for real-time response streaming
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
