-- ================================================
-- Customer Management Setup for LinkFlow
-- ================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    representative_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE customers ADD CONSTRAINT customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE customers ADD CONSTRAINT customers_company_name_not_empty CHECK (char_length(trim(company_name)) > 0);
ALTER TABLE customers ADD CONSTRAINT customers_representative_name_not_empty CHECK (char_length(trim(representative_name)) > 0);
ALTER TABLE customers ADD CONSTRAINT customers_phone_not_empty CHECK (char_length(trim(phone)) > 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_customers_updated_at ON customers;
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for authenticated users to view all customers
CREATE POLICY "Users can view all customers" ON customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for authenticated users to insert customers
CREATE POLICY "Users can insert customers" ON customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for authenticated users to update customers
CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for authenticated users to delete customers
CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample customers data
INSERT INTO customers (company_name, representative_name, contact_person, email, phone, address) VALUES
('(주)스타트업에이', '김사장', '이담당', 'contact@startup-a.com', '02-1234-5678', '서울시 강남구 테헤란로 123, 스타트업타워 5층'),
('테크솔루션즈', '박대표', '최매니저', 'info@techsolutions.com', '02-9876-5432', '서울시 서초구 강남대로 456, 테크빌딩 10층'),
('디자인스튜디오', '정실장', NULL, 'hello@designstudio.co.kr', '010-1111-2222', '서울시 마포구 홍대입구로 789, 크리에이티브센터 3층'),
('글로벌인더스트리', '송회장', '윤과장', 'business@global-industry.com', '02-5555-6666', '부산시 해운대구 센텀중앙로 100, 글로벌타워 20층'),
('스마트솔루션', '한이사', '신차장', 'contact@smart-sol.kr', '031-7777-8888', '경기도 성남시 분당구 판교로 200, 스마트빌딩 7층'),
('클라우드테크', '조대표', '김팀장', 'admin@cloudtech.co.kr', '02-3333-4444', '서울시 영등포구 여의도동 국제금융로 10, 클라우드센터 15층'),
('이노베이션랩', '이사장', NULL, 'contact@innovation-lab.com', '010-5555-7777', '대전시 유성구 대학로 291, 이노베이션빌딩 8층'),
('미래기술', '최회장', '박부장', 'info@futuretech.kr', '051-9999-8888', '부산시 남구 용소로 45, 미래기술타워 12층')
ON CONFLICT (id) DO NOTHING;

-- Create view for customer statistics
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
    COUNT(*) as total_customers,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as customers_last_30_days,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as customers_last_7_days,
    MAX(created_at) as latest_customer_date
FROM customers;

-- Grant permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customer_stats TO authenticated;

-- Comments for documentation
COMMENT ON TABLE customers IS 'Customer information management table';
COMMENT ON COLUMN customers.id IS 'Unique customer identifier';
COMMENT ON COLUMN customers.company_name IS 'Company or organization name (required)';
COMMENT ON COLUMN customers.representative_name IS 'Name of the company representative (required)';
COMMENT ON COLUMN customers.contact_person IS 'Contact person name (optional)';
COMMENT ON COLUMN customers.email IS 'Email address (required, validated format)';
COMMENT ON COLUMN customers.phone IS 'Phone number (required)';
COMMENT ON COLUMN customers.address IS 'Physical address (optional)';
COMMENT ON COLUMN customers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN customers.updated_at IS 'Record last update timestamp';

-- Verification query
SELECT 'Customers table setup completed successfully!' as status;