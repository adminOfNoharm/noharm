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

// GET - Fetch buyer tool preferences
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

    // Get the UUID from query params
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'Missing required parameter: uuid' },
        { status: 400 }
      );
    }

    // Fetch tool preferences
    const { data, error } = await supabaseAdmin
      .from('buyer_tool_preferences')
      .select('tool_preferences')
      .eq('uuid', uuid)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      return NextResponse.json(
        { error: `Failed to fetch tool preferences: ${error.message}` },
        { status: 500 }
      );
    }

    // Return preferences if found, empty string otherwise
    const preferences = data?.tool_preferences || '';
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching buyer tool preferences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 