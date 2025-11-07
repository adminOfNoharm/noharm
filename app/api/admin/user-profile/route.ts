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

// Interface for profile data
interface ProfileData {
  uuid: string;
  data: Record<string, any>;
  status: string;
  role: string;
  email?: string;
  is_trial_enabled?: boolean;
  current_stage?: {
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
  };
  onboarding_stages?: Array<{
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
    data: Record<string, any>;
  }>;
}

// Interface for onboarding stage from database
interface OnboardingStageDB {
  stage_id: number;
  stage_name: string;
  onboarding_stage_index: number;
}

// Interface for progress with stage data
interface ProgressWithStage {
  stage_id: number;
  status: string;
  data: any;
  onboarding_stages: OnboardingStageDB;
}

// GET - Fetch user profile data with current stage
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

    // Fetch user profile data
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('seller_compound_data')
      .select('*')
      .eq('uuid', uuid)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: `Failed to fetch profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Construct the response object with the profile data
    const profile: ProfileData = {
      uuid: profileData.uuid,
      data: profileData.data || {},
      status: profileData.status,
      role: profileData.role,
      email: profileData.email || '',
      is_trial_enabled: profileData.is_trial_enabled || false,
    };

    // Always fetch the email from auth.users to ensure it's up-to-date
    try {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profileData.uuid);
      
      if (!userError && userData && userData.user && userData.user.email) {
        profile.email = userData.user.email;
      }
    } catch (error) {
      console.error('Error fetching user email from auth:', error);
      // Continue with the existing email if there's an error
    }

    // Fetch current stage
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select(`
        *,
        onboarding_stages (
          stage_id,
          stage_name,
          onboarding_stage_index
        )
      `)
      .eq('uuid', uuid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Add current stage if available
    if (progressData && !progressError) {
      const stageData = progressData.onboarding_stages as OnboardingStageDB;
      profile.current_stage = {
        stage_id: progressData.stage_id,
        stage_name: stageData?.stage_name || '',
        status: progressData.status,
        stage_index: stageData?.onboarding_stage_index || 0
      };
    }

    // Fetch all stages for this user
    const { data: allStages, error: stagesError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select(`
        stage_id,
        status,
        data,
        onboarding_stages (
          stage_id,
          stage_name,
          onboarding_stage_index
        )
      `)
      .eq('uuid', uuid)
      .order('created_at', { ascending: true });

    if (!stagesError && allStages) {
      profile.onboarding_stages = allStages.map((stage: any) => {
        const stageInfo = stage.onboarding_stages;
        return {
          stage_id: stage.stage_id,
          stage_name: stageInfo?.stage_name || '',
          status: stage.status,
          stage_index: stageInfo?.onboarding_stage_index || 0,
          data: stage.data || {}
        };
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 