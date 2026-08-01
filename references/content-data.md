# 콘텐츠 데이터

## 정본은 이력서 문서

`docs/resume-revision-2026.md`(변경 이력·판단 근거)와 `docs/resume-revision-2026.html`(반영된 이력서 본문)이
콘텐츠의 정본이다. 경력 사실·기간·외부 링크를 고칠 일이 생기면 **먼저 이 문서와 대조**한다.

특히 `.md`의 9장은 "이력서에 싣지 않기로 한 삭제 목록"이다. 여기 있는 항목(Stripe, Weglot, 사내 디자인
시스템명, ArchUnit, Skills의 Backend 카테고리, AWS STS/IRSA, Gemini API, AI 제품화 블록 등)을 다시 넣으면
의도적인 결정을 되돌리는 것이다.

외부 근거 링크는 한 번 어긋난 적이 있다(와디즈 뉴스 3건이 한 칸씩 밀림). 링크를 추가·수정할 때는
**연결된 페이지를 실제로 열어** 제목이 항목과 맞는지 확인한다.

## 파일별 역할

| 파일 | 담는 것 |
|---|---|
| `career.ts` | 회사 목록(표시 순서), 기간, ISO 시작/종료일, 로고, 기술 스택, 항목 id·이미지·링크 |
| `profile.ts` | 이메일·링크, 스킬 그룹 키, `knowsAbout`, 블로그 지표, 경력 연차 계산 |
| `projects.ts` | 개인 프로젝트, 발표·기고(ISO 발행일 포함) |
| `studies.ts` | 학습 아카이브 — 주제군 id + 블로그 slug |
| `faq.ts` | FAQ 표시 순서 + 문구에 주입할 실측값(`faqParams`) |

전부 **언어 중립**이다. 제목·요약·불릿·이미지 대체 텍스트는 i18n JSON의 대응 경로에 있다.

## 계산되는 값

- `experienceYears` — 각 회사의 `startDate`/`endDate`로 실제 재직 개월을 합산한다(공백 기간 제외).
  화면·JSON-LD·FAQ가 모두 이 값을 참조하므로 숫자를 따로 적지 않는다.
- `career.ts`의 `today` — 재직 중 표기에 쓰이며 **빌드 시점**으로 고정된다. 재배포하면 갱신된다.
- `studyLinkCount` — 학습 아카이브 링크 수. 문구의 `{links}` 자리표시자에 주입된다.

## 항목 추가 절차

**회사 추가**: `career.ts`에 항목 → `ko.json`/`en.json`의 `career.companies.{slug}` 하위에
`title`·`logoAlt`·`role`·`description`·`summary`·`items`·`works` 전부 → 두 로케일 상세 페이지가
자동 생성되는지 확인(`generateStaticParams`가 `careerSlugs`를 읽는다).

**경력 항목(`items[]`) 추가**: `id`는 URL 해시가 된다(`/career/wadiz#msw`). 바꾸면 외부 링크가 깨진다.
`imageAlts` 배열 길이는 `images` 길이와 맞춘다. 블로그 근거는 `blogSlug`, 그 외는 `link`.

`meta[]`의 값은 둘 중 하나만 쓴다 — 기술명처럼 언어와 무관하면 `value`, 직무명처럼 번역이 필요하면
`valueKey`(두 JSON의 `career.roles.{key}`)다. 직무명을 `value`에 적으면 한/영 중 한쪽이 반대말로 노출된다.
화면과 AI 챗 프롬프트는 모두 `careerMetaValue(locale, meta)`로 값을 읽는다.

**FAQ 추가**: `faqIds`에 id → 두 JSON의 `faq.items.{id}`. 수치는 문자열에 직접 쓰지 말고
`{years}` 같은 자리표시자로 두고 `faqParams()`에 넣는다. 화면과 FAQPage JSON-LD가 같은 출처를 쓴다.

**학습 아카이브 추가**: `studies.ts`에 `{ id, blogSlug }` → 두 JSON의
`study.groups.{groupId}.links.{id}`에 제목. URL은 로케일에 맞춰 조립되므로 적지 않는다.
