import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials from src/lib/supabase.js
const supabaseUrl = 'https://enaywfmmtxewuetaklvj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYXl3Zm1tdHhld3VldGFrbHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NjQ1OTcsImV4cCI6MjA4MDA0MDU5N30.l833RAN3QNXTp2HIxb43VDRTQ69SNix5CJm6Zqk2Ok0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    console.log('Testing connection to:', supabaseUrl);

    try {
        // Test Select
        const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Error connecting to table "clients" (SELECT):');
            console.error(error);
        } else {
            console.log('✅ Success! Table "clients" found (SELECT).');
        }

        // Test Insert (Dry run)
        const dummy = {
            first_name: 'Test',
            last_name: 'Bot',
            email: `test-${Date.now()}@example.com`,
            membership_type: 'Mensual',
            end_date: new Date().toISOString(),
            status: 'active'
        };

        const { data: insertData, error: insertError } = await supabase.from('clients').insert([dummy]).select();

        if (insertError) {
            console.error('❌ Error inserting into "clients":');
            console.error(insertError);
        } else {
            console.log('✅ Success! Inserted record into "clients".');
            // Cleanup
            if (insertData && insertData[0]) {
                await supabase.from('clients').delete().eq('id', insertData[0].id);
                console.log('✅ Cleaned up test record.');
            }
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkConnection();
