-- 002_rls_policies_additional.sql
-- 세금계산서와 일정 테이블의 RLS 정책 추가

-- 세금계산서 테이블 RLS 활성화
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;

-- 세금계산서 정책
CREATE POLICY "Users can view own tax invoices" ON public.tax_invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax invoices" ON public.tax_invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax invoices" ON public.tax_invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft tax invoices" ON public.tax_invoices
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- 일정 테이블 RLS 활성화
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 일정 정책
CREATE POLICY "Users can view own schedules" ON public.schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON public.schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON public.schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON public.schedules
    FOR DELETE USING (auth.uid() = user_id);
