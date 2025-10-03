# Vercel 배포 가이드: account.talksign.co.kr

account.talksign.co.kr 도메인에 인증(Auth) 앱을 배포하기 위한 설정 가이드입니다.

## 📋 배포 전 체크리스트

- [x] `apps/accounts` 디렉토리 구조 완성
- [x] 빌드 성공 확인 (로컬 환경)
- [x] 환경변수 준비
- [ ] Vercel 프로젝트 생성
- [ ] 도메인 연결

---

## 🚀 Vercel 프로젝트 생성

### 1단계: 새 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **"Add New..." → "Project"** 클릭
3. GitHub 저장소 선택: `eli-kardis/Talksign` (또는 해당 저장소)
4. **Import** 클릭

### 2단계: 프로젝트 설정

**Framework Preset:**
- Next.js (자동 감지됨)

**Root Directory:**
```
apps/accounts
```
⚠️ **중요**: "Root Directory" 설정 시 `apps/accounts`를 **반드시** 선택해야 합니다.

**Build and Output Settings:**

| 설정 항목 | 값 |
|---------|-----|
| Build Command | `npm run build` (기본값 사용) |
| Output Directory | `.next` (기본값 사용) |
| Install Command | `npm install` (기본값 사용) |
| Development Command | `npm run dev` (기본값 사용) |

### 3단계: 환경 변수 설정

**Environment Variables** 섹션에 다음 변수들을 추가합니다:

| Name | Value | Description |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fwbkesioorqklhlcgmio.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Anon Key (Public) |
| `NODE_ENV` | `production` | 프로덕션 환경 |

**참고:**
- `SUPABASE_SERVICE_ROLE_KEY`는 인증 앱에서 **필요 없음** (읽기 전용이므로)
- Production, Preview, Development 모두 동일한 값 적용

### 4단계: 배포 실행

1. 설정 완료 후 **"Deploy"** 클릭
2. 빌드 진행 상황 모니터링 (약 2-3분 소요)
3. 빌드 성공 확인

---

## 🌐 도메인 연결

### 1단계: 도메인 추가

1. Vercel 프로젝트 → **"Settings"** 탭
2. **"Domains"** 메뉴 선택
3. **"Add"** 버튼 클릭
4. 도메인 입력: `account.talksign.co.kr`
5. **"Add"** 클릭

### 2단계: DNS 설정

Vercel이 제공하는 DNS 레코드를 도메인 등록업체(예: AWS Route 53, Cloudflare)에 추가합니다.

**A 레코드 (권장):**
```
Type: A
Name: account
Value: 76.76.21.21 (Vercel IP)
```

**또는 CNAME 레코드:**
```
Type: CNAME
Name: account
Value: cname.vercel-dns.com
```

### 3단계: SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (약 1-5분 소요).

---

## ✅ 배포 후 검증

### 1. 기본 접속 확인
```bash
curl https://account.talksign.co.kr
```

### 2. 로그인 페이지 접속
브라우저에서 다음 URL 확인:
- https://account.talksign.co.kr (→ /auth/signin으로 리디렉션 확인)
- https://account.talksign.co.kr/auth/signin
- https://account.talksign.co.kr/auth/signup

### 3. 인증 플로우 테스트

**회원가입:**
1. https://account.talksign.co.kr/auth/signup 접속
2. 이메일 입력 및 회원가입 진행
3. 이메일 인증 확인
4. 로그인 성공 후 app.talksign.co.kr로 리디렉션 확인

**로그인:**
1. https://account.talksign.co.kr/auth/signin 접속
2. 기존 계정으로 로그인
3. 로그인 성공 후 app.talksign.co.kr/dashboard로 이동 확인

### 4. 브라우저 콘솔 로그 확인
개발자 도구(F12) → Console 탭에서 오류 없는지 확인:
```
[AuthenticatedApiClient] Getting session...
[AuthenticatedApiClient] Session found, adding Authorization header
```

---

## 🔧 트러블슈팅

### 문제 1: 빌드 실패 - "Missing NEXT_PUBLIC_SUPABASE_URL"
**해결 방법:**
- Vercel 프로젝트 → Settings → Environment Variables 확인
- `NEXT_PUBLIC_SUPABASE_URL` 환경변수 추가
- Deployments → 실패한 배포 → **"Redeploy"** 클릭

### 문제 2: 404 Not Found
**해결 방법:**
- Vercel 프로젝트 → Settings → General 확인
- Root Directory가 `apps/accounts`로 설정되었는지 확인
- 잘못 설정된 경우 수정 후 재배포

### 문제 3: 로그인 후 리디렉션 안 됨
**해결 방법:**

**Supabase URL Configuration 설정 (중요!):**

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **Authentication** → **URL Configuration**
3. 다음과 같이 설정:

**Site URL:**
```
https://app.talksign.co.kr
```

**Redirect URLs (각 줄마다 추가):**
```
https://account.talksign.co.kr/auth/callback
https://app.talksign.co.kr/auth/callback
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
```

⚠️ **중요 사항:**
- 로그인/회원가입 성공 시 `window.location.href = 'https://app.talksign.co.kr/dashboard'`로 리디렉션됩니다
- Supabase 세션 쿠키는 도메인 간 공유되므로 account.talksign.co.kr에서 로그인하면 app.talksign.co.kr에서도 세션 사용 가능합니다

### 문제 4: CORS 오류
**해결 방법:**
- 로그인 후 app.talksign.co.kr에서 세션 사용 시 CORS 발생 가능
- Supabase Dashboard → Settings → API → **"CORS"** 설정 확인
- 허용된 도메인 추가:
  - `https://app.talksign.co.kr`
  - `https://account.talksign.co.kr`

---

## 📊 모니터링

### Vercel 로그 확인
1. Vercel 프로젝트 → **"Deployments"** 탭
2. 최신 배포 선택 → **"Functions"** 탭
3. Runtime Logs에서 서버 로그 확인

### 성능 모니터링
1. Vercel 프로젝트 → **"Analytics"** 탭
2. Web Vitals 지표 확인:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

---

## 🔄 지속적 배포 (CI/CD)

Vercel은 GitHub 연동 시 자동 배포를 지원합니다:

- **Main 브랜치 Push → Production 자동 배포**
  - https://account.talksign.co.kr
- **PR 생성 → Preview 배포**
  - https://talksign-accounts-git-branch-name.vercel.app
- **커밋마다 빌드 자동 실행**

---

## 📁 프로젝트 구조

```
apps/accounts/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/page.tsx         # 로그인 페이지
│   │   │   ├── signup/page.tsx         # 회원가입 페이지
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── callback/route.ts       # OAuth 콜백
│   │   ├── layout.tsx                  # 루트 레이아웃 (AuthProvider)
│   │   └── page.tsx                    # 루트 (→ /auth/signin 리디렉션)
│   ├── components/
│   │   ├── ClientProviders.tsx         # Client-side Provider 래퍼
│   │   ├── Signin.tsx
│   │   ├── Signup.tsx
│   │   └── ... (기타 UI 컴포넌트)
│   ├── contexts/
│   │   └── AuthContext.tsx             # 인증 상태 관리
│   └── lib/
│       ├── supabase.ts                 # Supabase 클라이언트
│       └── api-client.ts               # API 요청 헬퍼
├── .env.local                          # 환경변수 (로컬 개발용)
├── package.json
└── next.config.js
```

---

## 🔗 관련 문서

- [Supabase 인증 설정](https://supabase.com/docs/guides/auth)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 문서](https://vercel.com/docs)
- [AUTH_DEBUGGING_GUIDE.md](./AUTH_DEBUGGING_GUIDE.md) - 인증 디버깅 가이드

---

## 📞 지원

배포 중 문제 발생 시:
1. Vercel 빌드 로그 확인
2. 브라우저 콘솔 오류 확인
3. [AUTH_DEBUGGING_GUIDE.md](./AUTH_DEBUGGING_GUIDE.md) 참고
4. GitHub Issues 등록

---

생성일: 2025-10-03
