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

// GET - Get analytics data with filters
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
    const eventType = url.searchParams.get('event_type');
    const userId = url.searchParams.get('user_id');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    let query = supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch analytics data: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    // Get event type summary using raw SQL via rpc
    const { data: eventSummary, error: summaryError } = await supabaseAdmin
      .rpc('get_event_summary');
    
    if (summaryError) {
      console.error('Error fetching event summary:', summaryError);
    }
    
    return NextResponse.json({
      events: data,
      totalCount: count,
      eventTypeSummary: eventSummary || []
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 