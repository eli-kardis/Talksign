# Supabase 데이터베이스 초기화 가이드

이 가이드는 TalkSign 프로젝트의 Supabase 데이터베이스를 완전히 초기화하는 방법을 설명합니다.

## ⚠️ 중요: 데이터 삭제 경고

**이 스크립트는 기존의 모든 데이터를 완전히 삭제합니다!**
- 프로덕션 환경에서는 절대 실행하지 마세요.
- 개발 환경에서만 사용하세요.
- 실행 전 백업이 필요한 경우 백업을 먼저 수행하세요.

---

## 📋 사전 준비사항

### 1. Supabase 프로젝트 확인
- [Supabase Dashboard](https://app.supabase.com) 접속
- 프로젝트 선택: `fwbkesioorqklhlcgmio`

### 2. 환경변수 확인
```bash
# .env.local 또는 .env 파일에 다음 값들이 설정되어 있는지 확인
NEXT_PUBLIC_SUPABASE_URL=https://fwbkesioorqklhlcgmio.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

---

## 🚀 방법 1: Supabase Dashboard에서 실행 (권장)

### Step 1: SQL Editor 접속
1. Supabase Dashboard → 좌측 메뉴 → **SQL Editor** 클릭
2. 또는 직접 URL: `https://app.supabase.com/project/fwbkesioorqklhlcgmio/sql`

### Step 2: 마이그레이션 스크립트 실행
1. **New Query** 버튼 클릭
2. 아래 파일의 내용을 복사하여 붙여넣기:
   ```
   /Users/gwon-oseo/Talksign/supabase/migrations/00_reset_and_initialize.sql
   ```
3. **Run** 버튼 클릭 (Ctrl/Cmd + Enter)

### Step 3: 실행 결과 확인
- 성공 시 다음 메시지가 표시됩니다:
  ```
  ✅ TalkSign 데이터베이스 초기화 완료!
  📊 생성된 테이블:
    - users (사용자 프로필)
    - customers (고객 관리)
    - quotes (견적서)
    - quote_items (견적서 항목)
    - contracts (계약서)
    - contract_items (계약서 항목)
    - contract_signatures (서명)
  🔒 RLS (Row Level Security) 활성화됨
  ⚡ 트리거 및 함수 생성됨
  ```

### Step 4: 테이블 생성 확인
1. Supabase Dashboard → **Table Editor** 클릭
2. 좌측 사이드바에서 다음 테이블들이 생성되었는지 확인:
   - ✅ users
   - ✅ customers
   - ✅ quotes
   - ✅ quote_items
   - ✅ contracts
   - ✅ contract_items
   - ✅ contract_signatures

---

## 🛠 방법 2: Supabase CLI로 실행

### Step 1: Supabase CLI 설치 (선택사항)
```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# NPM
npm install -g supabase
```

### Step 2: 프로젝트 연결
```bash
cd /Users/gwon-oseo/Talksign

# Supabase 프로젝트에 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref fwbkesioorqklhlcgmio
```

### Step 3: 마이그레이션 실행
```bash
# 마이그레이션 푸시
supabase db push

# 또는 특정 파일만 실행
supabase db execute --file supabase/migrations/00_reset_and_initialize.sql
```

---

## 📊 생성되는 데이터베이스 스키마

### 테이블 구조

#### 1. `users` - 사용자 프로필
```sql
- id (UUID, PK) → auth.users.id 참조
- email (TEXT, UNIQUE)
- name (TEXT) - 대표자명
- phone (TEXT) - 연락처
- business_registration_number (TEXT) - 사업자등록번호
- company_name (TEXT) - 회사명
- business_name (TEXT) - 상호명
- created_at, updated_at
```

#### 2. `customers` - 고객 관리
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- name (TEXT) - 고객명
- email (TEXT)
- phone (TEXT)
- company (TEXT) - 회사명
- business_registration_number (TEXT)
- address (TEXT)
- notes (TEXT)
- created_at, updated_at
```

#### 3. `quotes` - 견적서
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- customer_id (UUID, FK → customers)
- quote_number (TEXT, UNIQUE) - 예: Q-2025-001
- title (TEXT)
- issue_date (DATE)
- expiry_date (DATE)
- status (TEXT) - draft, sent, accepted, rejected, expired
- subtotal, tax, total (DECIMAL)
- notes (TEXT)
- created_at, updated_at
```

#### 4. `quote_items` - 견적서 항목
```sql
- id (UUID, PK)
- quote_id (UUID, FK → quotes)
- description (TEXT) - 품목 설명
- quantity (DECIMAL)
- unit_price (DECIMAL)
- amount (DECIMAL)
- sort_order (INTEGER)
- created_at
```

#### 5. `contracts` - 계약서
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- customer_id (UUID, FK → customers)
- quote_id (UUID, FK → quotes)
- contract_number (TEXT, UNIQUE) - 예: C-2025-001
- title (TEXT)
- issue_date, start_date, end_date (DATE)
- status (TEXT) - draft, pending, signed, active, completed, cancelled
- subtotal, tax, total (DECIMAL)
- terms, notes (TEXT)
- created_at, updated_at
```

#### 6. `contract_items` - 계약서 항목
```sql
- id (UUID, PK)
- contract_id (UUID, FK → contracts)
- description (TEXT)
- quantity (DECIMAL)
- unit_price (DECIMAL)
- amount (DECIMAL)
- sort_order (INTEGER)
- created_at
```

#### 7. `contract_signatures` - 서명 관리
```sql
- id (UUID, PK)
- contract_id (UUID, FK → contracts)
- signer_type (TEXT) - supplier, customer
- signer_name (TEXT)
- signer_email (TEXT)
- signature_data (TEXT) - Base64 또는 URL
- signed_at (TIMESTAMP)
- ip_address (TEXT)
- created_at
```

---

## 🔒 Row Level Security (RLS) 정책

모든 테이블에 RLS가 활성화되어 있으며, 사용자는 **자신의 데이터만** 접근 가능합니다.

### 주요 정책:
- ✅ 사용자는 본인의 프로필만 조회/수정 가능
- ✅ 사용자는 본인이 생성한 고객만 조회/추가/수정/삭제 가능
- ✅ 사용자는 본인의 견적서/계약서만 접근 가능
- ✅ 하위 항목(items)은 부모 문서의 소유권을 상속

---

## ⚡ 자동 트리거

### `on_auth_user_created` 트리거
- **동작**: 새 사용자가 Supabase Auth에 가입하면 자동으로 `public.users` 테이블에 프로필 생성
- **함수**: `handle_new_user()`
- **데이터 소스**: `auth.users.raw_user_meta_data`

회원가입 시 다음 메타데이터를 자동으로 추출하여 저장:
- name (대표자명)
- phone (연락처)
- business_registration_number (사업자등록번호)
- company_name (회사명)
- business_name (상호명)

---

## 🧪 테스트 방법

### 1. 테이블 생성 확인
```sql
-- SQL Editor에서 실행
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

예상 결과:
```
contract_items
contract_signatures
contracts
customers
quote_items
quotes
users
```

### 2. RLS 정책 확인
```sql
-- SQL Editor에서 실행
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. 트리거 확인
```sql
-- SQL Editor에서 실행
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

## 🔄 다음 단계: Auth 설정 업데이트

데이터베이스 초기화 후 반드시 Supabase Auth 설정을 업데이트해야 합니다:

### 1. Redirect URLs 설정
Supabase Dashboard → Authentication → URL Configuration

**Redirect URLs에 추가:**
```
https://app.talksign.co.kr/auth/callback
http://localhost:3000/auth/callback
```

**제거할 URL (기존):**
```
https://accounts.talksign.co.kr/auth/callback
```

### 2. OAuth Provider 설정

**Google OAuth:**
- Google Cloud Console → 승인된 리다이렉트 URI
- 추가: `https://app.talksign.co.kr/auth/callback`

**Kakao OAuth:**
- Kakao Developers → Redirect URI
- 추가: `https://app.talksign.co.kr/auth/callback`

---

## 🆘 문제 해결

### 오류: "relation already exists"
**원인**: 테이블이 이미 존재함
**해결**:
1. SQL Editor에서 기존 테이블 삭제:
   ```sql
   DROP TABLE IF EXISTS public.users CASCADE;
   -- 나머지 테이블도 동일하게
   ```
2. 마이그레이션 스크립트 재실행

### 오류: "permission denied"
**원인**: 권한 부족
**해결**: Service Role Key로 실행하거나 Dashboard에서 직접 실행

### 오류: "syntax error"
**원인**: SQL 문법 오류
**해결**: 스크립트 전체를 복사하여 붙여넣기 (부분 실행 금지)

---

## 📝 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

## ✅ 완료 체크리스트

데이터베이스 초기화 완료 후 다음 항목들을 확인하세요:

- [ ] SQL 스크립트 실행 완료
- [ ] 7개 테이블 생성 확인 (Table Editor)
- [ ] RLS 정책 활성화 확인
- [ ] 트리거 및 함수 생성 확인
- [ ] Supabase Auth Redirect URLs 업데이트
- [ ] OAuth Provider 콜백 URL 업데이트
- [ ] 로컬 환경에서 회원가입 테스트
- [ ] users 테이블에 자동으로 프로필 생성되는지 확인

모든 체크리스트를 완료하면 TalkSign 애플리케이션을 사용할 준비가 완료됩니다! 🎉
