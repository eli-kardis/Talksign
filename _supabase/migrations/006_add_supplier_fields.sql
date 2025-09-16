-- Add new supplier information fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update existing business_number to be business_registration_number for consistency
-- (keeping business_number for backward compatibility)
UPDATE public.users 
SET business_registration_number = business_number 
WHERE business_number IS NOT NULL AND business_registration_number IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.users.business_registration_number IS 'Business registration number for companies';
COMMENT ON COLUMN public.users.company_name IS 'Company name (required when business_registration_number is provided)';
COMMENT ON COLUMN public.users.business_name IS 'Legacy business name field, use company_name for new records';
COMMENT ON COLUMN public.users.business_number IS 'Legacy business number field, use business_registration_number for new records';