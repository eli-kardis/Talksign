-- Update contract status constraint to only allow 'draft', 'sent', 'completed'
-- Migration: Update contracts table status constraint
-- Date: 2025-01-06

-- Drop existing check constraint if it exists
ALTER TABLE public.contracts 
DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Add new check constraint with updated status values
ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('draft', 'sent', 'completed'));

-- Update any existing records with old status values to new ones
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

-- Verify the migration
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contracts 
GROUP BY status 
ORDER BY status;