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

// Interface for workflow stage
interface WorkflowStage {
  id: number;
  name: string;
  next?: number[];
}

// Interface for workflow
interface Workflow {
  role: string;
  stages: WorkflowStage[];
}

// GET - Fetch next possible stages for a role and current stage
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const currentStageId = searchParams.get('current_stage_id');

    if (!role || !currentStageId) {
      return NextResponse.json(
        { error: 'Missing required parameters: role and current_stage_id' },
        { status: 400 }
      );
    }

    // Find workflow for the role
    const workflowsArray = workflows as unknown as Workflow[];
    const workflow = workflowsArray.find(w => w.role === role);
    if (!workflow) {
      return NextResponse.json(
        { error: `No workflow found for role: ${role}` },
        { status: 404 }
      );
    }

    // Find next stage IDs
    const currentStage = workflow.stages.find(s => s.id === parseInt(currentStageId));
    if (!currentStage) {
      return NextResponse.json(
        { error: `Stage with ID ${currentStageId} not found in workflow for ${role}` },
        { status: 404 }
      );
    }

    const nextStageIds = currentStage.next || [];
    if (nextStageIds.length === 0) {
      return NextResponse.json({ stages: [] });
    }

    // Fetch stage details
    const { data, error } = await supabaseAdmin
      .from('onboarding_stages')
      .select('stage_id, stage_name, stage_description, onboarding_stage_index, is_active')
      .in('stage_id', nextStageIds)
      .order('onboarding_stage_index', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch next stages: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ stages: data || [] });
  } catch (error) {
    console.error('Error fetching next stages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 