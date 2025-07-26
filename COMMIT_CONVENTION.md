# Git Commit Convention

## 📝 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가 또는 수정
- `chore`: 빌드 업무 수정, 패키지 매니저 수정

### Scope (선택)
- `ui`: 사용자 인터페이스 관련
- `api`: API 관련
- `auth`: 인증 관련
- `db`: 데이터베이스 관련
- `config`: 설정 관련
- `deps`: 의존성 관련

### Subject (필수)
- 50자 이내로 간결하게
- 명령형으로 작성 (과거형 X)
- 첫 글자는 소문자로

### Body (선택)
- 72자 이내로 줄바꿈
- 무엇을 왜 변경했는지 설명

### Footer (선택)
- Breaking Changes
- Issue 번호

## 🚀 Slash Commands

### 기본 명령어
- `/feat`: 새로운 기능 추가
- `/fix`: 버그 수정
- `/docs`: 문서 수정
- `/style`: 코드 스타일 수정
- `/refactor`: 코드 리팩토링
- `/test`: 테스트 관련
- `/chore`: 기타 작업

### 범위 지정 명령어
- `/feat:ui`: UI 관련 새 기능
- `/fix:api`: API 관련 버그 수정
- `/docs:readme`: README 문서 수정
- `/refactor:auth`: 인증 관련 리팩토링

### 예시
```
/feat:ui - 다크모드 토글 버튼 추가
/fix:api - Contact 폼 메일 전송 오류 수정
/docs:readme - 프로젝트 설치 방법 추가
/refactor:auth - 로그인 로직 개선
```

## 📋 Commit Message Examples

### 좋은 예시
```
feat(ui): add dark mode toggle button

- Add dark mode toggle in header
- Implement localStorage persistence
- Add smooth transition animations

Closes #123
```

```
fix(api): resolve email sending error in contact form

- Fix nodemailer configuration
- Add proper error handling
- Update environment variables

Fixes #456
```

### 나쁜 예시
```
update code
fixed bug
added feature
```

## 🔧 자동화 스크립트

### commit.sh
```bash
#!/bin/bash
# 사용법: ./commit.sh "type:scope" "subject" "body"

TYPE_SCOPE=$1
SUBJECT=$2
BODY=$3

if [ -z "$TYPE_SCOPE" ] || [ -z "$SUBJECT" ]; then
    echo "Usage: ./commit.sh \"type:scope\" \"subject\" \"body\""
    exit 1
fi

COMMIT_MSG="$TYPE_SCOPE: $SUBJECT"

if [ ! -z "$BODY" ]; then
    COMMIT_MSG="$COMMIT_MSG

$BODY"
fi

git commit -m "$COMMIT_MSG"
```

### 사용 예시
```bash
./commit.sh "feat:ui" "add dark mode toggle" "Add dark mode toggle button in header with localStorage persistence"
```

## 🎯 AI Assistant Integration

### Claude Code 스타일 명령어
```
/commit feat:ui - 다크모드 토글 버튼 추가
/commit fix:api - 메일 전송 오류 수정
/commit docs:readme - 설치 가이드 업데이트
```

### 자동 생성 규칙
1. **명령어 파싱**: `/commit <type>:<scope> - <description>`
2. **타입 검증**: 유효한 type인지 확인
3. **메시지 생성**: 규칙에 맞는 commit 메시지 자동 생성
4. **Git 실행**: 자동으로 `git add .` 및 `git commit` 실행

## 📝 Template

### .gitmessage 템플릿
```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
```

### 설정 방법
```bash
git config --global commit.template .gitmessage
```

## 🔄 Workflow

1. **코드 변경**
2. **슬래시 명령어 입력**: `/commit feat:ui - 새로운 기능`
3. **자동 검증**: 타입, 범위, 설명 검증
4. **메시지 생성**: 규칙에 맞는 commit 메시지 생성
5. **Git 실행**: 자동 commit 및 push (선택사항)

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)
- [Git Commit Message Best Practices](https://chris.beams.io/posts/git-commit/) 