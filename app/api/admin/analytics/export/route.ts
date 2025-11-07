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

// Helper function to format timestamp
function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

// Helper function to format event type
function formatEventType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// GET - Get export data for email click events
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

    // Get all email click events first (using the email-clicks endpoint logic)
    const { data: emailClickEventsResponse, error: emailClickError } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'email_link_click')
      .order('created_at', { ascending: true });

    if (emailClickError) {
      return NextResponse.json(
        { error: `Failed to fetch email click events: ${emailClickError.message}` }, 
        { status: 500 }
      );
    }

    // Get static stages map (simplified from email-clicks endpoint)
    const { data: allUsersProgress, error: progressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('uuid, status, onboarding_stages:onboarding_stages!inner(stage_name)')
      .eq('status', 'not_started');

    if (progressError) {
      return NextResponse.json(
        { error: `Failed to fetch stage progress: ${progressError.message}` }, 
        { status: 500 }
      );
    }

    // Map of UUID to static stage
    const staticStageMap: Record<string, string> = {};
    if (allUsersProgress) {
      for (const progress of allUsersProgress) {
        let stageName = '';
        
        // Handle different shapes of the response
        if (Array.isArray(progress.onboarding_stages) && progress.onboarding_stages.length > 0) {
          stageName = (progress.onboarding_stages[0] as any).stage_name || '';
        } else if (progress.onboarding_stages && typeof progress.onboarding_stages === 'object') {
          stageName = (progress.onboarding_stages as any).stage_name || '';
        }
        
        staticStageMap[progress.uuid] = stageName;
      }
    }

    // Process email clicks
    const emailMap = new Map();
    for (const event of emailClickEventsResponse || []) {
      const email = event.event_data?.email;
      if (!email) continue;

      // Determine role from URL or source
      let role: string | null = null;
      if (event.event_data?.url) {
        const url = event.event_data.url.toLowerCase();
        if (url.includes('/buyer') || url.includes('buyer=true')) {
          role = 'Buyer';
        } else if (url.includes('/seller') || url.includes('seller=true')) {
          role = 'Seller';
        } else if (url.includes('/ally') || url.includes('ally=true')) {
          role = 'Ally';
        }
      }

      // Only keep earliest click for each email
      if (!emailMap.has(email) || new Date(event.created_at) < new Date(emailMap.get(email).created_at)) {
        emailMap.set(email, {
          id: event.id,
          created_at: event.created_at,
          email: email,
          source: event.event_data?.source || '-',
          role
        });
      }
    }

    // Prepare CSV data
    const csvRows = [];
    csvRows.push(['Time', 'Email', 'Source', 'Role', 'Static Stage', 'User Journey'].join(','));

    // Process each email click event to get the full user journey
    for (const event of Array.from(emailMap.values())) {
      // Look up user ID for this email
      const { data: uuid } = await supabaseAdmin
        .rpc('get_user_uuid_by_email', { user_email: event.email });

      let staticStage = '-';
      let userJourneyData = 'Not available';

      if (uuid) {
        // Get static stage if available
        if (staticStageMap[uuid]) {
          staticStage = staticStageMap[uuid];
        }

        // Fetch user journey
        const { data: userEvents } = await supabaseAdmin
          .from('analytics_events')
          .select('*')
          .eq('user_id', uuid)
          .order('created_at', { ascending: true });

        if (userEvents && userEvents.length > 0) {
          // Format user journey for CSV
          userJourneyData = `"${userEvents.map(ue => 
            `${formatTimestamp(ue.created_at)} - ${formatEventType(ue.event_type)}${
              ue.event_data?.stage_name ? ` - Stage: ${ue.event_data.stage_name}` : ''
            }`
          ).join('; ')}"`;
        }
      }

      // Add row to CSV
      csvRows.push([
        formatTimestamp(event.created_at),
        event.email,
        event.source || '-',
        event.role || '-',
        staticStage,
        userJourneyData
      ].join(','));
    }

    // Join all rows into CSV content
    const csvContent = csvRows.join('\n');

    // Return CSV data
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="email-clicks-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 