-- Create a key-value store for system settings
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default values
INSERT INTO system_settings (key, value, description)
VALUES 
    ('inactive_grace_days', '5', 'Días de gracia después del vencimiento antes de marcar como Inactivo')
ON CONFLICT (key) DO NOTHING;

-- Policies (Open for now as it's internal tool)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" 
ON system_settings FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
