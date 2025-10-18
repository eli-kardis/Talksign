# 데이터베이스 마이그레이션 가이드

## ⚠️ 중요 안내

**이 작업은 기존의 모든 데이터를 삭제합니다!**
- 프로덕션 환경에서는 절대 실행하지 마세요
- 개발/테스트 환경에서만 사용하세요
- 필요시 데이터 백업을 먼저 수행하세요

---

## 📋 마이그레이션 파일

### 1. 통합 초기화 스크립트 (권장)
**파일**: `/supabase/migrations/00_complete_reset_and_setup.sql`

**포함 내용**:
- ✅ 기존 테이블 완전 삭제
- ✅ 7개 핵심 테이블 생성 (users, customers, quotes, contracts 등)
- ✅ 20+ 성능 최적화 인덱스
- ✅ RLS 정책 설정 (보안)
- ✅ Auto-update triggers
- ✅ 신규 사용자 자동 프로필 생성

### 2. 개별 마이그레이션 (참고용)
- `00_reset_and_initialize.sql` - 기본 스키마만
- `01_performance_indexes.sql` - 성능 인덱스만

---

## 🚀 실행 방법

### Option 1: Supabase Dashboard (권장)

1. **Supabase Dashboard 접속**
   ```
   https://app.supabase.com/project/fwbkesioorqklhlcgmio/sql
   ```

2. **SQL Editor에서 실행**
   - 좌측 메뉴 → **SQL Editor** 클릭
   - **New Query** 버튼 클릭
   - 아래 파일 내용 복사 & 붙여넣기:
     ```
     /Users/gwon-oseo/Talksign/supabase/migrations/00_complete_reset_and_setup.sql
     ```
   - **Run** 버튼 클릭 (또는 Cmd/Ctrl + Enter)

3. **실행 결과 확인**
   - 성공 시 초록색 체크마크와 함께 완료 메시지 표시
   - 생성된 객체 개수 확인:
     - 테이블: 7개
     - 인덱스: 20+ 개
     - RLS 정책: 30+ 개
     - 트리거: 5개

4. **테이블 확인**
   - 좌측 메뉴 → **Table Editor** 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - ✅ users
     - ✅ customers
     - ✅ quotes
     - ✅ quote_items
     - ✅ contracts
     - ✅ contract_items
     - ✅ contract_signatures

---

### Option 2: Supabase CLI

```bash
# 1. Supabase CLI 설치 (한번만)
brew install supabase/tap/supabase

# 2. 프로젝트 디렉토리로 이동
cd /Users/gwon-oseo/Talksign

# 3. Supabase 로그인
supabase login

# 4. 프로젝트 연결
supabase link --project-ref fwbkesioorqklhlcgmio

# 5. 마이그레이션 실행
supabase db push

# 또는 특정 파일만 실행
supabase db execute --file supabase/migrations/00_complete_reset_and_setup.sql
```

---

## 📊 생성되는 데이터베이스 구조

### 테이블 관계도

```
auth.users (Supabase Auth)
    ↓
public.users (프로필)
    ↓
    ├─→ customers (고객)
    │       ↓
    ├─→ quotes (견적서)
    │       ├─→ quote_items (견적 항목)
    │       └─→ contracts (견적→계약 변환)
    │
    └─→ contracts (계약서)
            ├─→ contract_items (계약 항목)
            └─→ contract_signatures (서명)
```

### 주요 테이블 스키마

#### 1. users
```sql
- id (UUID, PK) → auth.users.id
- email (TEXT, UNIQUE)
- name (TEXT) - 대표자명
- phone (TEXT) - 연락처
- business_registration_number (TEXT)
- company_name (TEXT)
- business_name (TEXT)
```

#### 2. customers
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- name (TEXT) - 고객명
- email, phone, company
- business_registration_number
- address, notes
```

#### 3. quotes
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- customer_id (UUID, FK → customers)
- quote_number (TEXT, UNIQUE)
- title, issue_date, expiry_date
- status (draft, sent, accepted, rejected, expired)
- client_name, client_email, client_phone
- items (JSONB) - 견적 항목 배열
- subtotal, tax, total
```

#### 4. contracts
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- customer_id, quote_id (FK)
- contract_number (TEXT, UNIQUE)
- title, issue_date, start_date, end_date
- status (draft, pending, signed, active, completed, cancelled)
- client_name, client_email, client_phone
- items (JSONB) - 계약 항목 배열
- subtotal, tax_amount, tax_rate, total_amount
- terms, notes
```

---

## 🔒 보안 설정 (RLS)

모든 테이블에 Row Level Security가 활성화되어 있습니다.

### 주요 정책

**Users**:
- ✅ 본인 프로필만 조회/수정 가능

**Customers**:
- ✅ 본인이 생성한 고객만 CRUD 가능
- ✅ `user_id`로 자동 필터링

**Quotes & Contracts**:
- ✅ 본인이 생성한 문서만 접근 가능
- ✅ 하위 항목(items)은 부모 문서 소유권 상속

### RLS 테스트

```sql
-- 현재 사용자의 고객만 조회됨 (자동 필터링)
SELECT * FROM customers;

-- 다른 사용자의 견적서는 조회 불가
SELECT * FROM quotes WHERE user_id != auth.uid();
-- → 결과: 0 rows (RLS가 자동 차단)
```

---

## ⚡ 성능 최적화

### 생성된 인덱스

**1. Composite Indexes (Pagination)**
```sql
idx_customers_user_created (user_id, created_at DESC)
idx_quotes_user_created (user_id, created_at DESC)
idx_contracts_user_created (user_id, created_at DESC)
```
→ Pagination 쿼리 10-50배 빠름

**2. Status Filtering**
```sql
idx_quotes_user_status (user_id, status)
idx_contracts_user_status (user_id, status)
```
→ 상태별 필터링 5-10배 빠름

**3. Partial Indexes (Active Records)**
```sql
idx_quotes_pending - draft/sent 견적서만
idx_contracts_active - active/signed 계약서만
```
→ 더 작은 인덱스 크기, 더 빠른 조회

**4. Foreign Key Indexes**
```sql
idx_quote_items_quote_id
idx_contract_items_contract_id
idx_contract_signatures_contract_id
```
→ JOIN 쿼리 2-5배 빠름

### 쿼리 성능 확인

```sql
-- Pagination 쿼리 (인덱스 사용 확인)
EXPLAIN ANALYZE
SELECT * FROM customers
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 20;
-- → Index Scan on idx_customers_user_created

-- Dashboard 집계 쿼리
EXPLAIN ANALYZE
SELECT COUNT(*) FROM contracts
WHERE user_id = 'user-uuid' AND status IN ('active', 'signed');
-- → Index Scan on idx_contracts_active
```

---

## 🔄 Triggers & Functions

### 1. Auto Updated At
```sql
update_updated_at_column()
```
- `updated_at` 자동 업데이트
- users, customers, quotes, contracts에 적용

### 2. Auto User Profile Creation
```sql
handle_new_user()
```
- Auth 회원가입 시 자동으로 `public.users` 프로필 생성
- `raw_user_meta_data`에서 정보 추출:
  - name, phone, business_registration_number
  - company_name, business_name

### Trigger 확인

```sql
-- 트리거 목록 조회
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

---

## ✅ 마이그레이션 완료 체크리스트

### 데이터베이스
- [ ] SQL 스크립트 실행 완료
- [ ] 7개 테이블 생성 확인
- [ ] 20+ 인덱스 생성 확인
- [ ] RLS 정책 활성화 확인
- [ ] 트리거 생성 확인

### Supabase Auth 설정
- [ ] Redirect URLs 업데이트
  - [ ] `https://app.talksign.co.kr/auth/callback` 추가
  - [ ] `http://localhost:3000/auth/callback` 추가 (개발용)
  - [ ] 기존 `accounts.talksign.co.kr` 제거

### OAuth Provider 설정
- [ ] **Google OAuth**
  - Google Cloud Console → API & Services → Credentials
  - 승인된 리디렉션 URI 업데이트:
    - `https://app.talksign.co.kr/auth/callback`
    - `http://localhost:3000/auth/callback`

- [ ] **Kakao OAuth**
  - Kakao Developers → 내 애플리케이션 → 카카오 로그인
  - Redirect URI 업데이트:
    - `https://app.talksign.co.kr/auth/callback`
    - `http://localhost:3000/auth/callback`

### 애플리케이션 테스트
- [ ] 회원가입 테스트 (이메일)
- [ ] 회원가입 테스트 (Google OAuth)
- [ ] 회원가입 테스트 (Kakao OAuth)
- [ ] `public.users` 프로필 자동 생성 확인
- [ ] 고객 추가/조회/수정/삭제
- [ ] 견적서 생성
- [ ] 계약서 생성

---

## 🔍 문제 해결

### 1. "relation already exists" 에러
**원인**: 테이블이 이미 존재함

**해결**:
```sql
-- Step 1에서 CASCADE로 삭제하므로 발생하지 않아야 함
-- 만약 발생하면 수동으로 삭제:
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
-- ... 모든 테이블
```

### 2. "permission denied" 에러
**원인**: 권한 부족

**해결**:
- Supabase Dashboard에서 실행 (Service Role 권한)
- 또는 Service Role Key 사용

### 3. RLS로 인한 접근 불가
**현상**: API에서 데이터 조회가 안됨

**확인**:
```sql
-- RLS 정책 확인
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- 특정 테이블의 RLS 상태 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 4. Auth 트리거 미작동
**확인**:
```sql
-- 트리거 존재 확인
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 수동으로 프로필 생성 테스트
INSERT INTO public.users (id, email, name)
VALUES ('test-uuid', 'test@example.com', 'Test User');
```

---

## 📚 참고 자료

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 🎯 다음 단계

1. ✅ 데이터베이스 마이그레이션 완료
2. ⏳ Supabase Auth Redirect URLs 설정
3. ⏳ OAuth Provider 콜백 URL 업데이트
4. ⏳ 애플리케이션 테스트
5. ⏳ 프로덕션 배포

---

**작성일**: 2025-10-18
**버전**: 2.0 (Phase 1 & 2 통합)
