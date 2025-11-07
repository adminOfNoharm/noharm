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

// GET - Fetch user documents
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
    const uuid = searchParams.get('user_uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_uuid' },
        { status: 400 }
      );
    }

    // Get list of documents from storage
    const { data: files, error } = await supabaseAdmin
      .storage
      .from('docs')
      .list(uuid);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch documents: ${error.message}` },
        { status: 500 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ documents: [] });
    }

    // Get signed URLs for each document
    const documents = await Promise.all(
      files.map(async (file) => {
        const { data: url } = await supabaseAdmin
          .storage
          .from('docs')
          .createSignedUrl(`${uuid}/${file.name}`, 60 * 60); // 1 hour expiry

        return {
          name: file.name,
          size: file.metadata.size,
          type: file.metadata.mimetype || '',
          created_at: file.created_at || new Date().toISOString(),
          url: url?.signedUrl || ''
        };
      })
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user document
export async function DELETE(request: Request) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Get the UUID and file name from query params
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('user_uuid');
    const fileName = searchParams.get('file_name');

    if (!uuid || !fileName) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_uuid and file_name' },
        { status: 400 }
      );
    }

    // Delete document from storage
    const { error } = await supabaseAdmin
      .storage
      .from('docs')
      .remove([`${uuid}/${fileName}`]);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete document: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting user document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 