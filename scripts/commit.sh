#!/bin/bash

# Git Commit 자동화 스크립트
# 사용법: ./scripts/commit.sh "/commit feat:ui - 다크모드 토글 추가"

# 로그 함수
log_info() {
    echo "[INFO] $1"
}

log_success() {
    echo "[SUCCESS] $1"
}

log_warning() {
    echo "[WARNING] $1"
}

log_error() {
    echo "[ERROR] $1"
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

# 코드 로직 분석 함수
analyze_code_changes() {
    local logic_changes=""
    
    # 스테이징된 변경사항 분석
    if ! git diff --cached --quiet; then
        log_info "코드 로직 분석 중..."
        
        # 함수/메서드 추가 감지 및 이름 추출
        local added_functions=$(git diff --cached | grep -E "^\+[[:space:]]*(export[[:space:]]+)?(function|const|let|var)[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*" | sed -E 's/^\+[[:space:]]*(export[[:space:]]+)?(function|const|let|var)[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*).*/\3/' | head -5)
        
        # React 컴포넌트 변경 감지 및 이름 추출
        local react_components=$(git diff --cached | grep -E "(export[[:space:]]+)?(default[[:space:]]+)?function[[:space:]]+[A-Z][a-zA-Z]*" | sed -E 's/.*function[[:space:]]+([A-Z][a-zA-Z]*).*/\1/' | head -3)
        
        # 상태 관리 변경 감지 (useState, useEffect 등)
        local state_hooks=$(git diff --cached | grep -E "(useState|useEffect|useContext|useReducer)" | sed -E 's/.*(use[A-Z][a-zA-Z]*).*/\1/' | sort | uniq)
        
        # 에러 처리 변경 감지
        local error_handling=$(git diff --cached | grep -E "(try|catch|throw|error)" | wc -l)
        
        # 스타일링 변경 감지
        local style_changes=$(git diff --cached | grep -E "(className|style|css|tailwind)" | wc -l)
        
        # API 호출 변경 감지
        local api_calls=$(git diff --cached | grep -E "(fetch|axios)" | wc -l)
        
        # 유효성 검사 로직 감지
        local validation_logic=$(git diff --cached | grep -E "(validate|validation|check|test)" | wc -l)
        
        # 조건문/분기 로직 감지
        local conditional_logic=$(git diff --cached | grep -E "(if|else|switch|case)" | wc -l)
        
        # 이벤트 핸들러 감지
        local event_handlers=$(git diff --cached | grep -E "(onClick|onChange|onSubmit|onBlur|onFocus)" | wc -l)
        
        # 실제 변경사항 설명 생성
        if [ ! -z "$added_functions" ]; then
            logic_changes+="- 새로 추가된 함수: "
            local first=true
            while IFS= read -r func; do
                if [ ! -z "$func" ]; then
                    if [ "$first" = true ]; then
                        logic_changes+="$func"
                        first=false
                    else
                        logic_changes+=", $func"
                    fi
                fi
            done <<< "$added_functions"
            logic_changes+=$'\n'
        fi
        
        if [ ! -z "$react_components" ]; then
            logic_changes+="- 수정된 React 컴포넌트: "
            local first=true
            while IFS= read -r comp; do
                if [ ! -z "$comp" ]; then
                    if [ "$first" = true ]; then
                        logic_changes+="$comp"
                        first=false
                    else
                        logic_changes+=", $comp"
                    fi
                fi
            done <<< "$react_components"
            logic_changes+=$'\n'
        fi
        
        if [ ! -z "$state_hooks" ]; then
            logic_changes+="- 상태 관리 훅 변경: "
            local first=true
            while IFS= read -r hook; do
                if [ ! -z "$hook" ]; then
                    if [ "$first" = true ]; then
                        logic_changes+="$hook"
                        first=false
                    else
                        logic_changes+=", $hook"
                    fi
                fi
            done <<< "$state_hooks"
            logic_changes+=$'\n'
        fi
        
        if [ $error_handling -gt 0 ]; then
            logic_changes+="- 에러 처리 로직 추가/수정"$'\n'
        fi
        
        if [ $style_changes -gt 0 ]; then
            logic_changes+="- UI 스타일링 변경"$'\n'
        fi
        
        if [ $api_calls -gt 0 ]; then
            logic_changes+="- API 호출 로직 변경"$'\n'
        fi
        
        if [ $validation_logic -gt 0 ]; then
            logic_changes+="- 데이터 유효성 검사 로직 추가"$'\n'
        fi
        
        if [ $conditional_logic -gt 0 ]; then
            logic_changes+="- 조건부 로직 추가/수정"$'\n'
        fi
        
        if [ $event_handlers -gt 0 ]; then
            logic_changes+="- 이벤트 핸들러 추가/수정"$'\n'
        fi
        
        # 주요 기능 변경사항 요약
        local major_changes=""
        if [ ! -z "$react_components" ] || [ ! -z "$state_hooks" ] || [ $validation_logic -gt 0 ]; then
            major_changes+="주요 변경사항: "
            local changes=()
            
            if [ ! -z "$react_components" ]; then
                changes+=("UI 컴포넌트")
            fi
            if [ ! -z "$state_hooks" ]; then
                changes+=("상태 관리")
            fi
            if [ $validation_logic -gt 0 ]; then
                changes+=("유효성 검사")
            fi
            if [ $error_handling -gt 0 ]; then
                changes+=("에러 처리")
            fi
            
            major_changes+=$(IFS=", "; echo "${changes[*]}")
            major_changes+=$'\n'
        fi
        
        if [ ! -z "$major_changes" ]; then
            logic_changes="$major_changes$logic_changes"
        fi
    fi
    
    echo "$logic_changes"
}

# git diff 기반 commit 메시지 재작성 함수
rewrite_commit_message() {
    local original_message="$1"
    local new_message=""
    
    # 변경된 파일 목록 가져오기
    local changed_files=$(git diff --cached --name-only)
    local file_count=$(echo "$changed_files" | wc -l | tr -d ' ')
    
    # 파일별 변경사항 분석
    local file_analysis=""
    
    while IFS= read -r file; do
        if [ ! -z "$file" ]; then
            # 파일 확장자에 따른 설명
            local file_ext="${file##*.}"
            local file_type=""
            
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
            
            # 파일별 변경사항 설명 (라인 수 제거)
            file_analysis+="- $file_type: $file"$'\n'
        fi
    done <<< "$changed_files"
    
    # 주요 변경사항 감지
    local major_changes=""
    
    # React 컴포넌트 변경 감지
    local react_files=$(echo "$changed_files" | grep -E "\.(tsx|jsx)$" | wc -l)
    if [ $react_files -gt 0 ]; then
        major_changes+="React 컴포넌트, "
    fi
    
    # API 관련 변경 감지
    local api_files=$(echo "$changed_files" | grep -E "(api|route)" | wc -l)
    if [ $api_files -gt 0 ]; then
        major_changes+="API, "
    fi
    
    # 스타일링 변경 감지
    local style_files=$(echo "$changed_files" | grep -E "\.(css|scss|sass)$" | wc -l)
    if [ $style_files -gt 0 ]; then
        major_changes+="스타일링, "
    fi
    
    # 설정 파일 변경 감지
    local config_files=$(echo "$changed_files" | grep -E "\.(json|yaml|yml|config)" | wc -l)
    if [ $config_files -gt 0 ]; then
        major_changes+="설정, "
    fi
    
    # 스크립트 변경 감지
    local script_files=$(echo "$changed_files" | grep -E "\.(sh|js)$" | wc -l)
    if [ $script_files -gt 0 ]; then
        major_changes+="스크립트, "
    fi
    
    # 문서 변경 감지
    local doc_files=$(echo "$changed_files" | grep -E "\.(md|txt)$" | wc -l)
    if [ $doc_files -gt 0 ]; then
        major_changes+="문서, "
    fi
    
    # 마지막 쉼표 제거
    major_changes=${major_changes%, }
    
    # 새로운 commit 메시지 생성
    if [ ! -z "$major_changes" ]; then
        new_message="$major_changes 변경사항"
    else
        new_message="코드 변경사항"
    fi
    
    # 파일별 상세 분석 추가
    if [ ! -z "$file_analysis" ]; then
        new_message+=$'\n\n'"변경된 파일:"$'\n'"$file_analysis"
    fi
    
    echo "$new_message"
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
    
    # 스테이징된 변경사항이 있는지 최종 확인
    if git diff --cached --quiet; then
        log_warning "스테이징된 변경사항이 없습니다. 커밋할 내용이 없습니다."
        exit 1
    fi
    
    # git diff 기반으로 commit 메시지 재작성
    local rewritten_message=""
    
    # 실제 변경사항이 있는지 확인
    if ! git diff --cached --quiet; then
        rewritten_message=$(rewrite_commit_message "$description")
    else
        rewritten_message="$description"
    fi
    
    # 코드 로직 분석
    local logic_changes=$(analyze_code_changes)
    
    # 커밋 메시지 생성
    local commit_message="$type($scope): $rewritten_message"
    
    # 코드 로직 변경사항이 있으면 추가
    if [ ! -z "$logic_changes" ]; then
        commit_message+=$'\n\n'"$logic_changes"
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