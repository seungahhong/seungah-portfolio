# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

### 필수 개발 명령어
```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린트 검사
npm run lint
```

### Git 커밋 자동화
```bash
# Claude Code 스타일 슬래시 명령어로 자동 커밋
./scripts/commit.sh "/commit feat:ui - 다크모드 토글 추가"
./scripts/commit.sh "/commit fix:api - 메일 전송 오류 수정"
./scripts/commit.sh "/commit docs:readme - 설치 가이드 업데이트"
```

## 프로젝트 아키텍처

### 기술 스택
- **프레임워크**: Next.js 15 (App Router), React 19
- **스타일링**: Tailwind CSS v4
- **언어**: TypeScript
- **메일 전송**: Nodemailer (Gmail SMTP)

### 핵심 아키텍처 패턴

#### 1. App Router 구조
- 모든 페이지는 `src/app/` 디렉토리에 위치
- 동적 라우팅: `[slug]` 폴더를 사용 (예: `/projects/[slug]`)
- API 라우트: `src/app/api/` 디렉토리 (Route Handlers 사용)

#### 2. 클라이언트 컴포넌트 중심
- `layout.tsx`는 'use client' 디렉티브 사용
- 다크모드 상태 관리를 위해 React hooks (useState, useEffect) 활용
- localStorage를 통한 테마 설정 영속화

#### 3. 사이드바 레이아웃
- 루트 레이아웃에서 고정 사이드바 구현
- 그라디언트 배경 (pink-500 → purple-500 → indigo-500)
- 메인 콘텐츠 영역과 분리된 네비게이션

#### 4. API 구조
- `src/app/api/contact/route.ts`: 이메일 전송 API
- Next.js 13+ Route Handlers 사용 (POST 메서드)
- 환경변수를 통한 Gmail SMTP 설정

## 환경변수 설정

`.env.local` 파일 필수 환경변수:
```env
# Gmail SMTP (Contact 폼 필수)
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_app_password  # 2단계 인증 앱 비밀번호
```

## 커밋 규칙

### Type 종류
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드/설정 변경

### Scope 종류
- `ui`: UI 컴포넌트
- `api`: API 라우트
- `config`: 설정 파일
- `deps`: 의존성 관리

### 커밋 메시지 형식
```
<type>(<scope>): <subject>
```

## 주요 파일 및 디렉토리 역할

### 페이지 컴포넌트
- `src/app/page.tsx`: 홈페이지 (프로젝트 그리드)
- `src/app/about/page.tsx`: 개인 소개 페이지
- `src/app/projects/page.tsx`: 프로젝트 목록
- `src/app/projects/[slug]/page.tsx`: 프로젝트 상세 페이지
- `src/app/contact/page.tsx`: 연락처 폼

### 스타일 및 테마
- `src/app/globals.css`: Tailwind CSS 기본 설정
- 다크모드: `dark:` 프리픽스 사용 (Tailwind CSS)
- 폰트: Geist Sans, Geist Mono (Google Fonts)

### 타입스크립트 설정
- Path alias: `@/*` → `./src/*`
- Strict mode 활성화
- Next.js 플러그인 설정

## 개발 시 주의사항

1. **클라이언트 컴포넌트**: 브라우저 API 사용 시 'use client' 필수
2. **환경변수**: 서버 컴포넌트에서만 process.env 접근 가능
3. **이미지 최적화**: public 폴더에 webp 형식 사용 권장
4. **다크모드**: localStorage와 prefers-color-scheme 모두 지원
5. **타입 안정성**: TypeScript strict mode로 개발