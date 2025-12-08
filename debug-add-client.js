
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for debug purposes based on verified env vars
const supabaseUrl = 'https://enaywfmmtxewuetaklvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYXl3Zm1tdHhld3VldGFrbHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NjQ1OTcsImV4cCI6MjA4MDA0MDU5N30.l833RAN3QNXTp2HIxb43VDRTQ69SNix5CJm6Zqk2Ok0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddClient() {
    console.log('Attempting to add client...');

    const clientData = {
        first_name: 'Debug',
        last_name: 'User',
        email: `debug.user.${Date.now()}@example.com`,
        phone: '1234567890',
        membership_type: 'Mensual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        debt: 0,
        plan_id: null
    };

    try {
        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) {
            console.error('Error adding client:', error);
        } else {
            console.log('Client added successfully:', data);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

testAddClient();
