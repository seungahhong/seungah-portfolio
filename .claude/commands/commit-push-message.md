다음 조건에 맞는 커밋 메시지를 생성하고, git add, commit 및 push까지 수행해 주세요.

# 전제 조건

현재 Git 작업 디렉토리의 변경된 파일들을 기반으로 커밋 메시지를 작성해 주세요. (파일 경로나 파일명에 따라 어떤 수정이 이루어졌는지 추론)

# 커밋 메시지 형식

- COMMIT_CONVENTION.md 기준에 기반한 메시지를 작성
- 본문:
  - 수정 사유 중심으로 명사형 종결어미 사용
  - 다음과 같은 자동 생성 문구는 포함하지 않음:
  - 🤖 Generated with [Claude Code](https://claude.ai/code)
  - Co-Authored-By: Claude <noreply@anthropic.com>

# 실행 순서

1. 변경된 파일 확인 (`git status`)
2. unstaged 파일이 있을 경우 자동으로 추가 (`git add .` 또는 개별 파일 추가)
3. staged된 변경 내용 분석 (`git diff --cached`)
4. 커밋 메시지 작성
5. 커밋 실행 (`git commit -m "메시지"`)
6. 원격 저장소로 push (`git push`)
