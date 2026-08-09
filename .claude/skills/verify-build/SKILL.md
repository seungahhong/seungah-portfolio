---
name: verify-build
description: 이 저장소의 변경을 검증하는 절차. 테스트 프레임워크가 없으므로 `pnpm verify` 한 명령이 lint·typecheck·build(가드 포함)와 산출물 서빙 관측까지 수행한다. 이 문서는 그 명령이 실패했을 때 원인을 손으로 파고드는 절차다. 코드나 콘텐츠를 수정한 뒤 마무리할 때, "검증", "확인", "배포 전 점검"을 요청받았을 때 사용한다.
---

# 검증 절차

**이 저장소에는 테스트 프레임워크가 없다.** 그리고 lint·typecheck·build를 모두 통과하면서도
배포본이 깨지는 사고를 두 번 겪었다(정적 페이지 빈 HTML, 서버 로케일 무시).
그래서 검증의 오라클은 단위 테스트가 아니라 **빌드 산출물 대조**다 —
근거는 [ADR 0007](../../../docs/decisions/0007-no-test-framework.md).

## 1. 이것을 실행하라

```bash
pnpm preflight   # 무엇이 축소 모드인지 (자격증명 없어도 exit 0이 정상)
pnpm verify      # lint → typecheck → build(가드 포함) → 산출물 서빙 후 84개 단정
```

**끝난 것의 기준**: 위 둘이 exit 0. 자격증명은 필요 없다.

`pnpm verify`가 포함하는 것 — 아래 항목은 **이미 자동화돼 있으므로 손으로 다시 하지 않는다**:

| 검사 | 소유 |
|---|---|
| 의존 방향 · 클라이언트/서버 경계 · route group · 프로바이더 `useSearchParams` | `scripts/arch-guard.mjs` (prebuild) |
| ko/en 파리티(키 구조 + **배열 길이**) · 데이터 id ↔ i18n 키 계약 | `scripts/i18n-guard.mjs` (prebuild) |
| i18n 정적 키 오타 · `t`/`tList` 혼용 | 타입 (`tsc`, `next build` 내장) |
| 본문 공백 · 로케일 · 키/자리표시자 누수(본문 + JSON-LD) · 앵커 · canonical/hreflang · 메타 라우트 · 404 · 축소 계약 | `scripts/verify-runtime.mjs` |

> 같은 오라클을 두 곳에 두지 않는다. 드리프트한 오라클은 없는 오라클보다 해롭다.

## 2. 리팩터 중이라면

```bash
pnpm verify:snapshot --write   # 착수 *전* 기준선
pnpm verify:snapshot           # 각 단계 후 — diff 0이 산출물 등가성의 증거
```

타입만 바꾸는 변경은 산출물이 그대로여야 한다. "키를 잘못 바꿔 *다른 유효한 문자열*이 렌더되는"
실패 모드는 타입이 못 잡지만 본문 diff는 잡는다.

**스냅샷이 덮지 못하는 것**: 클라이언트 상호작용(탭 키보드 이동·테마/언어 토글·`popstate`)과
챗 응답 경로. 그쪽을 건드렸다면 브라우저로 직접 확인해야 한다 — 자동 검증이 없는 영역이다.

## 3. 실패했을 때 손으로 파고들기

가드와 하네스는 `위치` + `원인` + `수정` 3블록으로 출력한다. 그것으로 부족할 때만 아래를 쓴다.

### 빌드가 라우트를 동적으로 만들었을 때

빌드 출력의 라우트 표에서 **`/`와 `/en`이 `○`(Static)인지** 확인한다.
`ƒ`(Dynamic)로 바뀌었다면 어딘가에서 요청 단위 API(쿠키·헤더·검색 파라미터)를 읽기 시작한 것이다.

`pnpm typecheck`가 `.next/types/validator.ts`에서 "Cannot find module"을 내면 라우트 파일을
옮긴 뒤 재빌드하지 않은 것이다. `rm -rf .next && pnpm build` 후 다시 확인한다.

### 특정 URL만 이상할 때

```bash
PORT=3939 pnpm start &
curl -s localhost:3939/en/career/wadiz | grep -o '<html lang="[^"]*"'
curl -s localhost:3939/en/career/wadiz | grep -o '<h1[^>]*>[^<]*</h1>'
curl -s localhost:3939/llms.txt | head -20
kill %1
```

### 챗 시스템 프롬프트가 본문과 어긋나 보일 때

dev 서버에서만 열리는 조회 엔드포인트가 있다(프로덕션은 404).

```bash
pnpm dev &
curl -s 'localhost:3000/api/chat/prompt?locale=en' | head -40
```

## 4. 외부 링크 (자동화 안 됨)

경력 근거 링크나 블로그 slug를 건드렸다면 **실제로 열어본다.**

```bash
curl -sL -o /dev/null -w '%{http_code}\n' https://seungahhong.github.io/en/posts/<slug>/
```

과거에 와디즈 뉴스 링크 3건이 한 칸씩 밀려 항목과 다른 페이지를 가리킨 적이 있다.
전부 HTTP 200을 반환했다 — **상태 코드가 아니라 페이지 제목이 항목과 맞는지**를 사람이 확인해야 한다.

## 5. 번역의 정확성 (자동화 안 됨)

가드는 키가 *존재*하는지만 본다. `en.json`에 한국어를 넣어도, 오역이어도 통과한다.
`verify:runtime`의 V2가 "`/`와 `/en`의 h1이 동일한가"까지는 잡지만 그 이상은 사람 몫이다.
