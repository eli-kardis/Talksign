-- 견적서 양식 개선을 위한 간단한 테이블 수정 SQL
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- STEP 1: quotes 테이블에 새로운 컬럼 추가
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS valid_until DATE,
ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS client_business_number TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- STEP 2: 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON public.quotes(valid_until);
CREATE INDEX IF NOT EXISTS idx_quotes_client_email ON public.quotes(client_email);

-- STEP 3: 컬럼 주석 추가 (문서화)
COMMENT ON COLUMN public.quotes.valid_until IS '견적서 유효기간';
COMMENT ON COLUMN public.quotes.supplier_info IS '공급자 정보 JSON';
COMMENT ON COLUMN public.quotes.client_business_number IS '고객 사업자등록번호';
COMMENT ON COLUMN public.quotes.client_address IS '고객 주소';
COMMENT ON COLUMN public.quotes.due_date IS '프로젝트 완료 예정일';
COMMENT ON COLUMN public.quotes.notes IS '견적서 참고사항';