import { NextResponse, NextRequest } from 'next/server';
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

// GET - Get a specific user's data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    const { uuid } = await context.params;
    
    // Get user's seller_compound_data
    const { data: userData, error: userDataError } = await supabaseAdmin
      .from('seller_compound_data')
      .select('*')
      .eq('uuid', uuid)
      .single();
    
    if (userDataError) {
      return NextResponse.json(
        { error: `Failed to fetch user data: ${userDataError.message}` }, 
        { status: 500 }
      );
    }
    
    // Get user's onboarding progress
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('*')
      .eq('uuid', uuid)
      .order('created_at', { ascending: false });
    
    // Get user's profile notes
    const { data: notesData, error: notesError } = await supabaseAdmin
      .from('profile_notes')
      .select('*')
      .eq('profile_uuid', uuid)
      .order('created_at', { ascending: false });
    
    return NextResponse.json({
      user: userData,
      onboardingProgress: progressData,
      profileNotes: notesData
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update a user's data
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    const { uuid } = await context.params;
    const body = await request.json();
    
    // Update user's data
    const { data, error } = await supabaseAdmin
      .from('seller_compound_data')
      .update(body)
      .eq('uuid', uuid)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: `Failed to update user data: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    const { uuid } = await context.params;
    
    // Delete user's data in transaction-like manner
    // 1. Delete analytics events
    const { error: analyticsError } = await supabaseAdmin
      .from('analytics_events')
      .delete()
      .eq('user_id', uuid);
    
    if (analyticsError) {
      return NextResponse.json(
        { error: `Failed to delete analytics data: ${analyticsError.message}` }, 
        { status: 500 }
      );
    }
    
    // 2. Delete onboarding progress
    const { error: progressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .delete()
      .eq('uuid', uuid);
    
    if (progressError) {
      return NextResponse.json(
        { error: `Failed to delete progress data: ${progressError.message}` }, 
        { status: 500 }
      );
    }
    
    // 3. Delete profile notes
    const { error: notesError } = await supabaseAdmin
      .from('profile_notes')
      .delete()
      .eq('profile_uuid', uuid);
    
    if (notesError) {
      return NextResponse.json(
        { error: `Failed to delete profile notes: ${notesError.message}` }, 
        { status: 500 }
      );
    }
    
    // 4. Delete seller_compound_data
    const { error: compoundError } = await supabaseAdmin
      .from('seller_compound_data')
      .delete()
      .eq('uuid', uuid);
    
    if (compoundError) {
      return NextResponse.json(
        { error: `Failed to delete user profile: ${compoundError.message}` }, 
        { status: 500 }
      );
    }
    
    // 5. Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(uuid);
    
    if (authError) {
      return NextResponse.json(
        { error: `Failed to delete auth user: ${authError.message}` }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 