-- Add 'medical_notes' to clients table for health observations
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- Add 'description' to plans table for training methodology/instructions
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS description TEXT;
