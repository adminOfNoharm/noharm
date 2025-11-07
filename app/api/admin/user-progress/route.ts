import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Simplified auth check for development
    // In production, you should implement proper authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    // For development purposes, allow the request even without auth
    // Remove this relaxed check in production
    if (!session) {
      console.warn('No session found, but proceeding for development purposes');
      // Skip auth check for now during development
      // In production, uncomment the following line:
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get UUID and stage parameters from query parameters
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');
    const stageName = searchParams.get('stage_name');
    const stageId = searchParams.get('stage_id');

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    // Need either stage_name or stage_id
    if (!stageName && !stageId) {
      return NextResponse.json({ error: 'Either stage_name or stage_id is required' }, { status: 400 });
    }

    let targetStageId: number;

    // If stage_id is provided, use it directly
    if (stageId) {
      targetStageId = parseInt(stageId);
      if (isNaN(targetStageId)) {
        return NextResponse.json({ error: 'Invalid stage_id format' }, { status: 400 });
      }
    } 
    // Otherwise, look up stage_id from stage_name
    else {
      // Get the stage_id from the stage_name
      const { data: stageData, error: stageError } = await supabase
        .from('onboarding_stages')
        .select('stage_id')
        .eq('stage_name', stageName)
        .single();

      if (stageError) {
        console.error('Error fetching stage ID:', stageError);
        return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
      }

      targetStageId = stageData.stage_id;
    }

    // Now, query the user's progress for this specific stage
    const { data: progressData, error: progressError } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('uuid', uuid)
      .eq('stage_id', targetStageId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error fetching user progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
    }

    // Return the progress data (if found) or empty object
    return NextResponse.json({ progress: progressData || null });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 