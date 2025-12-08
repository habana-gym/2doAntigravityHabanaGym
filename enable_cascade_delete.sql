-- Enable Cascade Delete for Clients
-- Run this in your Supabase SQL Editor

-- 1. Payments Table
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_client_id_fkey;

ALTER TABLE payments
ADD CONSTRAINT payments_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- 2. Attendance Table
ALTER TABLE attendance
DROP CONSTRAINT IF EXISTS attendance_client_id_fkey;

ALTER TABLE attendance
ADD CONSTRAINT attendance_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- 3. Workouts Log (if it exists, handling safety)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workouts_log') THEN
        ALTER TABLE workouts_log DROP CONSTRAINT IF EXISTS workouts_log_client_id_fkey;
        ALTER TABLE workouts_log 
            ADD CONSTRAINT workouts_log_client_id_fkey 
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;
END $$;
