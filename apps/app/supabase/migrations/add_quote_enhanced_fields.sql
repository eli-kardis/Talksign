-- 견적서 테이블에 새로운 필드 추가
-- 실행일시: 2025-10-19

-- 1. 공급자 정보 필드 추가 (users 테이블)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS fax VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS company_seal_image_url TEXT;

COMMENT ON COLUMN public.users.fax IS '팩스 번호';
COMMENT ON COLUMN public.users.business_type IS '업태';
COMMENT ON COLUMN public.users.business_category IS '업종';
COMMENT ON COLUMN public.users.company_seal_image_url IS '회사 직인 이미지 URL';

-- 2. 견적서 테이블에 결제 정보 필드 추가
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS payment_condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_due_date DATE;

COMMENT ON COLUMN public.quotes.payment_condition IS '결제 조건 (선불/후불/분할)';
COMMENT ON COLUMN public.quotes.payment_method IS '결제 방법 (계좌이체/카드/현금)';
COMMENT ON COLUMN public.quotes.bank_name IS '입금 은행명';
COMMENT ON COLUMN public.quotes.bank_account_number IS '계좌번호';
COMMENT ON COLUMN public.quotes.bank_account_holder IS '예금주';
COMMENT ON COLUMN public.quotes.payment_due_date IS '결제 기한';

-- 3. 견적서 테이블에 견적 조건 필드 추가
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS delivery_due_date DATE,
ADD COLUMN IF NOT EXISTS warranty_period VARCHAR(100),
ADD COLUMN IF NOT EXISTS as_conditions TEXT,
ADD COLUMN IF NOT EXISTS special_notes TEXT,
ADD COLUMN IF NOT EXISTS disclaimer TEXT;

COMMENT ON COLUMN public.quotes.delivery_due_date IS '납품/완료 기한';
COMMENT ON COLUMN public.quotes.warranty_period IS '하자보증 기간';
COMMENT ON COLUMN public.quotes.as_conditions IS 'A/S 조건';
COMMENT ON COLUMN public.quotes.special_notes IS '특기사항';
COMMENT ON COLUMN public.quotes.disclaimer IS '면책사항';

-- 4. 견적서 테이블에 할인 정보 필드 추가
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS discount_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS promotion_name VARCHAR(200);

COMMENT ON COLUMN public.quotes.discount_rate IS '할인율 (%)';
COMMENT ON COLUMN public.quotes.discount_amount IS '할인 금액';
COMMENT ON COLUMN public.quotes.promotion_code IS '프로모션 코드';
COMMENT ON COLUMN public.quotes.promotion_name IS '프로모션명';

-- 5. 기존 total 계산 로직 업데이트가 필요한 경우를 위한 함수 생성
CREATE OR REPLACE FUNCTION calculate_quote_total(quote_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_amount NUMERIC;
BEGIN
  SELECT
    COALESCE(subtotal, 0)
    + COALESCE(tax, 0)
    - COALESCE(discount_amount, 0)
  INTO total_amount
  FROM public.quotes
  WHERE id = quote_id;

  RETURN COALESCE(total_amount, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_quote_total IS '견적서 최종 금액 계산 (소계 + 세금 - 할인)';
