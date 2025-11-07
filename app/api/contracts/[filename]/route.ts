// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log for debugging
console.log(`API Route: NEXT_PUBLIC_SUPABASE_URL exists: ${!!supabaseUrl}`);
console.log(`API Route: SUPABASE_SERVICE_ROLE_KEY exists: ${!!supabaseKey}`);

export async function GET(req, { params }) {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables for Supabase');
      return Response.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Initialize Supabase with server-side admin privileges
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Get the filename from the URL params - await the params object
    const { filename } = await params;
    
    if (!filename) {
      return Response.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }
    
    // Only allow specific filenames for security
    if (!['ally.pdf', 'seller.pdf', 'buyer.pdf'].includes(filename)) {
      return Response.json(
        { error: 'Invalid file requested' },
        { status: 403 }
      );
    }
    
    // Download the file from storage using admin privileges
    const { data, error } = await supabase.storage
      .from('contracts')
      .download(filename);
      
    if (error) {
      console.error('Supabase storage error:', error);
      return Response.json(
        { error: 'Failed to retrieve the file: ' + error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return Response.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Convert the file to an array buffer
    const arrayBuffer = await data.arrayBuffer();
    
    // Return the file with proper content type and headers for full PDF viewing
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    });
  } catch (err) {
    console.error('Error retrieving contract file:', err);
    return Response.json(
      { error: 'Internal server error: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
} 