경험 많은 시니어 개발자로서, 다음 변경사항들에 대해 전체적이고 간결한 코드 리뷰를 수행해 주세요.

## 실행 방법

1. Target 브랜치를 인자로 전달: `/code-review $ARGUMENTS` (예: `/code-review main`)
2. 현재 브랜치에서 target 브랜치로의 PR을 자동으로 찾아 리뷰
3. 리뷰 생성 후 자동으로 GitHub PR에 코멘트 추가

## 리뷰 프로세스

1. 현재 브랜치에서 $ARGUMENTS(target 브랜치)로의 PR 검색
   ```bash
   # 현재 브랜치 확인
   CURRENT_BRANCH=$(git branch --show-current)
   # 현재 브랜치에서 target 브랜치로의 PR 찾기
   PR_NUMBER=$(gh pr list --head $CURRENT_BRANCH --base $ARGUMENTS --json number --jq '.[0].number')
   ```
2. PR이 존재하면 해당 PR의 변경 사항을 분석
3. PR이 없으면 PR 생성 안내
4. 아래 지침에 따라 코드 리뷰 작성
5. 작성된 리뷰를 자동으로 GitHub PR에 코멘트로 추가

## 리뷰 지침

1. 모든 변경사항을 종합적으로 검토하고, 가장 중요한 문제점이나 개선사항에만 집중하세요.
2. 파일별로 개별 리뷰를 하지 말고, 전체 변경사항에 대한 통합된 리뷰를 제공하세요.
3. 각 주요 이슈에 대해 간단한 설명과 구체적인 개선 제안을 제시하세요.
4. 개선 제안에는 실제 코드 예시를 포함하세요. 단, 코드 예시는 제공한 코드와 연관된 코드여야 합니다.
5. 사소한 스타일 문제나 개인적 선호도는 무시하세요.
6. 심각한 버그, 성능 문제, 또는 보안 취약점이 있는 경우에만 언급하세요.
7. 전체 리뷰는 간결하게 유지하세요.
8. 변경된 부분만 집중하여 리뷰하고, 이미 개선된 코드를 다시 지적하지 마세요.
9. 기존에 이미 개선된 사항(예: 중복 코드 제거를 위한 함수 생성)을 인식하고 이를 긍정적으로 언급하세요.
10. 변경된 파일과 관련된 다른 파일들에 미칠 수 있는 영향을 분석하세요.

## 리뷰 형식

````markdown
## 코드 리뷰: PR #$PR_NUMBER - $PR_TITLE

### 개선된 사항

- [이미 개선된 부분에 대한 긍정적 언급]

### 주요 이슈 (있는 경우에만)

1. **[문제 설명]**
   - 제안: [개선 방안 설명]
   ```[language]
   // 수정된 코드 예시
   ```
````

### 관련 파일에 대한 영향 분석

- [변경된 파일과 관련된 다른 파일들에 미칠 수 있는 잠재적 영향 설명]

### 전반적인 의견

[1-2문장으로 요약]

````

## GitHub 자동 업로드

리뷰 작성 후 다음 명령어로 자동 업로드:
```bash
# PR에 일반 코멘트로 추가
gh pr comment $PR_NUMBER --body "[리뷰 내용]"

# PR 리뷰로 추가 (선택사항)
gh pr review $PR_NUMBER --comment --body "[리뷰 내용]"  # 코멘트만
gh pr review $PR_NUMBER --approve --body "[리뷰 내용]"   # 승인과 함께
gh pr review $PR_NUMBER --request-changes --body "[리뷰 내용]"  # 변경 요청과 함께
````

## 실행 예시

```bash
# 현재 브랜치에서 main으로의 PR 리뷰
/code-review main

# 현재 브랜치에서 develop으로의 PR 리뷰
/code-review develop
```

Remember to:
1. First find the PR from current branch to target branch
2. If no PR exists, prompt to create one first
3. Use the GitHub CLI (`gh`) for all GitHub-related tasks
4. Automatically post the review to GitHub after generation
