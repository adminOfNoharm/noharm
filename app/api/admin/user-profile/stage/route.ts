import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth-admin';
import { OnboardingProgress } from '@/lib/types/supabase';

// Initialize Supabase with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

// Helper to safely get stage name from onboarding_stages
function getStageName(onboardingStages: any): string {
  if (!onboardingStages) return '';
  
  // Handle if it's an array
  if (Array.isArray(onboardingStages)) {
    return onboardingStages[0]?.stage_name || '';
  }
  
  // Handle if it's an object
  return onboardingStages.stage_name || '';
}

// GET - Get user's onboarding stage status
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
    const uuid = url.searchParams.get('uuid');
    
    if (!uuid) {
      return NextResponse.json(
        { error: 'Missing required query parameter: uuid' }, 
        { status: 400 }
      );
    }

    // Fetch user's onboarding progress with stage information
    const { data: rawProgressData, error } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select(`
        uuid,
        stage_id,
        status,
        created_at,
        last_updated_at,
        onboarding_stages:onboarding_stages!inner (
          stage_id,
          stage_name,
          sequence
        )
      `)
      .eq('uuid', uuid)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch user stages: ${error.message}` }, 
        { status: 500 }
      );
    }

    // Transform the data to include proper stage name information
    const stageProgress = rawProgressData.map(progress => {
      const onboardingStages = progress.onboarding_stages as any;
      return {
        uuid: progress.uuid,
        stage_id: progress.stage_id,
        status: progress.status,
        created_at: progress.created_at,
        last_updated_at: progress.last_updated_at,
        stage_name: getStageName(onboardingStages),
        sequence: Array.isArray(onboardingStages) 
          ? onboardingStages[0]?.sequence 
          : onboardingStages?.sequence
      };
    });

    return NextResponse.json({ stageProgress });
  } catch (error) {
    console.error('Error fetching stage status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Update user's onboarding stage status
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

    const { uuid, stageId, status } = await request.json();
    
    // Validate required fields
    if (!uuid || !stageId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: uuid, stageId, and status are required' }, 
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['not_started', 'in_progress', 'in_review', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Allowed values: not_started, in_progress, in_review, completed' }, 
        { status: 400 }
      );
    }

    // Check if a record exists for this user and stage
    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('*')
      .eq('uuid', uuid)
      .eq('stage_id', stageId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to check existing record: ${fetchError.message}` }, 
        { status: 500 }
      );
    }

    let result;

    if (existingRecord) {
      // Update existing record
      const { data, error: updateError } = await supabaseAdmin
        .from('user_onboarding_progress')
        .update({ status, last_updated_at: new Date().toISOString() })
        .eq('uuid', uuid)
        .eq('stage_id', stageId)
        .select(`
          stage_id,
          status,
          onboarding_stages!inner (
            stage_id,
            stage_name,
            onboarding_stage_index
          )
        `);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to update status: ${updateError.message}` }, 
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Create new record
      const { data, error: insertError } = await supabaseAdmin
        .from('user_onboarding_progress')
        .insert({
          uuid,
          stage_id: stageId,
          status,
          created_at: new Date().toISOString(),
          last_updated_at: new Date().toISOString()
        })
        .select(`
          stage_id,
          status,
          onboarding_stages!inner (
            stage_id,
            stage_name,
            onboarding_stage_index
          )
        `);

      if (insertError) {
        return NextResponse.json(
          { error: `Failed to create status: ${insertError.message}` }, 
          { status: 500 }
        );
      }
      
      result = data;
    }

    // Extract stage data from the result
    if (result && result.length > 0) {
      const stageData = result[0];
      const stageInfo = stageData.onboarding_stages;
      
      // Handle different possible structures of onboarding_stages
      const stageName = getStageName(stageInfo);
      const stageIndex = Array.isArray(stageInfo) && stageInfo[0] 
        ? stageInfo[0].onboarding_stage_index 
        : (stageInfo && 'onboarding_stage_index' in stageInfo 
          ? stageInfo.onboarding_stage_index 
          : 0);
      
      const currentStage = {
        stage_id: stageData.stage_id,
        stage_name: stageName,
        status: stageData.status,
        stage_index: stageIndex
      };
      
      return NextResponse.json({ 
        success: true, 
        currentStage 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error updating stage status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 