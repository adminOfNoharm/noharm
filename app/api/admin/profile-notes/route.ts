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

// GET - Fetch profile notes
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
    const profileUuid = searchParams.get('profile_uuid');

    if (!profileUuid) {
      return NextResponse.json(
        { error: 'Missing required parameter: profile_uuid' },
        { status: 400 }
      );
    }

    // Fetch notes
    const { data, error } = await supabaseAdmin
      .from('profile_notes')
      .select('*')
      .eq('profile_uuid', profileUuid)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      return NextResponse.json(
        { error: `Failed to fetch profile notes: ${error.message}` },
        { status: 500 }
      );
    }

    // Return note if found, otherwise return null
    return NextResponse.json({ note: data || null });
  } catch (error) {
    console.error('Error fetching profile notes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Save profile notes
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

    // Get request body
    const body = await request.json();
    const { profileUuid, notes } = body;

    if (!profileUuid || notes === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters: profileUuid and notes' },
        { status: 400 }
      );
    }

    // Check if notes already exist for this user
    const { data: existingNote, error: lookupError } = await supabaseAdmin
      .from('profile_notes')
      .select('id')
      .eq('profile_uuid', profileUuid)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') { // Not a "not found" error
      return NextResponse.json(
        { error: `Failed to check for existing notes: ${lookupError.message}` },
        { status: 500 }
      );
    }

    let data, error;

    if (existingNote) {
      // Update existing note
      ({ data, error } = await supabaseAdmin
        .from('profile_notes')
        .update({ 
          notes, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingNote.id)
        .select()
        .single());
    } else {
      // Create new note
      ({ data, error } = await supabaseAdmin
        .from('profile_notes')
        .insert({ 
          profile_uuid: profileUuid, 
          notes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single());
    }

    if (error) {
      return NextResponse.json(
        { error: `Failed to save profile notes: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ note: data });
  } catch (error) {
    console.error('Error saving profile notes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 