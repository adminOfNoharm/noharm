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

// GET - Get onboarding progress for a user
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

    const url = new URL(request.url);
    const userUuid = url.searchParams.get('user_uuid');
    
    if (!userUuid) {
      return NextResponse.json(
        { error: 'User UUID is required' }, 
        { status: 400 }
      );
    }

    // Get user's onboarding progress
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select(`
        *,
        onboarding_stages(
          stage_id,
          stage_name,
          onboarding_stage_index
        )
      `)
      .eq('uuid', userUuid)
      .order('created_at', { ascending: false });

    if (progressError) {
      return NextResponse.json(
        { error: `Failed to fetch onboarding progress: ${progressError.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      progress: progressData || []
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Update user's onboarding status
export async function POST(request: Request) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userUuid, stageId, status } = body;
    
    if (!userUuid || !stageId || !status) {
      return NextResponse.json(
        { error: 'User UUID, stage ID, and status are required' }, 
        { status: 400 }
      );
    }

    // Update user's onboarding status
    const { data, error } = await supabaseAdmin
      .from('user_onboarding_progress')
      .update({ status })
      .eq('uuid', userUuid)
      .eq('stage_id', stageId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update onboarding status: ${error.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: data
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 