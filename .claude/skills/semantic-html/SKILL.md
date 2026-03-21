---
name: semantic-html
description: |
  시맨틱 HTML 태그 가이드 및 코드 리뷰 skill입니다.
  HTML 요소를 의미에 맞게 올바르게 사용하도록 안내하고, 비시맨틱 마크업을 시맨틱 마크업으로 변환합니다.
  React/Next.js 컴포넌트 작성 시에도 적용됩니다.

  다음 상황에서 이 skill을 사용하세요:
  - "시맨틱 태그", "시맨틱 HTML", "semantic tag" 등 시맨틱 마크업 관련 요청
  - HTML 구조 리뷰, 마크업 개선, 태그 선택에 대한 질문
  - "div 대신 뭘 써야 해?", "이 태그가 맞아?" 같은 태그 선택 관련 질문
  - 새 페이지나 컴포넌트의 HTML 구조를 설계할 때
  - SEO 개선을 위한 마크업 최적화 요청
  - "div soup", "div 지옥" 등 과도한 div 사용 문제 해결
  - 레이아웃 구조 설계, 페이지 뼈대 잡기 요청
---

# 시맨틱 HTML (Semantic HTML) Skill

## 개요

시맨틱 HTML은 콘텐츠의 의미와 역할에 맞는 HTML 태그를 사용하는 것을 뜻한다.
`<div>`와 `<span>`은 의미가 없는 범용 컨테이너이므로, 콘텐츠의 성격을 표현할 수 있는 태그가 있다면 그것을 우선 사용한다.

시맨틱 태그를 쓰면 좋은 이유:
- **접근성**: 스크린리더가 페이지 구조를 파악하고, 사용자가 원하는 영역으로 바로 이동할 수 있다
- **SEO**: 검색엔진이 콘텐츠의 구조와 중요도를 더 정확히 이해한다
- **유지보수**: 코드만 봐도 각 영역의 역할이 드러나므로 다른 개발자가 이해하기 쉽다
- **일관성**: 팀 내에서 마크업 구조에 대한 공통 언어를 제공한다

---

## 페이지 구조 태그

### `<header>` — 머리글 영역

페이지 또는 섹션의 도입부를 나타낸다. 로고, 네비게이션, 검색 폼 등이 들어간다.

```tsx
// 페이지 전체 헤더
<header>
  <h1>사이트 이름</h1>
  <nav>...</nav>
</header>

// 기사 내부 헤더
<article>
  <header>
    <h2>기사 제목</h2>
    <time dateTime="2024-01-15">2024년 1월 15일</time>
  </header>
  <p>기사 본문...</p>
</article>
```

**주의**: `<header>`는 페이지에 여러 개 있을 수 있다. `<article>`, `<section>` 안에서도 사용한다.

### `<nav>` — 내비게이션 영역

주요 탐색 링크 그룹을 나타낸다. 사이트 전체 메뉴, 목차, 페이지네이션 등에 사용한다.

```tsx
<nav aria-label="메인 메뉴">
  <ul>
    <li><Link href="/about">About</Link></li>
    <li><Link href="/projects">Projects</Link></li>
    <li><Link href="/contact">Contact</Link></li>
  </ul>
</nav>
```

**주의**: 모든 링크 그룹이 `<nav>`는 아니다. 주요 탐색 목적의 링크 모음에만 사용한다. 푸터의 부가 링크는 `<nav>` 없이도 괜찮다. 페이지에 `<nav>`가 여러 개라면 `aria-label`로 구분한다.

### `<main>` — 본문 영역

페이지의 핵심 콘텐츠를 나타낸다. 페이지당 하나만 사용한다.

```tsx
<body>
  <header>...</header>
  <main>
    {/* 이 페이지의 고유한 콘텐츠 */}
    {children}
  </main>
  <footer>...</footer>
</body>
```

**주의**: `<header>`, `<footer>`, `<nav>`, `<aside>`는 `<main>` 밖에 둔다. `<main>`은 "이 페이지에서만 볼 수 있는 고유 콘텐츠" 영역이다.

### `<aside>` — 부가 콘텐츠 영역

본문과 관련은 있지만 독립적으로 분리할 수 있는 콘텐츠이다. 사이드바, 관련 링크, 광고 등에 사용한다.

```tsx
<main>
  <article>
    <p>본문 내용...</p>
  </article>
  <aside>
    <h2>관련 프로젝트</h2>
    <ul>
      <li><a href="/projects/a">프로젝트 A</a></li>
    </ul>
  </aside>
</main>
```

### `<footer>` — 바닥글 영역

페이지 또는 섹션의 마무리 정보를 나타낸다. 저작권, 연락처, 관련 링크 등이 들어간다.

```tsx
<footer>
  <p>&copy; 2024 홍승아. All rights reserved.</p>
  <nav aria-label="푸터 링크">
    <a href="/privacy">개인정보처리방침</a>
  </nav>
</footer>
```

---

## 콘텐츠 구획 태그

### `<article>` — 독립적인 콘텐츠

그 자체로 완결된 콘텐츠 단위이다. RSS 피드에 넣었을 때 의미가 통하는지를 기준으로 판단한다.
블로그 글, 뉴스 기사, 댓글, 포럼 게시물, 제품 카드 등에 사용한다.

```tsx
// 프로젝트 카드 목록
<section>
  <h1>Projects</h1>
  {projects.map((project) => (
    <article key={project.title}>
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <a href={`/projects/${project.href}`}>자세히 보기</a>
    </article>
  ))}
</section>
```

### `<section>` — 주제별 콘텐츠 그룹

관련 콘텐츠를 주제별로 묶는다. 보통 제목(`<h2>`~`<h6>`)을 포함한다.
제목 없이 단순히 스타일링 목적으로 묶는다면 `<div>`가 더 적합하다.

```tsx
<main>
  <section>
    <h2>기술 스택</h2>
    <ul>
      <li>React</li>
      <li>TypeScript</li>
    </ul>
  </section>
  <section>
    <h2>경력</h2>
    <p>...</p>
  </section>
</main>
```

### `<section>` vs `<article>` vs `<div>` 판단 기준

| 질문 | 예 → | 아니오 → |
|------|------|----------|
| 이 콘텐츠가 독립적으로 의미가 통하는가? | `<article>` | 다음 질문 |
| 이 콘텐츠가 공통 주제로 묶이고 제목이 있는가? | `<section>` | 다음 질문 |
| 스타일링/레이아웃 목적인가? | `<div>` | `<div>` |

---

## 텍스트 시맨틱 태그

### 제목 (`<h1>` ~ `<h6>`)

콘텐츠의 계층 구조를 나타낸다.

**규칙:**
- 페이지당 `<h1>`은 하나만 사용한다
- 제목 레벨을 건너뛰지 않는다 (`h1` → `h3` 금지, `h1` → `h2` → `h3` 순서)
- 글자 크기를 위해 제목 태그를 선택하지 않는다 (크기는 CSS로 조절)

```tsx
// 잘못된 예 — 크기 때문에 h4를 사용
<h4 className="text-sm">작은 제목</h4>

// 올바른 예 — 구조에 맞는 레벨 + CSS로 크기 조절
<h2 className="text-sm font-semibold">작은 제목</h2>
```

### `<p>` — 문단

텍스트 문단을 나타낸다. 문장 또는 관련 문장들의 모음에 사용한다.

### `<strong>` vs `<b>` — 강조

- `<strong>`: 의미적으로 중요한 내용 (스크린리더가 강조해서 읽음)
- `<b>`: 시각적으로 굵게 표시하지만 의미적 중요도는 없음 (키워드, 제품명 등)

### `<em>` vs `<i>` — 강세/기울임

- `<em>`: 의미적 강세 (스크린리더가 억양을 바꿔 읽음)
- `<i>`: 시각적 기울임이지만 의미적 강세는 없음 (전문 용어, 외국어 등)

### `<time>` — 날짜/시간

기계가 읽을 수 있는 날짜/시간을 표현한다. SEO와 접근성에 도움이 된다.

```tsx
<time dateTime="2024-03-15">2024년 3월 15일</time>
<time dateTime="2024-03-15T14:30:00+09:00">오후 2시 30분</time>
```

### `<address>` — 연락처 정보

가장 가까운 `<article>` 또는 `<body>`의 연락처 정보를 나타낸다.

```tsx
<address>
  <a href="mailto:hello@example.com">hello@example.com</a>
  <a href="tel:+821012345678">010-1234-5678</a>
</address>
```

### `<blockquote>` / `<cite>` — 인용

```tsx
<blockquote cite="https://example.com/quote-source">
  <p>디자인은 어떻게 보이는가가 아니라 어떻게 작동하는가이다.</p>
  <footer>— <cite>스티브 잡스</cite></footer>
</blockquote>
```

### `<figure>` / `<figcaption>` — 그림과 설명

이미지, 차트, 코드 블록 등 자체 포함된 콘텐츠와 그에 대한 설명을 묶는다.

```tsx
<figure>
  <Image src="/screenshot.png" alt="대시보드 메인 화면" width={800} height={600} />
  <figcaption>프로젝트 대시보드의 메인 화면 스크린샷</figcaption>
</figure>
```

---

## 목록 태그

### `<ul>` — 순서 없는 목록
항목 간 순서가 중요하지 않을 때 사용한다. 메뉴, 태그 목록, 기능 나열 등.

### `<ol>` — 순서 있는 목록
단계별 과정, 순위, 절차 등 순서가 의미 있을 때 사용한다.

### `<dl>` / `<dt>` / `<dd>` — 정의 목록
용어와 설명, 메타데이터 키-값 쌍에 적합하다.

```tsx
// 프로젝트 상세 정보
<dl>
  <dt>기술 스택</dt>
  <dd>React, TypeScript, Next.js</dd>

  <dt>기간</dt>
  <dd>2024.01 - 2024.06</dd>

  <dt>역할</dt>
  <dd>프론트엔드 개발</dd>
</dl>
```

---

## 인터랙티브 요소

### `<button>` vs `<a>` 판단 기준

| 행동 | 태그 |
|------|------|
| 페이지 이동, 외부 링크 | `<a href="...">` |
| 동작 실행 (토글, 삭제, 제출) | `<button>` |
| 파일 다운로드 | `<a href="..." download>` |

```tsx
// 잘못된 예 — div로 버튼 흉내
<div onClick={handleClick} className="cursor-pointer">삭제</div>

// 올바른 예
<button onClick={handleClick}>삭제</button>
```

### `<details>` / `<summary>` — 접기/펼치기

JS 없이도 동작하는 네이티브 아코디언이다.

```tsx
<details>
  <summary>프로젝트 상세 설명</summary>
  <p>이 프로젝트는 Next.js 기반의 포트폴리오 웹사이트로...</p>
</details>
```

### `<dialog>` — 모달/대화상자

네이티브 모달을 제공한다. 포커스 트랩, Escape 닫기, backdrop이 기본 내장되어 있다.

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);

<button onClick={() => dialogRef.current?.showModal()}>모달 열기</button>
<dialog ref={dialogRef}>
  <h2>확인</h2>
  <p>정말 삭제하시겠습니까?</p>
  <button onClick={() => dialogRef.current?.close()}>닫기</button>
</dialog>
```

---

## 흔한 안티패턴과 수정 방법

### 1. div soup (과도한 div 중첩)

```tsx
// 안티패턴
<div className="header">
  <div className="nav">
    <div className="nav-item"><a href="/about">About</a></div>
  </div>
</div>
<div className="main">
  <div className="article">
    <div className="title">제목</div>
    <div className="content">본문</div>
  </div>
</div>
<div className="footer">
  <div className="copyright">© 2024</div>
</div>

// 시맨틱 마크업
<header>
  <nav>
    <ul>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>제목</h1>
    <p>본문</p>
  </article>
</main>
<footer>
  <p>&copy; 2024</p>
</footer>
```

### 2. 링크를 버튼으로, 버튼을 링크로 사용

```tsx
// 안티패턴 — 링크인데 버튼처럼 사용
<a href="#" onClick={(e) => { e.preventDefault(); handleAction(); }}>
  삭제
</a>

// 수정 — 동작 실행은 button
<button onClick={handleAction}>삭제</button>
```

### 3. 제목 레벨 건너뛰기

```tsx
// 안티패턴
<h1>포트폴리오</h1>
<h3>프로젝트 목록</h3>  {/* h2를 건너뜀 */}

// 수정
<h1>포트폴리오</h1>
<h2>프로젝트 목록</h2>
```

### 4. 스타일 목적의 시맨틱 태그 오용

```tsx
// 안티패턴 — 굵은 글씨를 위해 h태그나 strong 오용
<h3>일반 텍스트인데 굵게 쓰고 싶어서</h3>

// 수정 — CSS로 스타일링
<p className="font-bold text-lg">일반 텍스트인데 굵게 쓰고 싶어서</p>
```

---

## 검사 출력 형식

시맨틱 태그 검사 결과는 다음 형식으로 보고한다:

```
## 시맨틱 HTML 검사 결과

### 구조 문제
| # | 파일 | 줄 | 현재 코드 | 권장 변경 | 이유 |
|---|------|-----|----------|----------|------|
| 1 | layout.tsx | 57 | `<div className="min-h-screen flex">` | `<div>` 유지 (레이아웃 목적) | 스타일링 컨테이너로 적절 |
| 2 | layout.tsx | 59 | `<aside>` | 적절 | 사이드바 용도로 올바른 사용 |
| 3 | layout.tsx | 69 | `<nav>` 내 링크 목록 | `<ul><li>` 래핑 권장 | 네비게이션 링크는 목록으로 마크업하면 스크린리더가 항목 수를 알려줌 |

### 태그 변환 제안
| # | 파일 | 줄 | Before | After | 이유 |
|---|------|-----|--------|-------|------|
| 1 | page.tsx | 7 | `<section>` | `<section>` 유지 | 프로젝트 목록 섹션으로 적절 |
| 2 | page.tsx | 12 | `<a>` (카드) | `<article>` + `<a>` 분리 | 카드가 독립 콘텐츠 단위이므로 article로 감싸고 링크를 내부에 배치 |
```

---

## React/Next.js에서의 시맨틱 태그

### Fragment vs div

여러 요소를 감싸야 할 때, 의미가 필요 없으면 `<Fragment>` (`<>...</>`)를 사용한다.
불필요한 `<div>` 래핑을 줄인다.

```tsx
// 불필요한 div
return (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);

// Fragment 사용
return (
  <>
    <h1>제목</h1>
    <p>내용</p>
  </>
);
```

### 컴포넌트와 시맨틱 태그

컴포넌트 이름이 역할을 설명하더라도, 렌더링되는 HTML은 시맨틱해야 한다.

```tsx
// 컴포넌트 이름은 Header지만 div를 렌더링 — 시맨틱하지 않음
function Header() {
  return <div className="header">...</div>;
}

// 올바른 예
function Header() {
  return <header>...</header>;
}
```

### `as` prop 패턴

재사용 컴포넌트에서 태그를 유연하게 변경할 수 있도록 `as` prop을 고려한다.

```tsx
interface CardProps {
  as?: React.ElementType;
  children: React.ReactNode;
}

function Card({ as: Component = 'div', children, ...props }: CardProps) {
  return <Component {...props}>{children}</Component>;
}

// 사용
<Card as="article">독립 콘텐츠</Card>
<Card as="section">섹션 콘텐츠</Card>
<Card>레이아웃 목적</Card>  {/* div로 렌더링 */}
```
