# 아키텍처

## 렌더링 모델

`/`, `/en`, `/career/[slug]`, `/en/career/[slug]`, `/contact`는 전부 **빌드 시점 프리렌더**된다.
동적 렌더링은 API 라우트뿐이다. 서버에서 요청 단위 정보(쿠키·헤더·검색 파라미터)를 읽는 순간
해당 라우트가 동적으로 바뀌므로, 새로 도입할 때는 정말 필요한지 먼저 따진다.

## 라우트 구성

```
app/
  (ko)/                     <html lang="ko">  — 루트 레이아웃
    (home)/                 /                 — 탭 셸 + 홈 JSON-LD
    career/[slug]/          /career/:slug     — SSG, dynamicParams=false
    contact/                /contact          — noindex 레거시 페이지
  (en)/                     <html lang="en">  — 루트 레이아웃
    en/(home)/              /en
    en/career/[slug]/       /en/career/:slug
  api/ llms.txt/ robots.ts sitemap.ts manifest.ts opengraph-image.tsx
```

**루트 레이아웃이 둘인 이유**: `<html lang>`은 루트 레이아웃에서만 지정할 수 있는데 언어별로 달라야 한다.
Next.js는 최상위 route group마다 루트 레이아웃을 두는 것을 허용한다. 대신 `app/layout.tsx`는 존재하지 않으며,
**모든 페이지 라우트가 두 group 중 하나에 속해야 한다**. 밖에 만들면 루트 레이아웃이 없어 빌드가 실패한다.

두 레이아웃은 `RootShell`(`components/layout/RootShell.tsx`)만 로케일을 바꿔 렌더링한다.
폰트·전역 CSS·프로바이더·헤더는 전부 여기 한 곳에 있다.

## 로케일 공용 페이지 본문

`components/pages/`는 로케일에 무관한 페이지 본문이다. 라우트 파일은 얇은 껍데기로 두고
로케일만 주입한다 — 같은 화면을 두 벌 유지하지 않기 위해서다.

- `HomeShell` — 홈 JSON-LD + 탭 셸
- `CareerDetailView` — 경력 상세 본문 (`locale`, `slug`를 받음)

## 탭 시스템

`TabContext`가 `?tab` 쿼리로 활성 탭을 관리한다. **기본값은 포트폴리오다** — 챗이 기본이면 SSR로 그려진
본문이 `hidden` 상태로 노출되어 검색엔진·AI 크롤러가 본문을 저평가한다. 챗은 `?tab=chat`으로 진입한다.

`useSearchParams` 대신 마운트 후 `window.location`을 읽고 `popstate`를 구독한다. 이유는 CLAUDE.md 참고.
그 대가로 `?tab=chat` 직접 진입 시 첫 프레임은 포트폴리오가 그려졌다가 하이드레이션 후 전환된다
(헤더의 섹션 목차 행도 함께 사라지며 44px 줄어든다). 정적 생성을 지키기 위한 의도된 트레이드오프다.

두 패널 모두 항상 DOM에 있고 CSS로만 감춘다. 챗 탭의 대화 상태를 보존하고, 포트폴리오 본문이
크롤러에게 항상 보이게 하기 위해서다.

## AI 챗

- `lib/chat/groq.ts` — Groq(Llama 3.3 70B) 스트리밍. `GROQ_API_KEY`가 없으면 `isChatConfigured()`가
  false를 반환하고 챗 탭이 비활성 안내를 띄운다. 그 외 기능은 정상 동작한다.
- `lib/chat/portfolio-context.ts` — 시스템 프롬프트를 데이터·i18n에서 생성한다. 프롬프트에 사실을
  직접 적지 말 것(본문과 어긋난다).
- `lib/chat/keyword-detector.ts` — 사용자 메시지의 키워드로 답변 아래 데이터 카드를 붙인다(A2UI).
  키워드는 한/영 혼용 리스트이며 `career` / `profile` 두 종류만 있다.
- 레이트 리밋은 **인스턴스 메모리**에 있다. 서버리스에서는 인스턴스마다 별도로 카운트되고 재배포 시 초기화된다.
  강한 보장이 필요하면 외부 저장소가 필요하다.
