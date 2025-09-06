-- Update contract status constraint to only allow 'draft', 'sent', 'completed'
-- Migration: Update contracts table status constraint
-- Date: 2025-01-06

-- STEP 1: Check current status values
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;

-- STEP 2: Update existing records with old status values to new ones FIRST
-- Map 'pending' to 'draft'
UPDATE public.contracts 
SET status = 'draft' 
WHERE status = 'pending';

-- Map 'signed' to 'completed'  
UPDATE public.contracts 
SET status = 'completed' 
WHERE status = 'signed';

-- Map 'cancelled' to 'draft' (as cancelled contracts can be reactivated as drafts)
UPDATE public.contracts 
SET status = 'draft' 
WHERE status = 'cancelled';

-- Handle any other potential status values by mapping them to 'draft'
UPDATE public.contracts 
SET status = 'draft' 
WHERE status NOT IN ('draft', 'sent', 'completed');

-- STEP 3: Verify all records now have valid status values
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;

-- STEP 4: Drop existing check constraint if it exists
ALTER TABLE public.contracts 
DROP CONSTRAINT IF EXISTS contracts_status_check;

-- STEP 5: Add new check constraint with updated status values
ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('draft', 'sent', 'completed'));

-- STEP 6: Final verification
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;