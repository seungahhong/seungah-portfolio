# SEO / GEO

전통 검색엔진(SEO)과 생성형 AI 검색(GEO)을 함께 겨냥한다. GEO의 핵심은 순위가 아니라 **인용**이므로,
크롤링 허용 · 구조화 데이터 · 추출하기 쉬운 평문 세 가지를 갖춘다.

## 단일 출처 원칙

`lib/seo/`는 화면과 **같은 데이터·i18n**에서 메타데이터·JSON-LD·`/llms.txt`를 만든다.
구조화 데이터에만 값을 직접 적으면 본문과 어긋나고, 검색엔진이 불일치로 판단한다.
과거에 ItemList가 i18n 키(`harness`)를 이름으로 내보내 화면 제목과 달랐던 적이 있다.

| 파일 | 출력 |
|---|---|
| `config.ts` | 사이트 URL·이름·설명·키워드, `localizedUrl`, `alternatesFor`(hreflang) |
| `metadata.ts` | 루트/경력 페이지 Metadata (canonical·hreflang·OG·Twitter) |
| `schema.ts` | JSON-LD `@graph` 빌더 |
| `llms.ts` | `/llms.txt` 평문 |
| `JsonLd.tsx` | `<script type="application/ld+json">` (`<` 이스케이프 포함) |

## JSON-LD

홈: `WebSite` + `ProfilePage` + `Person` + `FAQPage` + `ItemList`
경력: `WebPage` + `BreadcrumbList` + `Person`

- `@id`는 **로케일별로 분리**한다(`/en#person` ≠ `/#person`). 언어 버전은 별개 문서다.
- 재직 이력은 schema.org **Role 패턴**을 쓴다 — `worksFor`/`alumniOf`를 `OrganizationRole`로 감싸고
  그 안에서 같은 속성을 다시 지정한다. `roleName`은 대표 직함이 아니라 **회사별 역할**을 쓴다
  (임베디드·윈도우 앱 등 회사마다 다르다).
- 날짜는 ISO 8601이어야 한다. 화면 표시 문자열(`2026.06 ~ 2026.07`)과 분리해
  `startDate`/`endDate`/`publishedAt`을 따로 둔다.

## hreflang

두 언어 버전이 서로를 가리킨다: `ko-KR`, `en-US`, `x-default`(한국어).
`alternatesFor(locale, path)` 하나가 canonical과 languages를 함께 만들고, 사이트맵도 같은 규칙을 쓴다.
언어별 URL이 없으면 성립하지 않는 신호이므로, 로케일 라우팅을 되돌린다면 hreflang도 함께 제거해야 한다.

## robots / llms.txt

- `robots.ts`는 전통 검색 봇과 생성형 AI 봇(GPTBot·ClaudeBot·PerplexityBot·Google-Extended 등)을
  **명시적으로 허용**한다. 인용되려면 먼저 크롤링이 허용돼야 한다.
- `/contact`는 robots로 막지 않는다. 크롤링을 차단하면 그 페이지의 `noindex` 메타를 읽지 못해
  오히려 색인에서 빠지지 않는다. noindex 하나만 쓴다.
- `/llms.txt`는 AI 에이전트가 HTML 파싱 없이 사이트 전체를 읽도록 한 평문이다. 한/영 URL과 요약을 함께 싣는다.

## 콘텐츠 작성 규칙 (GEO)

- **답변 우선** — 결론을 첫 문장에 둔다. About 헤드라인, 경력 요약, FAQ 답변이 모두 이 형식이다.
- **구체 수치** — 연차·아티클 수처럼 인용 가능한 근거를 상단에 노출한다. 단, 반드시 데이터에서 계산한다.
- **FAQPage** — AI 검색이 가장 많이 인용하는 구조다. 답변 본문은 `<details>` 접힘 여부와 무관하게
  항상 DOM에 있어야 한다(크롤러가 추출해야 하므로 조건부 렌더링 금지).
- 키워드 반복은 오히려 가시성을 떨어뜨린다.
