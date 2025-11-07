import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth-admin';
import workflows from '@/components/workflows.json';

// Initialize Supabase with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

// Helper to safely get stage properties from onboarding_stages
function getStageProperty(onboardingStages: any, property: string): any {
  if (!onboardingStages) return null;
  
  // Handle if it's an array
  if (Array.isArray(onboardingStages)) {
    return onboardingStages[0]?.[property] || null;
  }
  
  // Handle if it's an object
  return onboardingStages[property] || null;
}

// GET - Get next possible stages for a user
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
    const role = url.searchParams.get('role');
    const currentStageId = url.searchParams.get('current_stage_id');
    
    if (!uuid || !role || !currentStageId) {
      return NextResponse.json(
        { error: 'User UUID, role, and current stage ID are required' }, 
        { status: 400 }
      );
    }

    // Get the workflow for the user's role
    const roleWorkflow = workflows[role as keyof typeof workflows];
    if (!roleWorkflow) {
      return NextResponse.json(
        { error: `No workflow found for role: ${role}` }, 
        { status: 400 }
      );
    }

    // Find the current stage index in the workflow
    const currentIndex = roleWorkflow.indexOf(parseInt(currentStageId));
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: `Current stage ID ${currentStageId} not found in workflow for role ${role}` }, 
        { status: 400 }
      );
    }
    
    // Get all stages after the current stage
    const nextStageNumbers = roleWorkflow.slice(currentIndex + 1);

    if (nextStageNumbers.length === 0) {
      return NextResponse.json({ 
        nextStages: [], 
        message: 'No more stages available in this workflow' 
      });
    }

    // Fetch the stage details from the database
    const { data: stages, error } = await supabaseAdmin
      .from('onboarding_stages')
      .select('*')
      .in('stage_id', nextStageNumbers)
      .order('onboarding_stage_index', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch next stages: ${error.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ nextStages: stages || [] });
  } catch (error) {
    console.error('Error fetching next stages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Move user to next stage
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
    const { uuid, nextStageId, currentStageId } = body;
    
    if (!uuid || !nextStageId) {
      return NextResponse.json(
        { error: 'User UUID and next stage ID are required' }, 
        { status: 400 }
      );
    }

    // If currentStageId is not provided, fetch the current stage
    let stageIdToComplete = currentStageId;
    if (!stageIdToComplete) {
      try {
        // Get current stage from the database
        const { data: currentProgress, error: fetchError } = await supabaseAdmin
          .from('user_onboarding_progress')
          .select('stage_id')
          .eq('uuid', uuid)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          return NextResponse.json(
            { error: `Failed to fetch current stage: ${fetchError.message}` }, 
            { status: 500 }
          );
        }

        stageIdToComplete = currentProgress.stage_id;
      } catch (error) {
        console.error('Error fetching current stage:', error);
        return NextResponse.json(
          { error: 'Failed to determine current stage ID' },
          { status: 500 }
        );
      }
    }

    // 1. Mark current stage as completed (if we have a stage to complete)
    if (stageIdToComplete) {
      const { error: updateError } = await supabaseAdmin
        .from('user_onboarding_progress')
        .update({ status: 'completed' })
        .eq('uuid', uuid)
        .eq('stage_id', stageIdToComplete);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to complete current stage: ${updateError.message}` }, 
          { status: 500 }
        );
      }
    }

    // 2. Create new stage record
    const { data: newStage, error: insertError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .insert([{
        uuid,
        stage_id: nextStageId,
        status: 'not_started'
      }])
      .select(`
        stage_id,
        status,
        onboarding_stages!inner (
          stage_id,
          stage_name,
          onboarding_stage_index
        )
      `)
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to create new stage record: ${insertError.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currentStage: {
        stage_id: newStage.stage_id,
        stage_name: getStageProperty(newStage.onboarding_stages, 'stage_name'),
        status: newStage.status,
        stage_index: getStageProperty(newStage.onboarding_stages, 'onboarding_stage_index')
      }
    });
  } catch (error) {
    console.error('Error moving to next stage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 