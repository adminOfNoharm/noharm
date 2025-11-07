import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth-admin';
import { OnboardingProgress, EmailMetrics, EmailClickEvent } from '@/lib/types/supabase';

// Initialize Supabase with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

// GET - Get email click analytics
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

    // Fetch all events for unique email clicks
    const { data: eventsData, error: eventsError } = await supabaseAdmin
      .from('analytics_events')
      .select('*');

    if (eventsError) {
      return NextResponse.json(
        { error: `Failed to fetch event counts: ${eventsError.message}` }, 
        { status: 500 }
      );
    }

    // Calculate unique email clicks
    const uniqueEmails = new Set(
      eventsData
        ?.filter(e => e.event_type === 'email_link_click')
        .map(e => e.event_data.email)
        .filter(Boolean)
    );

    // Get all stage_start events to identify users who've started stages
    const { data: stageStartEvents, error: stageStartError } = await supabaseAdmin
      .from('analytics_events')
      .select('user_id, event_data')
      .eq('event_type', 'stage_start');

    if (stageStartError) {
      return NextResponse.json(
        { error: `Failed to fetch stage start events: ${stageStartError.message}` }, 
        { status: 500 }
      );
    }

    // Group stage starts by user
    const userStageStarts = stageStartEvents?.reduce((acc, event) => {
      if (!event.user_id || !event.event_data.stage_name) return acc;
      if (!acc[event.user_id]) {
        acc[event.user_id] = new Set();
      }
      // Map payment to awaiting_payment
      const stageName = event.event_data.stage_name === 'payment' ? 'awaiting_payment' : event.event_data.stage_name;
      acc[event.user_id].add(stageName);
      return acc;
    }, {} as Record<string, Set<string>>);

    // Get unique users who've started stages
    const usersWithStarts = Object.keys(userStageStarts || {});

    // Fetch progress for users who've started stages
    const { data: rawProgressData, error: progressError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('uuid, status, onboarding_stages:onboarding_stages!inner(stage_name)')
      .in('uuid', usersWithStarts);

    if (progressError) {
      return NextResponse.json(
        { error: `Failed to fetch stage progress: ${progressError.message}` }, 
        { status: 500 }
      );
    }

    // Fix type issues by manually handling the shape of data
    // The TypeScript error suggests onboarding_stages is coming back as an array when we expected an object
    const stageProgress = (rawProgressData || []).map(item => {
      let stageName = '';
      
      // Handle different shapes of the response
      if (Array.isArray(item.onboarding_stages) && item.onboarding_stages.length > 0) {
        stageName = (item.onboarding_stages[0] as any).stage_name || '';
      } else if (item.onboarding_stages && typeof item.onboarding_stages === 'object') {
        stageName = (item.onboarding_stages as any).stage_name || '';
      }
        
      return {
        uuid: item.uuid,
        status: item.status,
        onboarding_stages: {
          stage_name: stageName
        }
      };
    });

    // Create map of static stages per user
    const userStaticStages = usersWithStarts.reduce((acc, userId) => {
      const startedStages = userStageStarts[userId];
      const userProgress = stageProgress.filter(p => p.uuid === userId);
      
      // Find the first stage that's still in not_started status
      const staticStage = userProgress.find(p => 
        startedStages.has(p.onboarding_stages.stage_name) && 
        p.status === 'not_started'
      );

      if (staticStage && staticStage.onboarding_stages) {
        acc[userId] = staticStage.onboarding_stages.stage_name;
      }
      return acc;
    }, {} as Record<string, string>);

    // Count static users
    const staticUsers = Object.keys(userStaticStages).length;

    // Fetch all email link click events
    const { data: allEvents, error: eventsError2 } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'email_link_click')
      .order('created_at', { ascending: true });

    if (eventsError2) {
      return NextResponse.json(
        { error: `Failed to fetch email click events: ${eventsError2.message}` }, 
        { status: 500 }
      );
    }

    // Extract all unique emails from events
    const uniqueEmailsFromEvents = new Set<string>();
    for (const event of allEvents || []) {
      const email = event.event_data?.email;
      if (email) uniqueEmailsFromEvents.add(email);
    }

    // Batch lookup all user IDs at once
    const emailsArray = Array.from(uniqueEmailsFromEvents);
    const userIdsByEmail: Record<string, string> = {};
    
    // Process emails in batches of 50 to avoid request size limits
    const batchSize = 50;
    for (let i = 0; i < emailsArray.length; i += batchSize) {
      const emailBatch = emailsArray.slice(i, i + batchSize);
      
      // Use a more efficient query to get all user IDs for this batch of emails
      const { data: userEmails, error: userEmailsError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('email', emailBatch);

      if (userEmailsError) {
        console.error('Error fetching user IDs by email:', userEmailsError);
        continue;
      }

      // Map emails to user IDs
      for (const user of userEmails || []) {
        if (user.email && user.id) {
          userIdsByEmail[user.email] = user.id;
        }
      }
    }

    // Process events to get unique emails with their earliest click
    const emailMap = new Map<string, EmailClickEvent>();
    
    for (const event of allEvents || []) {
      const email = event.event_data?.email;
      if (!email) continue;

      // Look up user ID for this email from our pre-fetched map
      const userId = userIdsByEmail[email];

      // Determine user role from the URL or source
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

      // Only process if this is the earliest click for this email
      if (!emailMap.has(email) || new Date(event.created_at) < new Date(emailMap.get(email)!.created_at)) {
        emailMap.set(email, {
          id: event.id,
          created_at: event.created_at,
          email: email,
          source: event.event_data?.source || '-',
          staticStage: userId ? userStaticStages[userId] || null : null,
          role
        });
      }
    }

    const emailClickEvents = Array.from(emailMap.values());

    const metrics: EmailMetrics = {
      uniqueEmailClicks: uniqueEmails.size,
      staticUsers
    };

    return NextResponse.json({
      metrics,
      emailClickEvents
    });
  } catch (error) {
    console.error('Error in email click analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 