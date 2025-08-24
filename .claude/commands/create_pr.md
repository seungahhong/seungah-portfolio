아래 조건에 맞춰 PR 메시지를 작성하고, `gh pr create` 명령어까지 함께 작성해 주세요.
병합할 브랜치는 $ARGUMENTS 야. 이 브랜치로 머지되도록 --base 옵션도 명령어에 포함해 주세요.

- 현재 git 브랜치를 기준으로 제목을 구성 (예: `feature/login` 브랜치일 경우 → `login`만 제목에 포함)
- PR 제목 형식: `PR유형: 요약 제목`
- PR 본문은 다음 템플릿 기반으로 작성
  - 가능한 항목만 작성하고, 불필요한 주석이나 빈 항목은 생략할 것

---

## Changes

- 주요 변경사항들을 bullet 형식으로 정리
<!--

## Why (optional)

변경 목적이 명확할 경우 작성

## Screenshots (optional)

이미지 첨부가 필요한 경우

## Remark (optional)

기타 참고사항

## Checklist (optional)

- 개발용 코드가 남아 있나요?
- 작업 영역에 대한 레이블을 추가했나요?
- 변경 사항이 간결한가요?
- 작업을 설명하는 URL을 첨부했나요?
  -->

---

작성한 제목과 본문을 기반으로 다음과 같은 `gh pr create` 명령어까지 실행해 주세요.

```bash
gh pr create \
  --title "<작성된 제목>" \
  --body "<작성된 본문>"
  --base $ARGUMENTS
```
