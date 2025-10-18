-- =============================================
-- TalkSign Database Reset & Initialization
-- =============================================
-- 이 스크립트는 기존 데이터베이스를 완전히 초기화하고
-- 새로운 스키마를 생성합니다.
--
-- ⚠️ 경고: 이 스크립트는 모든 기존 데이터를 삭제합니다!
-- 프로덕션 환경에서는 신중하게 사용하세요.
-- =============================================

-- =============================================
-- STEP 1: 기존 테이블 및 함수 삭제
-- =============================================

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can insert own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can insert own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can update own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can delete own contracts" ON public.contracts;

-- 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS public.contract_signatures CASCADE;
DROP TABLE IF EXISTS public.contract_items CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.quote_items CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_email(uuid) CASCADE;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================
-- STEP 2: 사용자 프로필 테이블
-- =============================================

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

-- 사용자 테이블 인덱스
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_business_number ON public.users(business_registration_number);

-- 사용자 테이블 코멘트
COMMENT ON TABLE public.users IS '사용자 프로필 정보 - auth.users와 1:1 관계';
COMMENT ON COLUMN public.users.id IS 'auth.users.id와 동일한 UUID';
COMMENT ON COLUMN public.users.email IS '사용자 이메일 (로그인 ID)';
COMMENT ON COLUMN public.users.name IS '대표자명';
COMMENT ON COLUMN public.users.phone IS '연락처';
COMMENT ON COLUMN public.users.business_registration_number IS '사업자등록번호 (선택)';
COMMENT ON COLUMN public.users.company_name IS '회사명 (사업자등록번호 입력 시)';
COMMENT ON COLUMN public.users.business_name IS '상호명 (기존 호환성)';

-- =============================================
-- STEP 3: 고객 관리 테이블
-- =============================================

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

-- 고객 테이블 인덱스
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_email ON public.customers(email);

-- 고객 테이블 코멘트
COMMENT ON TABLE public.customers IS '고객 정보 관리';
COMMENT ON COLUMN public.customers.user_id IS '공급자(사용자) ID';
COMMENT ON COLUMN public.customers.name IS '고객명';
COMMENT ON COLUMN public.customers.company IS '고객 회사명';

-- =============================================
-- STEP 4: 견적서 테이블
-- =============================================

CREATE TABLE public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal DECIMAL(15, 2) DEFAULT 0,
  tax DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 견적서 테이블 인덱스
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_issue_date ON public.quotes(issue_date);

-- 견적서 테이블 코멘트
COMMENT ON TABLE public.quotes IS '견적서 관리';
COMMENT ON COLUMN public.quotes.quote_number IS '견적서 번호 (예: Q-2025-001)';
COMMENT ON COLUMN public.quotes.status IS '상태: draft(초안), sent(전송됨), accepted(승인), rejected(거절), expired(만료)';

-- =============================================
-- STEP 5: 견적서 항목 테이블
-- =============================================

CREATE TABLE public.quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 견적서 항목 인덱스
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_quote_items_sort_order ON public.quote_items(quote_id, sort_order);

-- 견적서 항목 코멘트
COMMENT ON TABLE public.quote_items IS '견적서 항목 (품목 리스트)';
COMMENT ON COLUMN public.quote_items.description IS '품목 설명';
COMMENT ON COLUMN public.quote_items.quantity IS '수량';
COMMENT ON COLUMN public.quote_items.unit_price IS '단가';
COMMENT ON COLUMN public.quote_items.amount IS '금액 (quantity * unit_price)';
COMMENT ON COLUMN public.quote_items.sort_order IS '표시 순서';

-- =============================================
-- STEP 6: 계약서 테이블
-- =============================================

CREATE TABLE public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  contract_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  issue_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'active', 'completed', 'cancelled')),
  subtotal DECIMAL(15, 2) DEFAULT 0,
  tax DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) DEFAULT 0,
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 계약서 테이블 인덱스
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_customer_id ON public.contracts(customer_id);
CREATE INDEX idx_contracts_quote_id ON public.contracts(quote_id);
CREATE INDEX idx_contracts_contract_number ON public.contracts(contract_number);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_issue_date ON public.contracts(issue_date);

-- 계약서 테이블 코멘트
COMMENT ON TABLE public.contracts IS '계약서 관리';
COMMENT ON COLUMN public.contracts.contract_number IS '계약서 번호 (예: C-2025-001)';
COMMENT ON COLUMN public.contracts.status IS '상태: draft(초안), pending(대기), signed(서명완료), active(진행중), completed(완료), cancelled(취소)';

-- =============================================
-- STEP 7: 계약서 항목 테이블
-- =============================================

CREATE TABLE public.contract_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 계약서 항목 인덱스
CREATE INDEX idx_contract_items_contract_id ON public.contract_items(contract_id);
CREATE INDEX idx_contract_items_sort_order ON public.contract_items(contract_id, sort_order);

-- 계약서 항목 코멘트
COMMENT ON TABLE public.contract_items IS '계약서 항목 (품목 리스트)';

-- =============================================
-- STEP 8: 서명 관리 테이블
-- =============================================

CREATE TABLE public.contract_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('supplier', 'customer')),
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signature_data TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 서명 테이블 인덱스
CREATE INDEX idx_signatures_contract_id ON public.contract_signatures(contract_id);
CREATE INDEX idx_signatures_signer_type ON public.contract_signatures(signer_type);

-- 서명 테이블 코멘트
COMMENT ON TABLE public.contract_signatures IS '계약서 서명 관리';
COMMENT ON COLUMN public.contract_signatures.signer_type IS '서명자 유형: supplier(공급자), customer(고객)';
COMMENT ON COLUMN public.contract_signatures.signature_data IS '서명 이미지 데이터 (Base64 또는 URL)';

-- =============================================
-- STEP 9: Row Level Security (RLS) 설정
-- =============================================

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- users 테이블 정책
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- customers 테이블 정책
CREATE POLICY "Users can view own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- quotes 테이블 정책
CREATE POLICY "Users can view own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON public.quotes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
  ON public.quotes FOR DELETE
  USING (auth.uid() = user_id);

-- quote_items 테이블 정책
CREATE POLICY "Users can view own quote items"
  ON public.quote_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own quote items"
  ON public.quote_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own quote items"
  ON public.quote_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own quote items"
  ON public.quote_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
  ));

-- contracts 테이블 정책
CREATE POLICY "Users can view own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts"
  ON public.contracts FOR DELETE
  USING (auth.uid() = user_id);

-- contract_items 테이블 정책
CREATE POLICY "Users can view own contract items"
  ON public.contract_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own contract items"
  ON public.contract_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own contract items"
  ON public.contract_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own contract items"
  ON public.contract_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

-- contract_signatures 테이블 정책
CREATE POLICY "Users can view own contract signatures"
  ON public.contract_signatures FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_signatures.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own contract signatures"
  ON public.contract_signatures FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_signatures.contract_id
    AND contracts.user_id = auth.uid()
  ));

-- =============================================
-- STEP 10: 트리거 함수 및 트리거
-- =============================================

-- 신규 사용자 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, business_registration_number, company_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_registration_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 사용자 이메일 조회 함수 (헬퍼)
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT email FROM public.users WHERE id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- =============================================
-- STEP 11: 샘플 데이터 (선택사항)
-- =============================================

-- 필요한 경우 아래 주석을 해제하여 샘플 데이터를 추가할 수 있습니다
--
-- INSERT INTO public.customers (user_id, name, email, phone, company)
-- SELECT
--   auth.uid(),
--   'Sample Customer ' || generate_series,
--   'customer' || generate_series || '@example.com',
--   '010-1234-56' || LPAD(generate_series::TEXT, 2, '0'),
--   'Sample Company ' || generate_series
-- FROM generate_series(1, 5);

-- =============================================
-- 완료!
-- =============================================

-- 스키마 검증
DO $$
BEGIN
  RAISE NOTICE '✅ TalkSign 데이터베이스 초기화 완료!';
  RAISE NOTICE '📊 생성된 테이블:';
  RAISE NOTICE '  - users (사용자 프로필)';
  RAISE NOTICE '  - customers (고객 관리)';
  RAISE NOTICE '  - quotes (견적서)';
  RAISE NOTICE '  - quote_items (견적서 항목)';
  RAISE NOTICE '  - contracts (계약서)';
  RAISE NOTICE '  - contract_items (계약서 항목)';
  RAISE NOTICE '  - contract_signatures (서명)';
  RAISE NOTICE '🔒 RLS (Row Level Security) 활성화됨';
  RAISE NOTICE '⚡ 트리거 및 함수 생성됨';
END $$;
