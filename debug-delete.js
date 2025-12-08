const { createClient } = require('@supabase/supabase-js');

// Manually passing env vars for debug script
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugDelete() {
    console.log('Debugging delete...');

    // 1. Create a dummy exercise
    const { data: ex, error: createError } = await supabase
        .from('exercises')
        .insert([{ name: 'Delete Me', muscle_group: 'Test' }])
        .select()
        .single();

    if (createError) {
        console.error('Create failed:', createError);
        return;
    }
    console.log('Created:', ex.id);

    // 2. Try to delete it
    const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('id', ex.id);

    if (deleteError) {
        console.error('Delete failed:', deleteError);
    } else {
        console.log('Delete successful (no error returned).');
    }

    // 3. Verify it's gone
    const { data: check } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', ex.id)
        .single();

    if (check) {
        console.log('Item STILL EXISTS after delete!');
    } else {
        console.log('Item confirmed deleted.');
    }
}

debugDelete();
