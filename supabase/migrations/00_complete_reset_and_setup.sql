-- ============================================================================
-- TalkSign Database: Complete Reset & Setup
-- ============================================================================
--
-- Purpose: 완전한 데이터베이스 초기화 및 Phase 1-2 개선사항 적용
-- Created: 2025-10-18
-- Version: 2.0
--
-- ⚠️  WARNING: 이 스크립트는 기존의 모든 데이터를 삭제합니다!
-- 프로덕션 환경에서는 절대 실행하지 마세요.
--
-- ============================================================================

-- ============================================================================
-- Step 1: 기존 테이블 및 객체 삭제
-- ============================================================================

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop all existing tables (CASCADE로 의존성도 함께 제거)
DROP TABLE IF EXISTS public.contract_signatures CASCADE;
DROP TABLE IF EXISTS public.contract_items CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.quote_items CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop all existing triggers
-- (Automatically dropped with tables)

-- Drop all existing indexes
-- (Automatically dropped with tables)

-- Re-enable triggers
SET session_replication_role = 'origin';

DO $$
BEGIN
  RAISE NOTICE '✅ Step 1: 기존 테이블 및 객체 삭제 완료';
END $$;

-- ============================================================================
-- Step 2: 공통 함수 생성
-- ============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'updated_at 컬럼을 자동으로 현재 시간으로 업데이트';

DO $$
BEGIN
  RAISE NOTICE '✅ Step 2: 공통 함수 생성 완료';
END $$;

-- ============================================================================
-- Step 3: 핵심 테이블 생성
-- ============================================================================

-- 3.1 Users 테이블
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  business_registration_number TEXT,
  company_name TEXT,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.users IS '사용자 프로필 정보';
COMMENT ON COLUMN public.users.id IS 'auth.users 테이블의 ID와 동일';
COMMENT ON COLUMN public.users.email IS '사용자 이메일 (고유)';
COMMENT ON COLUMN public.users.name IS '대표자명';
COMMENT ON COLUMN public.users.phone IS '연락처 (예: 010-1234-5678)';
COMMENT ON COLUMN public.users.business_registration_number IS '사업자등록번호 (예: 123-12-12345)';

-- 3.2 Customers 테이블
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  business_registration_number TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.customers IS '고객 정보 관리';
COMMENT ON COLUMN public.customers.user_id IS '고객을 등록한 사용자';
COMMENT ON COLUMN public.customers.name IS '고객명 (개인 또는 담당자명)';
COMMENT ON COLUMN public.customers.company IS '회사명';

-- 3.3 Quotes 테이블
CREATE TABLE public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,

  -- Quote metadata
  quote_number TEXT UNIQUE,
  title TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),

  -- Client information
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  client_business_number TEXT,

  -- Items (stored as JSONB for flexibility)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Financial
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,

  -- Additional info
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.quotes IS '견적서 관리';
COMMENT ON COLUMN public.quotes.items IS 'Quote items array in JSON format: [{"description": "...", "quantity": 1, "unit_price": 1000, "amount": 1000}]';
COMMENT ON COLUMN public.quotes.status IS 'draft: 작성중, sent: 발송됨, accepted: 수락됨, rejected: 거절됨, expired: 만료됨';

-- 3.4 Quote Items 테이블 (정규화된 구조)
CREATE TABLE public.quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.quote_items IS '견적서 항목 (정규화된 버전)';
COMMENT ON COLUMN public.quote_items.sort_order IS '항목 정렬 순서';

-- 3.5 Contracts 테이블
CREATE TABLE public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,

  -- Contract metadata
  contract_number TEXT UNIQUE,
  title TEXT NOT NULL,
  issue_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'active', 'completed', 'cancelled')),

  -- Client information
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  client_business_number TEXT,
  client_address TEXT,

  -- Contract content
  content TEXT,
  terms TEXT,

  -- Items (stored as JSONB)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Financial
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 10.0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Payment info
  payment_terms TEXT,
  payment_method TEXT,

  -- Additional
  notes TEXT,
  contract_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,

  -- Project info
  project_description TEXT,
  project_start_date DATE,
  project_end_date DATE,

  -- Supplier info (JSONB)
  supplier_info JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.contracts IS '계약서 관리';
COMMENT ON COLUMN public.contracts.status IS 'draft: 작성중, pending: 서명대기, signed: 서명완료, active: 진행중, completed: 완료, cancelled: 취소';
COMMENT ON COLUMN public.contracts.items IS 'Contract items in JSON format';
COMMENT ON COLUMN public.contracts.supplier_info IS '공급자 정보 (JSON): name, phone, business_number, etc.';

-- 3.6 Contract Items 테이블
CREATE TABLE public.contract_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.contract_items IS '계약서 항목 (정규화된 버전)';

-- 3.7 Contract Signatures 테이블
CREATE TABLE public.contract_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('supplier', 'customer')),
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.contract_signatures IS '계약서 서명 관리';
COMMENT ON COLUMN public.contract_signatures.signer_type IS 'supplier: 공급자, customer: 고객';
COMMENT ON COLUMN public.contract_signatures.signature_data IS 'Base64 encoded signature image or signature URL';

DO $$
BEGIN
  RAISE NOTICE '✅ Step 3: 핵심 테이블 생성 완료 (7개 테이블)';
END $$;

-- ============================================================================
-- Step 4: Indexes 생성 (Performance Optimization - Phase 2)
-- ============================================================================

-- 4.1 Users 인덱스
CREATE INDEX idx_users_email ON public.users(email);

-- 4.2 Customers 인덱스
CREATE INDEX idx_customers_user_created ON public.customers(user_id, created_at DESC);
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_email ON public.customers(email);

-- 4.3 Quotes 인덱스
CREATE INDEX idx_quotes_user_created ON public.quotes(user_id, created_at DESC);
CREATE INDEX idx_quotes_user_status ON public.quotes(user_id, status);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created ON public.quotes(created_at DESC);
CREATE INDEX idx_quotes_customer ON public.quotes(customer_id) WHERE customer_id IS NOT NULL;

-- Partial index for pending quotes
CREATE INDEX idx_quotes_pending ON public.quotes(user_id, created_at DESC)
WHERE status IN ('draft', 'sent');

-- 4.4 Quote Items 인덱스
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);

-- 4.5 Contracts 인덱스
CREATE INDEX idx_contracts_user_created ON public.contracts(user_id, created_at DESC);
CREATE INDEX idx_contracts_user_status ON public.contracts(user_id, status);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_created ON public.contracts(created_at DESC);
CREATE INDEX idx_contracts_customer ON public.contracts(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_contracts_quote ON public.contracts(quote_id) WHERE quote_id IS NOT NULL;

-- Partial index for active contracts
CREATE INDEX idx_contracts_active ON public.contracts(user_id, created_at DESC)
WHERE status IN ('active', 'signed');

-- 4.6 Contract Items 인덱스
CREATE INDEX idx_contract_items_contract_id ON public.contract_items(contract_id);

-- 4.7 Contract Signatures 인덱스
CREATE INDEX idx_contract_signatures_contract_id ON public.contract_signatures(contract_id);
CREATE INDEX idx_contract_signatures_type ON public.contract_signatures(contract_id, signer_type);

DO $$
BEGIN
  RAISE NOTICE '✅ Step 4: 성능 인덱스 생성 완료 (20+ indexes)';
END $$;

-- ============================================================================
-- Step 5: RLS (Row Level Security) 활성화 및 정책 설정
-- ============================================================================

-- 5.1 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- 5.2 Users 정책
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 5.3 Customers 정책
CREATE POLICY "Users can view own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- 5.4 Quotes 정책
CREATE POLICY "Users can view own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON public.quotes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
  ON public.quotes FOR DELETE
  USING (auth.uid() = user_id);

-- 5.5 Quote Items 정책 (부모 quote 소유권 기반)
CREATE POLICY "Users can view own quote items"
  ON public.quote_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
        AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own quote items"
  ON public.quote_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
        AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own quote items"
  ON public.quote_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
        AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quote items"
  ON public.quote_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
        AND quotes.user_id = auth.uid()
    )
  );

-- 5.6 Contracts 정책
CREATE POLICY "Users can view own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts"
  ON public.contracts FOR DELETE
  USING (auth.uid() = user_id);

-- 5.7 Contract Items 정책
CREATE POLICY "Users can view own contract items"
  ON public.contract_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_items.contract_id
        AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own contract items"
  ON public.contract_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_items.contract_id
        AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own contract items"
  ON public.contract_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_items.contract_id
        AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own contract items"
  ON public.contract_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_items.contract_id
        AND contracts.user_id = auth.uid()
    )
  );

-- 5.8 Contract Signatures 정책
CREATE POLICY "Users can view contract signatures"
  ON public.contract_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_signatures.contract_id
        AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create contract signatures"
  ON public.contract_signatures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_signatures.contract_id
        AND contracts.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Step 5: RLS 정책 설정 완료';
END $$;

-- ============================================================================
-- Step 6: Triggers 설정
-- ============================================================================

-- 6.1 updated_at 자동 업데이트 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6.2 신규 사용자 자동 프로필 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, business_registration_number, company_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'business_registration_number',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'business_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Auth 사용자 생성 시 자동으로 public.users 프로필 생성';

-- 6.3 Auth 사용자 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '✅ Step 6: Triggers 설정 완료';
END $$;

-- ============================================================================
-- Step 7: 통계 업데이트
-- ============================================================================

ANALYZE public.users;
ANALYZE public.customers;
ANALYZE public.quotes;
ANALYZE public.quote_items;
ANALYZE public.contracts;
ANALYZE public.contract_items;
ANALYZE public.contract_signatures;

DO $$
BEGIN
  RAISE NOTICE '✅ Step 7: 테이블 통계 업데이트 완료';
END $$;

-- ============================================================================
-- Step 8: 검증 및 최종 확인
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public';

  -- Count RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ TalkSign 데이터베이스 초기화 완료!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 생성된 객체:';
  RAISE NOTICE '  - 테이블: % 개', table_count;
  RAISE NOTICE '  - 인덱스: % 개', index_count;
  RAISE NOTICE '  - RLS 정책: % 개', policy_count;
  RAISE NOTICE '  - 트리거: % 개', trigger_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 테이블 목록:';
  RAISE NOTICE '  1. users - 사용자 프로필';
  RAISE NOTICE '  2. customers - 고객 관리';
  RAISE NOTICE '  3. quotes - 견적서';
  RAISE NOTICE '  4. quote_items - 견적서 항목';
  RAISE NOTICE '  5. contracts - 계약서';
  RAISE NOTICE '  6. contract_items - 계약서 항목';
  RAISE NOTICE '  7. contract_signatures - 서명 관리';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 보안:';
  RAISE NOTICE '  ✓ RLS 활성화 (모든 테이블)';
  RAISE NOTICE '  ✓ 사용자별 데이터 격리';
  RAISE NOTICE '  ✓ Auth 기반 접근 제어';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ 성능:';
  RAISE NOTICE '  ✓ Composite indexes (pagination 최적화)';
  RAISE NOTICE '  ✓ Partial indexes (active records)';
  RAISE NOTICE '  ✓ Foreign key indexes';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 다음 단계:';
  RAISE NOTICE '  1. Supabase Auth Redirect URLs 설정';
  RAISE NOTICE '     → https://app.talksign.co.kr/auth/callback';
  RAISE NOTICE '  2. OAuth Provider 콜백 URL 업데이트';
  RAISE NOTICE '  3. 애플리케이션에서 회원가입 테스트';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
