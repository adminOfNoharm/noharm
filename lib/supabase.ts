// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get your Supabase URL and anon key from your Supabase project settings
const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string; // Set in .env.local
const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string; // Set in .env.local

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
