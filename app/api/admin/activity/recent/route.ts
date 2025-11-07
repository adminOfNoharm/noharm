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

// Interface for status change
interface StatusChange {
  uuid: string;
  email: string;
  status: string;
  last_updated_status: string;
  stage_name: string;
  previous_stage_name?: string;
  is_stage_change: boolean;
}

// Helper to get stage name from onboarding_stages
function getStageName(stages: any): string {
  if (!stages) return 'Unknown';
  
  if (Array.isArray(stages)) {
    return stages[0]?.stage_name || 'Unknown';
  }
  
  return stages.stage_name || 'Unknown';
}

// GET - Fetch recent activity
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

    // Get limit parameter
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 40;

    // Fetch all recent entries ordered by created_at
    const { data: allChanges, error } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select(`
        uuid,
        stage_id,
        status,
        created_at,
        last_updated_at,
        onboarding_stages (
          stage_id,
          stage_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch onboarding progress: ${error.message}` },
        { status: 500 }
      );
    }

    // Process all changes
    const activities = await Promise.all((allChanges || []).map(async (change: any) => {
      // Get user email from auth
      let email = 'Email not found';
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(change.uuid);
        if (authUser && authUser.user) {
          email = authUser.user.email || 'Email not found';
        }
      } catch (err) {
        console.error(`Error fetching email for ${change.uuid}:`, err);
      }

      const changes: StatusChange[] = [];
      const currentStageName = getStageName(change.onboarding_stages);

      // Check if this is a new stage (by looking at created_at)
      try {
        const { data: previousStageData, error: prevError } = await supabaseAdmin
          .from('user_onboarding_progress')
          .select(`
            stage_id,
            onboarding_stages (
              stage_name
            )
          `)
          .eq('uuid', change.uuid)
          .lt('created_at', change.created_at)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!prevError && previousStageData) {
          const previousStageName = getStageName(previousStageData.onboarding_stages);
          
          // This is a stage change
          changes.push({
            uuid: change.uuid,
            email: email,
            status: change.status,
            last_updated_status: change.created_at,
            stage_name: currentStageName,
            previous_stage_name: previousStageName,
            is_stage_change: true
          });
        }
      } catch (err) {
        // No previous stage or error - just continue
        console.log(`No previous stage found for ${change.uuid} or error:`, err);
      }

      // Check if there's also a status change (different last_updated_at from created_at)
      if (change.last_updated_at !== change.created_at) {
        changes.push({
          uuid: change.uuid,
          email: email,
          status: change.status,
          last_updated_status: change.last_updated_at,
          stage_name: currentStageName,
          is_stage_change: false
        });
      }

      return changes;
    }));

    // Flatten, sort, and limit the activities
    const allActivities = activities
      .flat()
      .sort((a, b) => 
        new Date(b.last_updated_status).getTime() - new Date(a.last_updated_status).getTime()
      )
      .slice(0, limit); // Keep only the most recent changes

    return NextResponse.json({ recentActivity: allActivities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 