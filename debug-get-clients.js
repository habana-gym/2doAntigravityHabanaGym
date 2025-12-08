
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for debug purposes based on verified env vars
const supabaseUrl = 'https://enaywfmmtxewuetaklvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYXl3Zm1tdHhld3VldGFrbHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NjQ1OTcsImV4cCI6MjA4MDA0MDU5N30.l833RAN3QNXTp2HIxb43VDRTQ69SNix5CJm6Zqk2Ok0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetClients() {
    console.log('Attempting to get clients...');

    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*');

        if (error) {
            console.error('Error getting clients:', error);
        } else {
            console.log('Clients retrieved:', data);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

testGetClients();
