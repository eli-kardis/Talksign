-- Add missing client fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS client_business_number TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS client_logo_url TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.quotes.client_business_number IS 'Client business registration number';
COMMENT ON COLUMN public.quotes.client_address IS 'Client business address';
COMMENT ON COLUMN public.quotes.client_logo_url IS 'Client company logo URL';

-- Update RLS policies to handle nullable user_id for demo mode
DROP POLICY IF EXISTS "Freelancers can view own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Freelancers can insert own quotes" ON public.quotes;  
DROP POLICY IF EXISTS "Freelancers can update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Freelancers can delete own draft quotes" ON public.quotes;

-- Create new policies that handle both authenticated and demo users
CREATE POLICY "Users can view quotes" ON public.quotes
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        user_id = '80d20e48-7189-4874-b792-9e514aaa0572'::UUID
    );

CREATE POLICY "Users can insert quotes" ON public.quotes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        user_id = '80d20e48-7189-4874-b792-9e514aaa0572'::UUID
    );

CREATE POLICY "Users can update quotes" ON public.quotes
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        user_id = '80d20e48-7189-4874-b792-9e514aaa0572'::UUID
    );

CREATE POLICY "Users can delete draft quotes" ON public.quotes
    FOR DELETE USING (
        (auth.uid() = user_id OR 
         user_id IS NULL OR
         user_id = '80d20e48-7189-4874-b792-9e514aaa0572'::UUID) 
        AND status = 'draft'
    );
