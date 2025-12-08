-- Drop existing policy if it exists (or just create a new permissive one)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON system_settings;

-- Create a new policy allowing access to everyone (since this is internal tool usage)
CREATE POLICY "Enable all access for public" 
ON system_settings FOR ALL 
USING (true) 
WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON system_settings;
CREATE POLICY "Enable all access for public" ON system_settings FOR ALL USING (true) WITH CHECK (true);.