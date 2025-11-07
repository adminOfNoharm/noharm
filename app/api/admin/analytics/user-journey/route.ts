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

// GET - Get user journey data by email
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
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
        { status: 400 }
      );
    }

    // Try to find the user's UUID using their email
    const { data: uuid, error: rpcError } = await supabaseAdmin
      .rpc('get_user_uuid_by_email', { user_email: email });

    if (rpcError) {
      return NextResponse.json(
        { error: `RPC Error: ${rpcError.message}` }, 
        { status: 500 }
      );
    }

    if (!uuid) {
      return NextResponse.json(
        { error: 'User does not exist' }, 
        { status: 404 }
      );
    }

    // Fetch all events for this user
    const { data: userEvents, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('user_id', uuid)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch user journey: ${error.message}` }, 
        { status: 500 }
      );
    }

    if (!userEvents || userEvents.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Add email to each event
    const eventsWithEmail = userEvents.map(event => ({
      ...event,
      auth_user: { email }
    }));

    return NextResponse.json({ events: eventsWithEmail });
  } catch (error) {
    console.error('Error fetching user journey:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 