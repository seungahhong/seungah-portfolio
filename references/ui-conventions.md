# UI 규칙

Apple 스타일 — 뉴트럴 팔레트, 큰 라운드, 얕은 그림자, 넉넉한 여백.

## 디자인 토큰

`globals.css`의 CSS 변수로 라이트/다크를 전환한다. Tailwind `dark:` 변형은 토큰으로 해결되지 않는
경우에만 쓴다(예: 본문 텍스트 색).

**함정**: 다크 모드에서 `--surface`(#1c1c1e)는 `--surface-secondary`(#2c2c2e)보다 **어둡다**.
라이트 모드(#fff vs #f5f5f7)와 관계가 반대다. "트랙 위에 떠 있는 요소"를 표현할 때 그냥 쓰면
다크에서 가라앉아 보인다. 그래서 세그먼티드 컨트롤은 전용 토큰(`--segment-track` / `--segment-active`)을 쓴다.
비슷한 표현을 새로 만들 때도 토큰을 추가하는 편이 안전하다.

## sticky 헤더

헤더는 두 행이다.

- 1행 `h-12`(48px) — 홈에서는 탭, 상세 페이지에서는 홈으로 돌아가는 링크
- 2행 `h-11`(44px) — 섹션 목차. **포트폴리오 탭에서만** 나타난다

섹션 목차를 본문이 아니라 헤더에 둔 이유: 섹션 안에 `sticky`를 걸면 그 섹션을 지나는 순간 고정이 풀린다.

**앵커 오프셋을 헤더 높이에 맞춘다.** 홈은 92px이므로 섹션 `scroll-mt-28`(112px), 카드·항목 `scroll-mt-32`(128px).
상세 페이지는 헤더가 48px이라 `scroll-mt-20`(80px). 헤더 높이를 바꾸면 이 값들도 함께 고친다.
`SectionNav`의 IntersectionObserver `rootMargin` 상단값(-92px)도 같은 기준이다.

## 애니메이션

- `.animate-fade-in-up` + `.stagger-1` ~ `.stagger-6`. **6까지만 존재한다.**
  Tailwind가 동적 클래스명을 생성하지 못하므로 인덱스는 `Math.min(i + 2, 6)`처럼 clamp한다.
- fill-mode가 `both`라 애니메이션 시작 전 `opacity: 0`이다. 따라서 `prefers-reduced-motion` 블록에서
  `animation: none`과 함께 **`opacity: 1`을 명시적으로 되돌린다**. 이 줄을 지우면 콘텐츠가 보이지 않는다.

## 접근성

- 탭은 WAI-ARIA Tabs 패턴 — `role="tablist"/"tab"/"tabpanel"`, roving tabindex(활성 0 / 비활성 -1),
  화살표·Home·End 키 이동. 탭 순서를 바꾸면 `TABS` 배열만 고치면 된다.
- `<summary>` 안에 링크를 넣지 않는다. summary의 접근성 이름이 내용에서 계산되므로 링크 텍스트가
  질문에 섞여 중복으로 읽힌다. FAQ의 딥링크 앵커는 `<details>` 바깥에 절대 위치로 둔다.
- `AnchorLink`는 평소 `opacity-0`이지만 `focus:opacity-100`으로 키보드 포커스 시 드러난다.
- 장식용 이미지는 `alt=""` + `aria-hidden`, 의미 있는 이미지는 i18n에서 대체 텍스트를 읽는다.
- 스킵 링크는 `SiteHeader` 최상단에 있다(`#main-content`).

## 반응형

- 헤더 섹션 목차는 좁은 화면에서 가로 스크롤되고 스크롤바는 `.no-scrollbar`로 감춘다.
- 프로필 사진은 flex 안에서 찌그러지지 않도록 `shrink-0` + 고정 크기 + `aspect-square`를 함께 건다.
- 카드 하단 링크 영역은 `mt-auto`로 카드 높이와 무관하게 바닥에 고정한다(카드 그리드의 높이가 제각각이므로).
