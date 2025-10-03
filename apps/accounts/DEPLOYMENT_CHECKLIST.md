# account.talksign.co.kr 배포 체크리스트

## ✅ 완료된 작업

- [x] `/apps/accounts` 디렉토리 구조 생성
- [x] 인증 페이지 복사 (signin, signup, forgot-password, reset-password, callback)
- [x] 모든 필요한 컴포넌트 및 라이브러리 복사
- [x] AuthProvider 설정 (ClientProviders.tsx)
- [x] 루트 페이지에서 /auth/signin으로 자동 리디렉션 추가
- [x] 로그인/회원가입 성공 시 app.talksign.co.kr/dashboard로 리디렉션 구현
- [x] 로컬 빌드 성공 확인 (`npm run build --workspace=@talksign/accounts`)
- [x] 배포 가이드 작성 (VERCEL_DEPLOYMENT_ACCOUNTS.md)

## 📋 다음 단계

### 1. Vercel 프로젝트 생성 및 배포

**필수 설정:**
```
Root Directory: apps/accounts
Framework: Next.js
Build Command: npm run build
```

**환경 변수:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://fwbkesioorqklhlcgmio.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Ymtlc2lvb3Jxa2xobGNnbWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDkxNzgsImV4cCI6MjA3MDgyNTE3OH0.YWsNJBHYzbm-y-zRNfxRu777qVU_8NYEWmLa62tf-3I
NODE_ENV=production
```

### 2. 도메인 연결

**DNS 설정 (도메인 등록업체에서):**
```
Type: A
Name: account
Value: 76.76.21.21
```

또는

```
Type: CNAME
Name: account
Value: cname.vercel-dns.com
```

### 3. Supabase URL Configuration 설정 ⚠️ 중요!

**Supabase Dashboard → Authentication → URL Configuration**

**Site URL:**
```
https://app.talksign.co.kr
```

**Redirect URLs:**
```
https://account.talksign.co.kr/auth/callback
https://app.talksign.co.kr/auth/callback
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
```

### 4. 배포 후 테스트

- [ ] https://account.talksign.co.kr 접속 → /auth/signin 리디렉션 확인
- [ ] https://account.talksign.co.kr/auth/signin 로그인 페이지 로드 확인
- [ ] https://account.talksign.co.kr/auth/signup 회원가입 페이지 로드 확인
- [ ] 테스트 회원가입 진행 → app.talksign.co.kr/dashboard 리디렉션 확인
- [ ] 테스트 로그인 진행 → app.talksign.co.kr/dashboard 리디렉션 확인
- [ ] 브라우저 콘솔에서 오류 없는지 확인

## 🔗 관련 문서

- [VERCEL_DEPLOYMENT_ACCOUNTS.md](../../VERCEL_DEPLOYMENT_ACCOUNTS.md) - 상세 배포 가이드
- [AUTH_DEBUGGING_GUIDE.md](../../AUTH_DEBUGGING_GUIDE.md) - 인증 디버깅 가이드

## 📊 배포 정보

**Root Directory:** `apps/accounts`

**포트 (로컬 개발):**
- Dev: 3002 (`npm run dev --workspace=@talksign/accounts`)
- Start: 3002

**주요 경로:**
- `/` → `/auth/signin` (자동 리디렉션)
- `/auth/signin` - 로그인
- `/auth/signup` - 회원가입
- `/auth/forgot-password` - 비밀번호 찾기
- `/auth/reset-password` - 비밀번호 재설정
- `/auth/callback` - OAuth 콜백 (비밀번호 리셋용)

**인증 플로우:**
1. 사용자가 account.talksign.co.kr에서 로그인/회원가입
2. Supabase 인증 완료
3. `window.location.href = 'https://app.talksign.co.kr/dashboard'`로 리디렉션
4. app.talksign.co.kr에서 Supabase 세션 쿠키로 자동 로그인 상태 유지

---

생성일: 2025-10-03
