# Seungah Portfolio

Next.js 15, React 19, Tailwind CSS로 만든 개발자 포트폴리오 웹사이트입니다.

## 🚀 Features

- **Next.js 15** + **React 19** + **Tailwind CSS**
- **Jodie 테마** 스타일의 모던한 디자인
- **다크모드** 지원
- **반응형** 레이아웃
- **Contact 폼** (Gmail SMTP 연동)
- **프로젝트 상세 페이지**
- **Git Commit 자동화** 시스템

## 📦 Installation

```bash
# 저장소 클론
git clone <repository-url>
cd seungah-portfolio

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 필요한 환경변수 입력

# 개발 서버 실행
npm run dev
```

## 🔧 Environment Variables

`.env.local` 파일에 다음 환경변수를 설정하세요:

```env
# Gmail SMTP 설정
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_gmail_app_password

# GitHub 설정 (선택사항)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=your_repository_name
```

## 🎨 Git Commit Convention

### 슬래시 명령어 사용법

Claude Code 스타일의 슬래시 명령어로 자동 커밋을 생성할 수 있습니다:

```bash
# 기본 사용법
./scripts/commit.sh "/commit feat:ui - 다크모드 토글 추가"
./scripts/commit.sh "/commit fix:api - 메일 전송 오류 수정"
./scripts/commit.sh "/commit docs:readme - 설치 가이드 업데이트"

# 예시
./scripts/commit.sh "/commit feat:ui - 사이드바 네비게이션 추가"
./scripts/commit.sh "/commit fix:contact - 폼 유효성 검사 개선"
./scripts/commit.sh "/commit style:css - 다크모드 스타일 정리"
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type (필수)
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 기타 작업

#### Scope (선택)
- `ui`: 사용자 인터페이스
- `api`: API 관련
- `auth`: 인증 관련
- `db`: 데이터베이스
- `config`: 설정 관련
- `deps`: 의존성

### 자동화 기능

1. **명령어 파싱**: `/commit <type>:<scope> - <description>`
2. **타입 검증**: 유효한 type인지 확인
3. **메시지 생성**: 규칙에 맞는 commit 메시지 자동 생성
4. **Git 실행**: 자동으로 `git add .` 및 `git commit` 실행
5. **푸시 옵션**: 원격 저장소 푸시 여부 선택

## 📁 Project Structure

```
seungah-portfolio/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts          # Contact API
│   │   ├── about/
│   │   │   └── page.tsx              # About 페이지
│   │   ├── projects/
│   │   │   ├── page.tsx              # Projects 목록
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Project 상세
│   │   ├── contact/
│   │   │   └── page.tsx              # Contact 페이지
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 홈페이지
│   │   └── globals.css               # 전역 스타일
│   └── lib/                          # 유틸리티 함수들
├── scripts/
│   └── commit.sh                     # Git commit 자동화 스크립트
├── .gitmessage                       # Git commit 템플릿
├── COMMIT_CONVENTION.md              # Commit 규칙 문서
└── README.md                         # 프로젝트 문서
```

## 🎯 Pages

- **Home** (`/`): 프로젝트 카드 그리드
- **About** (`/about`): 개발자 소개 및 기술 스택
- **Projects** (`/projects`): 프로젝트 목록
- **Project Detail** (`/projects/[slug]`): 개별 프로젝트 상세
- **Contact** (`/contact`): 연락처 폼

## 🛠️ Development

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📝 Commit Workflow

1. **코드 변경**
2. **슬래시 명령어 입력**: `/commit feat:ui - 새로운 기능`
3. **자동 검증**: 타입, 범위, 설명 검증
4. **메시지 생성**: 규칙에 맞는 commit 메시지 생성
5. **Git 실행**: 자동 commit 및 push (선택사항)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`./scripts/commit.sh "/commit feat:ui - 새로운 기능"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Jodie Theme](https://github.com/LekoArts/gatsby-starter-portfolio-jodie) - 디자인 참고
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit 규칙
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
