# 인증 (401 오류) 디버깅 가이드

## 문제 상황
로그인한 상태에서도 API 요청 시 401 Unauthorized 오류가 발생하는 경우

## 원인 분석 체계

### 1️⃣ 프론트엔드 체크 (브라우저 콘솔)

**확인 항목:**
```javascript
// 브라우저 개발자 도구 Console에서 확인할 로그
[AuthenticatedApiClient] Getting session...
[AuthenticatedApiClient] Session found, adding Authorization header
[AuthenticatedApiClient] Token preview: eyJhbGciOiJIUzI1NiI...
```

**가능한 문제:**
- ❌ `No session or access_token found` → Supabase 세션이 없음
- ❌ `Session error:` → Supabase 연결 문제
- ✅ `Session found` → 프론트엔드는 정상

**해결 방법:**
```typescript
// 세션 확인
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// 수동 로그인 테스트
await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
})
```

---

### 2️⃣ 네트워크 체크 (Network 탭)

**확인 항목:**
```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...
  Content-Type: application/json
```

**가능한 문제:**
- ❌ `Authorization` 헤더 없음 → API 클라이언트 문제
- ❌ 토큰 형식 오류 → Bearer 접두사 확인
- ✅ Authorization 헤더 존재 → 네트워크 전송 정상

---

### 3️⃣ 백엔드 체크 (Vercel Logs 또는 로컬 서버)

**확인 항목:**
```
[Auth] ==================== NEW REQUEST ====================
[Auth] Authorization header present: true
[Auth] Token found, length: 584
[Auth] Verifying JWT token...
[Auth] JWKS URL: https://xxx.supabase.co/auth/v1/jwks
[Auth] JWT verified successfully
[Auth] User ID from token: 80d20e48-7189-4874-b792-9e514aaa0572
[Auth] ✓ User exists in database: 80d20e48-7189-4874-b792-9e514aaa0572
```

**가능한 문제:**

#### 문제 A: Authorization 헤더 없음
```
[Auth] ✗ No authorization token found in request
[Auth] → Falling back to demo user
```
→ **원인:** 프론트엔드에서 토큰을 전송하지 않음
→ **해결:** API 클라이언트 수정

#### 문제 B: JWT 검증 실패
```
[Auth] JWT verification failed: JWSSignatureVerificationFailed
```
→ **원인:**
1. JWKS URL 잘못됨 (과거: `/rest/v1/jwks` → 수정: `/auth/v1/jwks`)
2. JWT issuer 불일치
3. 토큰 만료

→ **해결:**
```typescript
// 올바른 JWKS URL
const jwksUrl = new URL(`${supabaseUrl}/auth/v1/jwks`)

// 올바른 issuer
const issuerUrl = `${supabaseUrl}/auth/v1`

await jwtVerify(token, JWKS, {
  issuer: issuerUrl,
  audience: 'authenticated',
})
```

#### 문제 C: 사용자 DB에 없음
```
[Auth] ✓ JWT verified successfully
[Auth] User ID from token: abc-123-def
[Auth] ✗ User not found in database
[Auth] → Falling back to demo user
```
→ **원인:** `public.users` 테이블에 사용자 레코드 없음
→ **해결:** AuthContext에서 `ensureUserExists()` 호출 확인

---

## 🔧 주요 수정 사항 (2025-10-03)

### 1. JWKS URL 수정 (Critical Fix)
```typescript
// ❌ 잘못된 코드
const jwksUrl = new URL(`${supabaseUrl}/rest/v1/jwks`)

// ✅ 올바른 코드
const jwksUrl = new URL(`${supabaseUrl}/auth/v1/jwks`)
```

### 2. JWT Issuer 수정
```typescript
// ❌ 잘못된 코드
issuer: 'supabase'

// ✅ 올바른 코드
issuer: `${supabaseUrl}/auth/v1`
```

### 3. 상세 로깅 추가
- 모든 auth 로그에 `[Auth]` 접두사
- 모든 API 클라이언트 로그에 `[AuthenticatedApiClient]` 접두사
- 각 단계별 성공(✓) / 실패(✗) 표시

---

## 🚀 디버깅 순서

### Step 1: 브라우저 콘솔 확인
1. `https://app.talksign.co.kr` 접속
2. 개발자 도구 열기 (F12)
3. Console 탭에서 `[AuthenticatedApiClient]` 로그 확인
4. 세션이 있는지 확인

### Step 2: 네트워크 요청 확인
1. Network 탭 열기
2. `/api/quotes` 요청 찾기
3. Headers → Request Headers 확인
4. `Authorization: Bearer ...` 있는지 확인

### Step 3: Vercel 로그 확인
1. Vercel Dashboard 접속
2. Deployments → Functions 탭
3. Runtime Logs에서 `[Auth]` 검색
4. 인증 플로우 추적

### Step 4: 로컬 테스트
```bash
# 로컬 개발 서버 실행
npm run dev --workspace=apps/app

# 브라우저에서 http://localhost:3000 접속
# 로그인 후 견적서 페이지 이동
# 터미널에서 [Auth] 로그 확인
```

---

## 🔍 체크리스트

프로덕션 환경에서 401 오류 발생 시:

- [ ] 브라우저 콘솔에 `[AuthenticatedApiClient] Session found` 로그 있는가?
- [ ] Network 탭에 `Authorization` 헤더가 포함되어 있는가?
- [ ] Vercel 로그에 `[Auth] Token found` 로그가 있는가?
- [ ] Vercel 로그에 `[Auth] JWT verified successfully` 있는가?
- [ ] Vercel 로그에 `[Auth] User exists in database` 있는가?
- [ ] `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` 설정되어 있는가?
- [ ] Vercel 환경변수에 `SUPABASE_SERVICE_ROLE_KEY` 설정되어 있는가?

---

## 📝 관련 파일

### 프론트엔드
- `/apps/app/src/lib/api-client.ts` - API 요청 클라이언트
- `/apps/app/src/lib/supabase.ts` - Supabase 클라이언트 설정
- `/apps/app/src/contexts/AuthContext.tsx` - 인증 컨텍스트

### 백엔드
- `/apps/app/src/lib/auth-utils.ts` - JWT 검증 및 사용자 확인
- `/apps/app/src/app/api/quotes/route.ts` - API 라우트 예시

---

## ⚠️ 임시 데모 모드

현재 코드는 **인증 실패 시 데모 유저로 폴백**하도록 설정되어 있습니다:

```typescript
// auth-utils.ts
if (!token || !userId) {
  console.log('[Auth] → Falling back to demo user')
  return getOrCreateDemoUser() // 고정 UUID
}
```

### 데모 모드의 문제점
- 모든 익명 사용자가 같은 데이터 공유
- 프로덕션 환경에 부적합
- 실제 사용자 배포 전에 제거 필요

### 프로덕션 배포 전 TODO
```typescript
// 프로덕션에서는 인증 필수로 변경
if (!token && process.env.NODE_ENV === 'production') {
  return null // 401 반환
}
```

---

## 📞 추가 지원

문제가 계속되면 다음 정보와 함께 문의:
1. 브라우저 콘솔 전체 로그 (스크린샷)
2. Network 탭 요청 헤더 (스크린샷)
3. Vercel 로그 (최소 50줄)
4. 재현 단계

생성일: 2025-10-03
최종 수정: 2025-10-03
