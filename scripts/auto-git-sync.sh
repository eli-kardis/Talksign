#!/bin/bash

# 자동 Git 동기화 스크립트
# 사용법: ./scripts/auto-git-sync.sh "커밋 메시지"

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Git 자동 동기화 시작...${NC}"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "📍 현재 브랜치: ${GREEN}$CURRENT_BRANCH${NC}"

# 변경사항 확인
if [[ -z $(git status --porcelain) ]]; then
    echo -e "${YELLOW}📝 변경사항이 없습니다.${NC}"
    exit 0
fi

# 모든 변경사항 추가
echo -e "${YELLOW}📁 파일 추가 중...${NC}"
git add -A

# 커밋 메시지 설정
if [ -z "$1" ]; then
    COMMIT_MSG="chore: 자동 동기화 - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# 커밋
echo -e "${YELLOW}💬 커밋 생성: $COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 원격 저장소와 동기화
echo -e "${YELLOW}🚀 GitHub에 푸시 중...${NC}"
git push origin $CURRENT_BRANCH

echo -e "${GREEN}✅ 동기화 완료!${NC}"
echo -e "${GREEN}🔗 GitHub: https://github.com/eli-kardis/link-flow.git${NC}"