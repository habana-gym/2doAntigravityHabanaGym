-- Modify Clients Table for new requirements
-- Run this in Supabase SQL Editor

-- 1. Make Email Optional
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;

-- 2. Add Cedula (ID Document) if not exists
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cedula text;

-- 3. Add Phone if not exists (it might already, but good to ensure)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone text;

-- 4. Add Fingerprint ID (Unique to avoid duplicates)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fingerprint_id text;
-- Optional: Add constraint to ensure it's unique if set
-- ALTER TABLE clients ADD CONSTRAINT clients_fingerprint_id_key UNIQUE (fingerprint_id);
-- (Commenting uniqueness out for now to avoid errors with existing dirty data, can enable later)
