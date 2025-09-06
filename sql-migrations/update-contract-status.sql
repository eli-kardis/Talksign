-- Update contract status enum and constraint to only allow 'draft', 'sent', 'completed'
-- Migration: Update contracts table status enum and constraint
-- Date: 2025-01-06

-- STEP 1: Check current status values and enum definition
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;

-- Check current enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'contract_status'
);

-- STEP 2: Add new enum values if they don't exist
-- This is safe - we're only adding values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'draft' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'contract_status')) THEN
        ALTER TYPE contract_status ADD VALUE 'draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sent' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'contract_status')) THEN
        ALTER TYPE contract_status ADD VALUE 'sent';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'contract_status')) THEN
        ALTER TYPE contract_status ADD VALUE 'completed';
    END IF;
END $$;

-- STEP 3: Update existing records to use new status values
-- Map existing values to new ones
UPDATE public.contracts 
SET status = 'draft'::contract_status 
WHERE status::text = 'pending';

UPDATE public.contracts 
SET status = 'completed'::contract_status 
WHERE status::text = 'signed';

UPDATE public.contracts 
SET status = 'draft'::contract_status 
WHERE status::text = 'cancelled';

-- STEP 4: Verify all records now have valid status values
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;

-- STEP 5: Store the current default value
DO $$
DECLARE
    current_default text;
BEGIN
    SELECT column_default INTO current_default
    FROM information_schema.columns 
    WHERE table_name = 'contracts' 
    AND column_name = 'status' 
    AND table_schema = 'public';
    
    -- Store it in a temporary variable for later use
    PERFORM set_config('myapp.old_default', COALESCE(current_default, ''), false);
END $$;

-- STEP 6: Store existing RLS policies that use the status column
DO $$
DECLARE
    policy_record record;
    policies_backup text := '';
BEGIN
    -- Get all policies on contracts table that might reference status column
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'contracts'
    LOOP
        -- Store policy information for recreation later
        policies_backup := policies_backup || 
            'Policy: ' || policy_record.policyname || 
            ', Permissive: ' || policy_record.permissive || 
            ', Roles: ' || array_to_string(policy_record.roles, ',') ||
            ', Command: ' || policy_record.cmd ||
            ', Qual: ' || COALESCE(policy_record.qual, 'NULL') ||
            ', With_check: ' || COALESCE(policy_record.with_check, 'NULL') || E'\n';
    END LOOP;
    
    -- Store policies info for later reference
    PERFORM set_config('myapp.policies_backup', policies_backup, false);
END $$;

-- STEP 7: Temporarily disable RLS and drop all policies on contracts table
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on contracts table
DROP POLICY IF EXISTS "Public can view sent contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can manage own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contracts;

-- STEP 8: Remove the default value temporarily
ALTER TABLE public.contracts ALTER COLUMN status DROP DEFAULT;

-- STEP 9: Create new enum type with only the values we want
CREATE TYPE contract_status_new AS ENUM ('draft', 'sent', 'completed');

-- STEP 10: Update the table to use the new enum type
ALTER TABLE public.contracts 
ALTER COLUMN status TYPE contract_status_new 
USING status::text::contract_status_new;

-- STEP 11: Drop the old enum type and rename the new one
DROP TYPE contract_status;
ALTER TYPE contract_status_new RENAME TO contract_status;

-- STEP 12: Restore the default value if it was 'draft' (or set a new appropriate default)
DO $$
DECLARE
    old_default text;
BEGIN
    old_default := current_setting('myapp.old_default', true);
    
    -- Set default to 'draft' (most appropriate for new contracts)
    ALTER TABLE public.contracts ALTER COLUMN status SET DEFAULT 'draft'::contract_status;
END $$;

-- STEP 13: Recreate RLS policies with updated status values
-- Enable RLS back on the table
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Recreate the most common policies (you may need to adjust based on your specific needs)
-- Public can view sent contracts (updated to use new enum values)
CREATE POLICY "Public can view sent contracts" ON public.contracts
    FOR SELECT 
    USING (status = 'sent'::contract_status OR status = 'completed'::contract_status);

-- Users can manage their own contracts
CREATE POLICY "Users can manage own contracts" ON public.contracts
    FOR ALL 
    USING (auth.uid() = user_id);

-- Enable read access for authenticated users on their own contracts
CREATE POLICY "Enable read access for authenticated users" ON public.contracts
    FOR SELECT 
    USING (auth.uid() = user_id);

-- STEP 14: Final verification
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;

-- Check final enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'contract_status'
);

-- Verify default value is set correctly
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'contracts' 
AND column_name = 'status' 
AND table_schema = 'public';

-- Verify RLS policies are recreated
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'contracts';

-- Show backed up policy information for reference
SELECT current_setting('myapp.policies_backup', true) as original_policies;