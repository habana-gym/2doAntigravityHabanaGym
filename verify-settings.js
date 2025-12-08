const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error('Error loading .env.local:', e);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifySettings() {
    console.log('--- Verifying System Settings Permissions ---');

    const testKey = 'test_setting';
    const testValue = 'verification_' + Date.now();

    console.log('Attempting to upsert setting:', testKey, testValue);

    const { data, error } = await supabase
        .from('system_settings')
        .upsert({ key: testKey, value: testValue })
        .select()
        .single();

    if (error) {
        console.error('❌ Error updating settings:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Settings updated successfully:', data);
    }
}

verifySettings();
