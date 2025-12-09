import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
    url: supabaseUrl ? 'Defined' : 'Undefined',
    key: supabaseAnonKey ? 'Defined' : 'Undefined',
    env: process.env.NODE_ENV
});

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
