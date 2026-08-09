# 0002 · 탭 상태를 `window.location`에서 읽는다

## 결정

`TabProvider`는 `useSearchParams()`를 쓰지 않는다. 마운트 후 `window.location`에서 `?tab`을 읽고
`popstate`를 구독한다.

## 맥락

`TabProvider`는 전 페이지를 감싼다. 여기서 `useSearchParams()`를 쓰면 Suspense 경계가 폴백으로
떨어지면서 **정적 페이지의 HTML 본문이 통째로 비어버린다**(`BAILOUT_TO_CLIENT_SIDE_RENDERING`).
실제로 한 번 발생했다. 빌드·린트·타입체크는 전부 통과했고 배포본만 비어 있었다.

## 포기한 것

`?tab=chat`으로 직접 진입하면 **첫 프레임에 포트폴리오가 그려졌다가** 하이드레이션 후 챗으로 바뀐다.
헤더의 섹션 목차 행도 함께 사라지며 44px 줄어든다. 정적 생성을 지키기 위한 의도된 트레이드오프다.

대안으로 검토했다가 버린 것:
- **프로바이더를 Suspense로 감싸기** — 폴백이 뜨는 순간 본문이 비는 건 동일하다.
- **탭 상태를 URL에서 빼기** — 공유 가능한 링크(`?tab=chat`)를 잃는다.

## 강제하는 가드

`scripts/arch-guard.mjs`의 R9 — `src/components/providers/**`에서 `useSearchParams`를 쓰면 빌드 실패.

이전에는 `next build`가 이것을 잡아 주긴 했지만, 오류 위치가 minify된 프로덕션 청크
(`.next/server/chunks/ssr/_0i7_044._.js:2:2692`)라 26개 클라이언트 컴포넌트 중 어디인지 알 수 없었다.
R9는 소스 위치(`file:line:col`)를 낸다.

## 재검토 트리거

Next.js가 부분 프리렌더링(PPR)으로 이 제약을 없애면 원래 방식으로 돌아갈 수 있다.
그때는 첫 프레임 깜빡임도 함께 사라진다.
