-- Add fax, business_type, and business_category fields to customers table

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS fax TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_category TEXT;

-- Add comments for documentation
COMMENT ON COLUMN customers.fax IS '고객 팩스 번호';
COMMENT ON COLUMN customers.business_type IS '고객 업태';
COMMENT ON COLUMN customers.business_category IS '고객 업종';
