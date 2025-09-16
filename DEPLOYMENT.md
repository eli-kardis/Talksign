# 🚀 TalkSign Vercel 배포 가이드

TalkSign 프로젝트를 Vercel에 배포하는 단계별 가이드입니다.

## 📋 사전 요구사항

- GitHub 계정
- Vercel 계정
- Supabase 프로젝트 (선택사항: 로컬 개발용)

## 🔧 1단계: 환경 변수 준비

### 필수 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 선택적 환경 변수 (기능별)

**결제 서비스 (토스페이먼츠)**
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R
```

**카카오톡 알림**
```bash
KAKAO_API_KEY=your_kakao_rest_api_key
KAKAO_SENDER_KEY=your_kakao_sender_key
```

**소셜 로그인**
```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

**JWT 토큰 (선택사항)**
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

## 🚀 2단계: Vercel 배포

### 방법 1: Vercel 대시보드 (권장)

1. **Vercel 계정 로그인**
   - [vercel.com](https://vercel.com)에서 GitHub으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework: Next.js (자동 감지됨)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 위의 환경 변수들을 추가
   - Production, Preview, Development 모두에 적용

5. **배포**
   - "Deploy" 버튼 클릭
   - 첫 배포는 약 2-3분 소요

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 배포
vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 프로덕션 배포
vercel --prod
```

## 🔗 3단계: 도메인 설정 (선택사항)

1. **커스텀 도메인 추가**
   - Vercel 대시보드의 "Domains" 탭
   - "Add" 버튼으로 도메인 추가
   - DNS 설정 안내에 따라 CNAME 레코드 추가

2. **SSL 인증서**
   - Vercel에서 자동으로 Let's Encrypt SSL 인증서 발급
   - 24시간 이내 자동 활성화

## 🧪 4단계: 배포 확인

### 기능 테스트 체크리스트

- [ ] 메인 페이지 로드 확인
- [ ] 사용자 인증 (회원가입/로그인)
- [ ] 견적서 작성 및 저장
- [ ] 계약서 생성 및 전자서명
- [ ] 대시보드 데이터 표시
- [ ] API 엔드포인트 응답 확인

### 성능 확인

```bash
# Lighthouse 점수 확인 (권장)
npm install -g lighthouse
lighthouse https://your-domain.vercel.app

# 또는 Chrome DevTools > Lighthouse 탭 사용
```

## 🔧 5단계: 배포 후 설정

### Supabase RLS 정책 확인

프로덕션 환경에서는 Row Level Security 정책이 중요합니다:

```sql
-- 예시: users 테이블 RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 환경별 URL 설정

Supabase 대시보드에서 Authentication > URL Configuration:

```
Site URL: https://your-domain.vercel.app
Redirect URLs:
  - https://your-domain.vercel.app/auth/callback
  - https://your-preview-branch.vercel.app/auth/callback (선택사항)
```

## 📊 6단계: 모니터링 설정

### Vercel Analytics 활성화

1. Vercel 대시보드 > Analytics 탭
2. "Enable Analytics" 클릭
3. 실시간 사용자 통계 및 성능 메트릭 확인

### 에러 추적

```typescript
// 프로덕션 에러 로깅 (예시)
if (process.env.NODE_ENV === 'production') {
  // Sentry, LogRocket 등 에러 추적 도구 설정
}
```

## 🔄 자동 배포 설정

### GitHub Actions (선택사항)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 문제 해결

### 흔한 에러와 해결법

**1. 빌드 실패**
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run type-check
```

**2. 환경 변수 문제**
- Vercel 대시보드에서 환경 변수 재확인
- 변수명과 값에 오타 확인
- 재배포 필요 (환경 변수 변경 후)

**3. Database 연결 문제**
- Supabase URL과 키 확인
- Network 정책 확인 (IP 제한 등)
- RLS 정책 확인

## 📞 추가 도움

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 프로덕션 체크리스트](https://supabase.com/docs/guides/platform/going-to-prod)

---

🎉 **축하합니다!** TalkSign이 성공적으로 배포되었습니다.
프로덕션 환경에서의 추가 최적화나 문제가 있다면 이슈를 등록해 주세요.