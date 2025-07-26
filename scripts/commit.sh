#!/bin/bash

# Git Commit 자동화 스크립트
# 사용법: ./scripts/commit.sh "/commit feat:ui - 다크모드 토글 추가"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 유효한 타입 검증
validate_type() {
    local type=$1
    local valid_types=("feat" "fix" "docs" "style" "refactor" "test" "chore")
    
    for valid_type in "${valid_types[@]}"; do
        if [ "$type" = "$valid_type" ]; then
            return 0
        fi
    done
    return 1
}

# 유효한 범위 검증
validate_scope() {
    local scope=$1
    local valid_scopes=("ui" "api" "auth" "db" "config" "deps" "readme" "setup")
    
    for valid_scope in "${valid_scopes[@]}"; do
        if [ "$scope" = "$valid_scope" ]; then
            return 0
        fi
    done
    return 1
}

# 변경사항 분석 함수
analyze_changes() {
    local body=""
    local total_added=0
    local total_deleted=0
    local total_files=0
    
    # 스테이징된 변경사항 분석
    if ! git diff --cached --quiet; then
        log_info "변경사항 분석 중..."
        
        # git diff --cached --stat 결과를 파싱
        while IFS= read -r line; do
            # 파일명과 변경 통계가 있는 라인만 처리
            if [[ $line =~ ^[[:space:]]*([^[:space:]]+)[[:space:]]+\|[[:space:]]+([0-9]+)[[:space:]]+([+-]+)$ ]]; then
                file_path="${BASH_REMATCH[1]}"
                changes="${BASH_REMATCH[2]}"
                plus_minus="${BASH_REMATCH[3]}"
                
                # 파일 확장자 추출
                file_ext="${file_path##*.}"
                
                # 파일 타입별 설명 생성
                case "$file_ext" in
                    "tsx"|"ts"|"jsx"|"js")
                        file_type="TypeScript/JavaScript"
                        ;;
                    "css"|"scss"|"sass")
                        file_type="CSS/Styling"
                        ;;
                    "md")
                        file_type="Documentation"
                        ;;
                    "json"|"yaml"|"yml")
                        file_type="Configuration"
                        ;;
                    "sh")
                        file_type="Script"
                        ;;
                    *)
                        file_type="File"
                        ;;
                esac
                
                # +/- 개수 계산
                added=$(echo "$plus_minus" | tr -cd '+' | wc -c)
                deleted=$(echo "$plus_minus" | tr -cd '-' | wc -c)
                
                total_added=$((total_added + added))
                total_deleted=$((total_deleted + deleted))
                total_files=$((total_files + 1))
                
                # 파일별 설명 생성
                if [ $added -gt 0 ] && [ $deleted -gt 0 ]; then
                    body+="- $file_type: $file_path (+$added/-$deleted lines)"$'\n'
                elif [ $added -gt 0 ]; then
                    body+="- $file_type: $file_path (+$added lines)"$'\n'
                elif [ $deleted -gt 0 ]; then
                    body+="- $file_type: $file_path (-$deleted lines)"$'\n'
                else
                    body+="- $file_type: $file_path (modified)"$'\n'
                fi
            fi
        done < <(git diff --cached --stat)
        
        # 전체 통계 추가
        if [ $total_files -gt 0 ]; then
            body+=$'\n'"Total: $total_files files changed, +$total_added/-$total_deleted lines"
        fi
    fi
    
    echo "$body"
}

# 메인 함수
main() {
    local input="$1"
    
    # 입력 검증
    if [ -z "$input" ]; then
        log_error "명령어를 입력해주세요."
        echo "사용법: ./scripts/commit.sh \"/commit feat:ui - 다크모드 토글 추가\""
        exit 1
    fi
    
    # /commit 명령어 파싱
    if [[ ! "$input" =~ ^/commit[[:space:]]+([a-z]+):([a-z]+)[[:space:]]+-[[:space:]](.+)$ ]]; then
        log_error "잘못된 형식입니다. 올바른 형식: /commit <type>:<scope> - <description>"
        echo "예시: /commit feat:ui - 다크모드 토글 추가"
        exit 1
    fi
    
    # 매칭된 그룹 추출
    local type="${BASH_REMATCH[1]}"
    local scope="${BASH_REMATCH[2]}"
    local description="${BASH_REMATCH[3]}"
    
    log_info "파싱 결과:"
    echo "  Type: $type"
    echo "  Scope: $scope"
    echo "  Description: $description"
    
    # 타입 검증
    if ! validate_type "$type"; then
        log_error "유효하지 않은 타입입니다: $type"
        echo "유효한 타입: feat, fix, docs, style, refactor, test, chore"
        exit 1
    fi
    
    # 범위 검증
    if ! validate_scope "$scope"; then
        log_warning "알 수 없는 범위입니다: $scope (계속 진행합니다)"
    fi
    
    # Git 상태 확인 (스테이징된 변경사항 또는 작업 디렉토리 변경사항)
    if ! git diff --cached --quiet && ! git diff --quiet; then
        log_info "변경사항을 스테이징합니다..."
        git add .
    elif ! git diff --cached --quiet; then
        log_info "스테이징된 변경사항이 있습니다."
    elif ! git diff --quiet; then
        log_info "변경사항을 스테이징합니다..."
        git add .
    else
        log_warning "커밋할 변경사항이 없습니다."
        exit 1
    fi
    
    # 변경사항 분석
    local changes_body=$(analyze_changes)
    
    # 커밋 메시지 생성
    local commit_message="$type($scope): $description"
    
    # 변경사항이 있으면 body에 추가
    if [ ! -z "$changes_body" ]; then
        commit_message+=$'\n\n'"$changes_body"
    fi
    
    log_info "생성된 커밋 메시지:"
    echo "  $commit_message"
    
    # 사용자 확인
    read -p "이 커밋을 진행하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "커밋이 취소되었습니다."
        exit 0
    fi
    
    # Git 커밋 실행
    if git commit -m "$commit_message"; then
        log_success "커밋이 성공적으로 완료되었습니다!"
        
        # 브랜치 정보 표시
        local current_branch=$(git branch --show-current)
        log_info "현재 브랜치: $current_branch"
        
        # 원격 저장소가 있는지 확인
        if git remote -v | grep -q origin; then
            read -p "원격 저장소에 푸시하시겠습니까? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if git push origin "$current_branch"; then
                    log_success "푸시가 완료되었습니다!"
                else
                    log_error "푸시 중 오류가 발생했습니다."
                    exit 1
                fi
            fi
        fi
    else
        log_error "커밋 중 오류가 발생했습니다."
        exit 1
    fi
}

# 스크립트 실행
main "$@" 