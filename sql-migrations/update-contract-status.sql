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

-- STEP 6: Remove the default value temporarily
ALTER TABLE public.contracts ALTER COLUMN status DROP DEFAULT;

-- STEP 7: Create new enum type with only the values we want
CREATE TYPE contract_status_new AS ENUM ('draft', 'sent', 'completed');

-- STEP 8: Update the table to use the new enum type
ALTER TABLE public.contracts 
ALTER COLUMN status TYPE contract_status_new 
USING status::text::contract_status_new;

-- STEP 9: Drop the old enum type and rename the new one
DROP TYPE contract_status;
ALTER TYPE contract_status_new RENAME TO contract_status;

-- STEP 10: Restore the default value if it was 'draft' (or set a new appropriate default)
DO $$
DECLARE
    old_default text;
BEGIN
    old_default := current_setting('myapp.old_default', true);
    
    -- Set default to 'draft' (most appropriate for new contracts)
    ALTER TABLE public.contracts ALTER COLUMN status SET DEFAULT 'draft'::contract_status;
END $$;

-- STEP 11: Final verification
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