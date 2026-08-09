# src/ — 진입점과 배치 기준

루트 `CLAUDE.md`는 *무엇이 조용히 깨지는가*를 다룬다. 여기는 *어디에 무엇이 있고, 새 코드를 어디에 둘 것인가*다.

## 이 모듈의 책임

`src/`는 이 저장소의 유일한 코드 모듈이다. 소유하는 것은 셋이다.

1. **정본 이력서(`docs/resume-revision-2026.*`)의 표현 계층** — 사실을 만들지 않고, 이미 정해진 사실을
   한/영 두 언어의 네 출력(화면 · JSON-LD · `/llms.txt` · 챗 프롬프트)으로 투영한다.
2. **로케일 라우팅과 SEO/GEO 신호** — `<html lang>`·canonical·hreflang·sitemap·robots.
   이 신호가 이 사이트의 존재 이유이므로, 무너지면 나머지가 다 맞아도 실패다.
3. **두 개의 런타임 표면** — 정적 프리렌더 페이지(대부분)와 동적 API 라우트 2개(`/api/chat`·`/api/contact`).
   후자만 요청 시점에 돈다.

소유하지 **않는** 것: 경력 사실 자체(이력서 문서가 정본), 블로그 콘텐츠(외부 사이트), 배포 설정.

## 진입점 → 본문 → 데이터

```
라우트                            본문                          데이터/문구
app/(ko)/(home)/page.tsx      → components/pages/HomeShell  → helpers/datas/** + lib/i18n/{ko,en}.json
app/(en)/en/(home)/page.tsx   → (같은 컴포넌트, locale만 다름)
app/(ko)/career/[slug]/       → components/pages/CareerDetailView
app/(en)/en/career/[slug]/    → (같은 컴포넌트)
app/(ko)/contact/             → (페이지가 자체 인라인 폼을 갖는다)      (영어판 없음 — noindex 폼)
                                 ⚠ components/portfolio/ContactSection 과 폼 로직이 중복이고,
                                   이쪽만 문구를 한국어로 하드코딩한다(i18n 원칙 위반).
                                   ContactSection 의 실제 소비처는 PortfolioContent 하나뿐이다.

app/sitemap.ts                → lib/seo/config.ts        ─┐
app/robots.ts                 → lib/seo/config.ts         │
app/llms.txt/route.ts         → lib/seo/llms.ts           ├─ 전부 같은 helpers + i18n을 읽는다
app/opengraph-image.tsx       → lib/seo/config.ts         │   (= "데이터 한 곳 → 출력 네 곳")
app/api/chat/route.ts         → lib/chat/portfolio-context.ts ─┘
```

라우트 파일은 얇은 껍데기다(`app/(ko)/layout.tsx`가 10줄). 로케일만 주입하고 본문은 `components/pages/`가 갖는다 — 같은 화면을 두 벌 유지하지 않기 위해서다.

## `lib/` vs `helpers/` — 새 코드를 어디에 둘 것인가

이 규칙은 코드가 이미 따르고 있었지만 어디에도 적혀 있지 않았다. 빌드가 강제할 수 없는 종류(배치는 판단이다)라 여기서 설명한다. `arch-guard`가 강제하는 것은 *방향*뿐이고 *배치*는 정하지 못한다.

| 디렉터리 | 담는 것 | 판별 질문 |
|---|---|---|
| `helpers/datas/**` | **사실(fact)** — 상수와, 그 상수만으로 계산되는 파생값(`experienceYears`·`studyLinkCount`) | "이 값이 화면·JSON-LD·llms.txt·챗 프롬프트 **네 곳에서 같아야 하는 사실**인가?" |
| `lib/**` | **표현(projection)** — 사실 + i18n을 소비해 특정 형식의 출력을 만드는 함수 | "사실이 아니라 **사실을 어떤 형식으로 내보내는 방법**인가?" |
| `types/**` | 타입 선언만. 런타임 값 금지 | "컴파일 후 사라지는가?" |
| `components/**` | JSX. 아무도 이것을 import하지 않는다 | "DOM을 만드는가?" |
| `hooks/**` | 클라이언트 전용 상태 | "`useState`/`useEffect`가 필요한가?" |

부가 규칙 세 가지:

- `lib/` 직속 단일 파일(`sections.ts`·`blog.ts`)은 도메인이 하나뿐인 소형 변환기다. **세 번째 파일이 생기면 디렉터리로 승격**한다 — `lib/seo/`·`lib/i18n/`·`lib/chat/`이 그렇게 생겼다.
- **`.tsx`를 비-UI 배럴에 재수출하지 않는다.** `lib/seo/index.ts`가 `JsonLd`를 재수출했을 때, UI가 전혀 없는 `app/sitemap.ts`·`robots.ts`·`manifest.ts`가 순수 값만 쓰면서 JSX 그래프를 전이 의존했다.
- 로케일 타입(`Locale`)의 소유는 `types/locale.ts`다. `lib/i18n/constants.ts`가 재수출하므로 기존 import 경로는 그대로 쓴다.

## 의존 방향 (한 방향)

```
app/**  →  components/**, hooks/**  →  lib/**  →  helpers/datas/**  →  types/**
```

역방향은 `scripts/arch-guard.mjs`가 빌드 실패로 막는다(예외 0건). 추가로 **지시어 없는 서버 모듈은 `'use client'` 모듈의 비컴포넌트 export(상수·훅)를 import할 수 없다** — 배럴을 경유해도 잡힌다. 클라이언트 *컴포넌트*를 import하는 것은 정상이다.

## 흔한 변경 절차

**회사 추가** — `helpers/datas/career.ts`에 항목 → 두 JSON의 `career.companies.{slug}` 아래
`title`·`logoAlt`·`role`·`description`·`summary`·`items`·`works` 전부 → `pnpm guard`.
빠뜨린 키가 있으면 `[i18n/data-contract]`가 ko/en 양쪽을 이름으로 짚어 준다.
**주의**: `items[]`의 `id`는 URL 해시가 된다(`/career/wadiz#msw`). 바꾸면 외부 링크가 깨진다.

**경력 항목의 meta 추가** — 기술명처럼 언어와 무관하면 `value`, 직무명처럼 번역이 필요하면
`valueKey`(두 JSON의 `career.roles.{key}`). **반드시** 이 구분을 지켜야 한다 —
직무명을 `value`에 적으면 한/영 중 한쪽이 반대 언어로 노출되고, 가드는 이것을 잡지 못한다(사람 판단 영역).

**FAQ 추가** — `faq.ts`의 `faqIds`에 id → 두 JSON의 `faq.items.{id}`.
수치는 문자열에 직접 쓰지 말고 `{years}` 같은 자리표시자로 두고 `faqParams()`에 넣는다.
하드코딩하면 화면과 FAQPage JSON-LD가 어긋난다.

**학습 아카이브 추가** — `studies.ts`에 `{ id, blogSlug }` → 두 JSON의 `study.groups.{groupId}.links.{id}`.
URL은 로케일에 맞춰 조립되므로 적지 않는다. **Note**: 절대 URL을 넣으면 영어 페이지에서 한국어 글로 보낸다.

**새 페이지 추가** — 반드시 `(ko)`와 `(en)` 양쪽에. 한쪽만 만들면 hreflang이 짝을 잃고,
`verify:runtime`의 `[V0/coverage-shrink]`·`[V2/missing-locale-pair]`가 실패시킨다.

## 이 슬라이스를 혼자 돌리는 법

```bash
pnpm preflight    # 무엇이 축소 모드인지 (자격증명 없어도 exit 0이 정상)
pnpm verify       # lint → typecheck → build(가드 포함) → 산출물 서빙 후 관측
```

자격증명은 필요 없다. `GROQ_API_KEY`·`GMAIL_*`가 없으면 챗과 메일 발송만 비활성화되고 나머지는 전부 정상 동작한다 — 그 축소 계약 자체를 `verify:runtime`이 검사한다.

리팩터 중이라면:

```bash
pnpm verify:snapshot --write   # 착수 전 기준선
pnpm verify:snapshot           # 각 단계 후 — diff 0이 산출물 등가성의 증거
```

스냅샷이 덮지 못하는 것: 클라이언트 상호작용(탭 키보드 이동·테마/언어 토글·`popstate`)과 챗 응답 경로. 그쪽을 건드렸다면 브라우저로 직접 확인해야 한다.
