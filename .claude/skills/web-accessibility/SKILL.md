---
name: web-accessibility
description: |
  웹접근성(a11y) 검사, 코드 리뷰, 컴포넌트 작성 가이드를 제공하는 skill입니다.
  WCAG 2.1/2.2 기준으로 React/Next.js 코드의 접근성 문제를 진단하고 수정합니다.
  HTML/CSS/JS 범용 코드에도 적용 가능합니다.

  다음 상황에서 이 skill을 사용하세요:
  - "접근성 검사", "a11y 체크", "웹접근성 리뷰" 등 접근성 관련 요청
  - "스크린리더", "키보드 탐색", "색상 대비" 등 접근성 키워드가 포함된 요청
  - 컴포넌트를 새로 만들거나 수정할 때 접근성 준수 여부 확인
  - 폼, 모달, 드롭다운, 탭, 토스트 등 인터랙티브 UI 구현 시
  - "WCAG", "WAI-ARIA", "보조기술" 관련 질문
  - 접근성 감사(audit) 보고서 요청
---

# 웹접근성 (Web Accessibility) Skill

## 개요

이 skill은 WCAG 2.1/2.2 지침에 따라 웹 코드의 접근성을 검사하고 개선하는 가이드를 제공한다.
React/Next.js 프로젝트에 최적화되어 있으며, 일반 HTML/CSS/JS에도 적용할 수 있다.

접근성은 장애인뿐 아니라 모든 사용자의 경험을 개선한다. 느린 네트워크, 작은 화면, 밝은 햇빛 아래 등
다양한 환경에서 웹을 사용하는 모든 사람에게 접근성은 중요하다.

---

## 접근성 검사 워크플로우

코드 접근성을 검사할 때는 다음 순서로 진행한다:

### 1단계: 구조 검사 (HTML 시맨틱)

가장 먼저 HTML 구조가 의미적으로 올바른지 확인한다.

**확인 항목:**
- 페이지에 `<h1>`이 하나만 존재하는가
- 제목 레벨이 순서대로 사용되는가 (`h1` → `h2` → `h3`, `h1` → `h3` 건너뛰기 금지)
- `<nav>`, `<main>`, `<aside>`, `<footer>` 등 랜드마크 요소를 적절히 사용하는가
- `<div>`나 `<span>`으로 버튼/링크를 만들지 않았는가
- 목록 데이터에 `<ul>/<ol>/<li>`를 사용하는가
- `<table>`을 레이아웃 용도가 아닌 데이터 표시에만 사용하는가
- 언어 속성이 올바른가 (`<html lang="ko">` — 한국어 사이트는 반드시 `ko`)

**예시 — 잘못된 코드:**
```tsx
// div를 클릭 가능한 요소로 사용 — 키보드/스크린리더가 인식하지 못함
<div onClick={handleClick} className="btn">클릭</div>
```

**예시 — 올바른 코드:**
```tsx
// button은 기본적으로 키보드 포커스와 Enter/Space 이벤트를 지원
<button onClick={handleClick} className="btn">클릭</button>
```

### 2단계: 대체 텍스트 검사

시각적 콘텐츠에 대체 텍스트가 적절히 제공되는지 확인한다.

**확인 항목:**
- 모든 `<img>`에 의미 있는 `alt` 텍스트가 있는가
- 장식용 이미지는 `alt=""`로 처리했는가 (스크린리더가 무시하도록)
- `alt` 텍스트가 이미지의 목적을 설명하는가 ("이미지", "사진" 같은 무의미한 텍스트 금지)
- 아이콘 버튼에 `aria-label`이 있는가
- SVG에 `role="img"`와 `<title>` 또는 `aria-label`이 있는가

**예시 — 잘못된 코드:**
```tsx
// "이미지"라는 alt는 아무 정보도 전달하지 않음
<Image src="/photo.jpg" alt="이미지" width={400} height={300} />

// 아이콘만 있는 버튼 — 스크린리더가 "버튼"이라고만 읽음
<button onClick={toggleMenu}>
  <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
</button>
```

**예시 — 올바른 코드:**
```tsx
<Image src="/photo.jpg" alt="2024년 프로젝트 발표 현장 사진" width={400} height={300} />

<button onClick={toggleMenu} aria-label="메뉴 열기">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
</button>
```

### 3단계: 키보드 접근성 검사

마우스 없이 키보드만으로 모든 기능을 사용할 수 있는지 확인한다.

**확인 항목:**
- 모든 인터랙티브 요소에 Tab으로 접근 가능한가
- 포커스 순서가 논리적인가 (시각적 순서와 일치)
- 포커스 표시(outline)가 보이는가 (`outline: none`을 사용했다면 대체 스타일이 있는가)
- 모달/다이얼로그에서 포커스 트랩이 동작하는가
- Escape 키로 모달/드롭다운을 닫을 수 있는가
- 커스텀 컴포넌트에 적절한 키보드 핸들러가 있는가

**예시 — 포커스 스타일:**
```css
/* 마우스 클릭 시에는 outline을 숨기되, 키보드 탐색 시에는 표시 */
:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

**예시 — 모달 포커스 트랩 (React):**
```tsx
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="모달" ref={modalRef}>
      {children}
    </div>
  );
}
```

### 4단계: ARIA 속성 검사

ARIA 속성이 올바르게 사용되는지 확인한다. ARIA의 첫 번째 규칙은 "네이티브 HTML로 해결할 수 있다면 ARIA를 쓰지 마라"이다.

**확인 항목:**
- ARIA 역할(role)이 올바르게 지정되었는가
- `aria-label`, `aria-labelledby`, `aria-describedby`가 적절히 사용되는가
- 동적 콘텐츠에 `aria-live` 영역이 설정되었는가
- 토글 상태에 `aria-expanded`, `aria-pressed` 등이 반영되는가
- `aria-hidden="true"`가 적절히 사용되는가 (포커스 가능한 요소에는 금지)
- 여러 네비게이션이 있을 때 `aria-label`로 구분하는가

**예시 — 동적 알림:**
```tsx
// 폼 제출 결과를 스크린리더에 즉시 알림
{result && (
  <div role="alert" aria-live="assertive" className="text-sm text-pink-600">
    {result}
  </div>
)}

// 실시간으로 변하는 비중요 정보 (예: 검색 결과 수)
<div aria-live="polite">
  {count}개의 결과가 있습니다
</div>
```

**예시 — 네비게이션 구분:**
```tsx
<nav aria-label="메인 네비게이션">
  <Link href="/about">About</Link>
  <Link href="/projects">Projects</Link>
</nav>

<nav aria-label="푸터 네비게이션">
  <Link href="/privacy">개인정보처리방침</Link>
</nav>
```

### 5단계: 색상 및 시각 검사

색상 대비와 시각적 표현이 접근성 기준을 충족하는지 확인한다.

**확인 항목:**
- 텍스트 색상 대비비가 WCAG AA 기준을 충족하는가
  - 일반 텍스트: 4.5:1 이상
  - 큰 텍스트(18px bold 또는 24px 이상): 3:1 이상
  - UI 컴포넌트/그래픽: 3:1 이상
- 색상만으로 정보를 전달하지 않는가 (에러 표시 시 색상 + 아이콘/텍스트 병행)
- 다크모드에서도 대비비가 유지되는가
- 텍스트 크기를 200%로 확대해도 콘텐츠가 잘리지 않는가

**흔한 문제 — Tailwind CSS에서 대비비 부족:**
```tsx
// 회색 배경에 회색 텍스트 — 대비비 부족 가능성
<p className="text-gray-400 bg-gray-100">읽기 어려운 텍스트</p>

// 개선: 더 진한 텍스트 색상 사용
<p className="text-gray-700 bg-gray-100">읽기 좋은 텍스트</p>
```

### 6단계: 폼 접근성 검사

폼 요소가 접근성 기준을 충족하는지 확인한다.

**확인 항목:**
- 모든 입력 필드에 연결된 `<label>`이 있는가 (`htmlFor` + `id` 매칭)
- 필수 입력 필드에 `required` 또는 `aria-required="true"`가 있는가
- 에러 메시지가 해당 입력 필드와 연결되어 있는가 (`aria-describedby`)
- 에러 메시지가 스크린리더에 자동으로 전달되는가 (`role="alert"` 또는 `aria-live`)
- 유효성 검사 실패 시 에러 입력 필드에 `aria-invalid="true"`가 설정되는가
- placeholder만으로 라벨을 대체하지 않았는가

**예시 — 접근성을 갖춘 폼 필드:**
```tsx
<div>
  <label htmlFor="email" className="block text-sm font-semibold mb-2">
    이메일 <span aria-hidden="true">*</span>
  </label>
  <input
    id="email"
    name="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
    value={form.email}
    onChange={handleChange}
    className="w-full px-4 py-2 rounded-lg border"
    placeholder="example@email.com"
  />
  {hasError && (
    <p id="email-error" role="alert" className="text-red-600 text-sm mt-1">
      올바른 이메일 형식을 입력해주세요.
    </p>
  )}
</div>
```

---

## 컴포넌트별 접근성 체크리스트

### 버튼
- [ ] 의미 있는 텍스트 라벨 또는 `aria-label`
- [ ] 아이콘만 있는 경우 `aria-label` 필수
- [ ] 비활성 상태에 `disabled` 속성 (not `aria-disabled` — 네이티브가 우선)
- [ ] 로딩 중일 때 `aria-busy="true"` 고려

### 링크
- [ ] 목적지를 알 수 있는 텍스트 ("여기를 클릭" 금지, "프로젝트 목록 보기" 권장)
- [ ] 새 창 열림 시 사용자에게 알림 (`target="_blank"` → "새 창에서 열림" 텍스트 또는 `aria-label`)
- [ ] `<a>` 태그에 `href` 속성 필수 (없으면 `<button>` 사용)

### 이미지/미디어
- [ ] 정보 전달용 이미지: 의미 있는 `alt`
- [ ] 장식용 이미지: `alt=""` + `aria-hidden="true"`
- [ ] 동영상: 자막(캡션) 제공
- [ ] 자동 재생 금지 또는 정지 수단 제공

### 모달/다이얼로그
- [ ] `role="dialog"` + `aria-modal="true"`
- [ ] `aria-label` 또는 `aria-labelledby`로 제목 연결
- [ ] 열릴 때 포커스를 모달 내부로 이동
- [ ] 닫힐 때 포커스를 트리거 요소로 복원
- [ ] Escape 키로 닫기
- [ ] 포커스 트랩 (Tab이 모달 밖으로 나가지 않도록)
- [ ] 모달 뒤 콘텐츠에 `aria-hidden="true"` + `inert`

### 드롭다운/메뉴
- [ ] 트리거 버튼에 `aria-expanded` + `aria-haspopup`
- [ ] 메뉴에 `role="menu"`, 항목에 `role="menuitem"`
- [ ] 화살표 키로 항목 탐색
- [ ] Escape로 닫고 트리거로 포커스 복원

### 탭
- [ ] `role="tablist"`, `role="tab"`, `role="tabpanel"`
- [ ] 선택된 탭에 `aria-selected="true"`
- [ ] `aria-controls`로 탭과 패널 연결
- [ ] 화살표 키로 탭 전환

### 토스트/알림
- [ ] `role="alert"` 또는 `aria-live="assertive"` (중요 알림)
- [ ] `aria-live="polite"` (일반 상태 메시지)
- [ ] 충분한 표시 시간 (최소 5초 또는 수동 닫기)
- [ ] 자동으로 사라지는 경우에도 닫기 버튼 제공

---

## 출력 형식

접근성 검사 결과는 다음 형식으로 보고한다:

```
## 접근성 검사 결과

### 심각도: 높음 (반드시 수정)
| # | 파일 | 줄 | 문제 | WCAG 기준 | 수정 방법 |
|---|------|-----|------|-----------|----------|
| 1 | layout.tsx | 53 | lang="en" — 한국어 사이트에 영어로 설정됨 | 3.1.1 페이지 언어 | lang="ko"로 변경 |

### 심각도: 중간 (수정 권장)
| # | 파일 | 줄 | 문제 | WCAG 기준 | 수정 방법 |
|---|------|-----|------|-----------|----------|
| 1 | layout.tsx | 69 | nav에 aria-label 없음 | 1.3.1 정보와 관계 | aria-label="메인 네비게이션" 추가 |

### 심각도: 낮음 (개선 권장)
| # | 파일 | 줄 | 문제 | WCAG 기준 | 수정 방법 |
|---|------|-----|------|-----------|----------|
| 1 | page.tsx | 13 | 카드형 링크의 포커스 영역이 넓어 스크린리더 사용 시 혼란 가능 | 2.4.4 링크 목적 | 링크 내부 구조 개선 |
```

심각도 기준:
- **높음**: WCAG A 레벨 위반, 특정 사용자 그룹이 콘텐츠에 접근 불가
- **중간**: WCAG AA 레벨 위반, 사용성이 저하되지만 접근은 가능
- **낮음**: 모범 사례(best practice) 미준수, 개선하면 더 나은 경험 제공

---

## React/Next.js 특화 가이드

### Next.js Image 컴포넌트
```tsx
// alt는 항상 이미지의 목적을 설명
<Image src={src} alt="프로젝트 대시보드 스크린샷" width={400} height={300} />

// 장식용 이미지
<Image src={src} alt="" width={400} height={300} aria-hidden="true" />
```

### Next.js Link 컴포넌트
```tsx
// 링크 텍스트만으로 목적지를 알 수 있어야 함
<Link href="/projects">프로젝트 목록</Link>

// 아이콘만 있는 링크
<Link href="/projects" aria-label="프로젝트 목록으로 이동">
  <ArrowIcon aria-hidden="true" />
</Link>
```

### 클라이언트 사이드 라우팅
Next.js의 클라이언트 사이드 라우팅은 페이지 전환을 스크린리더에 알리지 않을 수 있다.
페이지 전환 시 새 페이지의 `<h1>`에 포커스를 이동하거나, `aria-live` 영역으로 페이지 변경을 알리는 것을 고려한다.

### 다크모드
다크모드와 라이트모드 모두에서 색상 대비비를 확인한다.
Tailwind의 `dark:` 클래스를 사용할 때 양쪽 모드의 대비비를 모두 테스트한다.

---

## 자주 놓치는 접근성 문제

1. **`outline: none` 또는 `outline-0`** — 포커스 표시를 완전히 제거하면 키보드 사용자가 현재 위치를 알 수 없다. `focus-visible`로 대체한다.

2. **`onClick`만 있는 `div`/`span`** — 키보드 이벤트를 처리하지 않으며 Tab 포커스도 받지 못한다. `<button>`을 사용한다.

3. **아이콘만 있는 버튼에 라벨 없음** — 스크린리더가 "버튼"이라고만 읽는다. `aria-label`을 추가한다.

4. **에러 메시지가 입력 필드와 연결되지 않음** — 시각적으로는 보이지만 스크린리더 사용자는 어떤 필드의 에러인지 알 수 없다. `aria-describedby`로 연결한다.

5. **동적 콘텐츠 변경 미고지** — 콘텐츠가 JS로 변경될 때 스크린리더에 알리지 않으면 사용자가 변화를 인지하지 못한다. `aria-live`를 사용한다.

6. **자동 재생 미디어** — 스크린리더 음성과 겹쳐 사용을 방해한다. 자동 재생을 피하거나 즉시 정지할 수 있는 컨트롤을 제공한다.

7. **타이머가 있는 콘텐츠** — 토스트가 너무 빨리 사라지면 인지/운동 장애 사용자가 읽거나 조작할 수 없다. 충분한 시간을 제공한다.
