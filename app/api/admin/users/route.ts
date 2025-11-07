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

// GET - List all users with their current onboarding stage
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

    // Get profiles from seller_compound_data
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('seller_compound_data')
      .select('uuid, role, status, data');

    if (profilesError) {
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${profilesError.message}` },
        { status: 500 }
      );
    }

    // Extract all user IDs
    const userIds = profilesData.map(profile => profile.uuid);
    
    // Fetch all stage progress data in a single batch query
    const { data: allStageProgress, error: stageProgressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('*')
      .in('uuid', userIds)
      .order('created_at', { ascending: false });
      
    if (stageProgressError) {
      console.error("Error fetching stage progress:", stageProgressError);
    }
    
    // Group stage progress by user ID (keeping only the most recent one)
    const userStageProgress: Record<string, any> = {};
    if (allStageProgress) {
      allStageProgress.forEach(progress => {
        // Only store if we don't have one yet, or if this one is more recent
        if (!userStageProgress[progress.uuid] || 
            new Date(progress.created_at) > new Date(userStageProgress[progress.uuid].created_at)) {
          userStageProgress[progress.uuid] = progress;
        }
      });
    }
    
    // Get unique stage IDs from progress data to fetch stage details
    const stageIds = Object.values(userStageProgress)
      .map(progress => progress.stage_id)
      .filter((value, index, self) => self.indexOf(value) === index); // Get unique values

    // Fetch all stage details in one batch
    const { data: allStageDetails, error: stageDetailsError } = await supabaseAdmin
      .from('onboarding_stages')
      .select('stage_id, stage_name, onboarding_stage_index')
      .in('stage_id', stageIds);
      
    if (stageDetailsError) {
      console.error("Error fetching stage details:", stageDetailsError);
    }
    
    // Create lookup map for stage details
    const stageDetailsMap: Record<string, any> = {};
    if (allStageDetails) {
      allStageDetails.forEach(stage => {
        stageDetailsMap[stage.stage_id] = stage;
      });
    }
    
    // Batch fetch user auth data using separate calls (max 100 users per request)
    const batchSize = 100;
    const authUserMap: Record<string, any> = {};
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batchUserIds = userIds.slice(i, i + batchSize);
      for (const userId of batchUserIds) {
        try {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
          if (!authError && authUser) {
            authUserMap[userId] = {
              created_at: authUser.user.created_at,
              email: authUser.user.email
            };
          }
        } catch (err) {
          console.error(`Error fetching auth data for user ${userId}:`, err);
        }
      }
    }
    
    // Batch fetch all profile notes at once
    const { data: allNotes, error: notesError } = await supabaseAdmin
      .from('profile_notes')
      .select('profile_uuid, updated_at')
      .in('profile_uuid', userIds)
      .order('updated_at', { ascending: false });
      
    if (notesError) {
      console.error("Error fetching profile notes:", notesError);
    }
    
    // Create lookup map for latest note per user
    const userNotesMap: Record<string, string> = {};
    if (allNotes) {
      allNotes.forEach(note => {
        if (!userNotesMap[note.profile_uuid]) {
          userNotesMap[note.profile_uuid] = note.updated_at;
        }
      });
    }

    // Map the data together
    const profiles = profilesData.map(profile => {
      // Get stage progress for this user
      const progress = userStageProgress[profile.uuid];
      
      // Get stage details if we have progress
      let current_stage = undefined;
      if (progress && stageDetailsMap[progress.stage_id]) {
        const stageDetail = stageDetailsMap[progress.stage_id];
        current_stage = {
          stage_id: progress.stage_id,
          stage_name: stageDetail.stage_name,
          stage_index: stageDetail.onboarding_stage_index,
          status: progress.status
        };
      }
      
      // Get auth user info
      const authInfo = authUserMap[profile.uuid] || {};
      
      return {
        ...profile,
        email: authInfo.email,
        created_at: authInfo.created_at,
        updated_at: userNotesMap[profile.uuid] || null,
        current_stage
      };
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new user (admin can create users with any role)
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
    const { email, password, userData } = body;
    
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` }, 
        { status: 500 }
      );
    }
    
    // Create user profile data
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('seller_compound_data')
      .insert({
        uuid: authData.user.id,
        ...userData
      })
      .select()
      .single();
    
    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: `Failed to create user profile: ${profileError.message}` }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      user: profileData,
      authUser: authData.user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 