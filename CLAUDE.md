# seungah-portfolio

홍승아(프론트엔드 개발자)의 개인 포트폴리오. 한 화면에서 SSR/SSG 포트폴리오와 Groq 스트리밍 AI 챗을
두 탭으로 전환한다. `docs/resume-revision-2026.{md,html}`이 콘텐츠의 **정본**이고, 이 사이트는 그 내용을
한/영으로 노출하는 표현 계층이다 — 경력 사실이 바뀌면 이력서 문서부터 확인한다.

## 정적 생성을 조용히 깨뜨리는 두 가지

빌드·린트·타입체크를 모두 통과하면서도 배포본이 망가지는 유형이다. 실제로 두 번 발생했다.

- **앱 상단 프로바이더에서 `useSearchParams`를 쓰지 않는다.** `TabProvider`는 전 페이지를 감싸므로,
  여기서 `useSearchParams`를 쓰면 Suspense 경계가 폴백으로 떨어지면서 **정적 페이지의 HTML 본문이
  통째로 비어버린다**(`BAILOUT_TO_CLIENT_SIDE_RENDERING`). 쿼리스트링은 마운트 후
  `window.location`에서 읽는다 — `src/components/providers/TabContext.tsx` 참고.
- **서버에서 읽는 상수를 `'use client'` 모듈에서 import하지 않는다.** 클라이언트 참조 프록시로 넘어와
  값이 사라지고, 예외도 나지 않는다. 공용 상수는 지시어 없는 모듈(`src/lib/i18n/constants.ts`)에 둔다.

## 로케일 (URL이 유일한 출처)

- `/` = 한국어, `/en` = 영어. 쿠키·localStorage 없음. `<html lang>`은 루트 레이아웃에서만 지정 가능하므로
  `(ko)` / `(en)` route group이 각각 루트 레이아웃을 갖는다.
- **새 최상위 라우트는 반드시 `(ko)` 또는 `(en)` 안에** 만든다. 밖에 만들면 루트 레이아웃이 없어 빌드가 깨진다.
  한국어에 페이지를 추가하면 영어에도 추가하고, hreflang·사이트맵이 자동으로 따라오는지 확인한다.
- 내부 링크는 하드코딩하지 말고 `localizedPath(locale, path)`를 쓴다.

## 문구는 전부 i18n JSON에

- 표시 문구는 100% `src/lib/i18n/{ko,en}.json`. `src/helpers/datas/**`에는 id·날짜·URL·이미지 경로·기술명만 둔다.
  데이터 파일이나 컴포넌트에 한국어를 넣는 순간 영어 페이지가 반쪽이 된다.
- **`t()`는 키를 못 찾으면 키 문자열을 그대로 반환한다.** 오타가 에러 없이 화면에 노출되므로 렌더링 결과를 눈으로 확인한다.
- ko.json과 en.json은 **구조가 완전히 같아야 한다**(키·배열 길이까지).

## 데이터 한 곳 → 출력 네 곳

`helpers/datas/**` + i18n JSON을 고치면 화면 · JSON-LD · `/llms.txt` · AI 챗 시스템 프롬프트가 함께 바뀐다.
어느 하나에 문구를 하드코딩하면 그 순간 네 출력이 어긋나고, 구조화 데이터와 본문이 불일치해 SEO에 역효과가 난다.

## 눈에 잘 안 띄는 스타일 함정

- 다크 모드에서 `--surface`는 `--surface-secondary`보다 **어둡다**. 라이트 모드와 반대라서, "떠 있는" 표현이
  필요한 곳은 전용 토큰(`--segment-track` / `--segment-active`)을 쓴다.
- `.stagger-1` ~ `.stagger-6`만 존재한다. Tailwind가 동적 생성하지 못하므로 인덱스는 반드시 clamp한다.
- 섹션 앵커의 `scroll-mt-*`는 sticky 헤더 높이를 따라간다(홈 92px = 탭 48 + 섹션 목차 44, 상세 페이지 48).
  헤더 높이를 바꾸면 앵커 오프셋도 함께 고친다.
- 등장 애니메이션은 `animation-fill-mode: both`라 시작 전 `opacity: 0`이다. 그래서
  `prefers-reduced-motion` 블록에서 명시적으로 `opacity: 1`로 되돌린다 — 지우면 콘텐츠가 사라진다.

## 도구

- `pnpm lint`는 `eslint src`다. Next 16에서 `next lint`가 제거돼 스크립트를 바꿨다.
- `next build`가 `tsconfig.json`을 다시 쓴다(`jsx`, `include`). 이 diff는 정상이므로 되돌리지 않는다.
- **테스트가 없다.** 빌드 통과 ≠ 동작 보장이므로 반드시 @references/verification.md 절차를 따른다.

## 상세 문서

@references/architecture.md
@references/i18n.md
@references/content-data.md
@references/seo-geo.md
@references/ui-conventions.md
@references/verification.md
