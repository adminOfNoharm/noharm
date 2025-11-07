import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth-admin';

// Initialize Supabase with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

// GET - Fetch all onboarding stages
export async function GET(request: Request) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Fetch all stages
    const { data, error } = await supabaseAdmin
      .from('onboarding_stages')
      .select('stage_id, stage_name, stage_description, onboarding_stage_index, is_active')
      .order('onboarding_stage_index', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch stages: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ stages: data });
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 