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

const TABLE_NAME = 'onboarding_questions';

// GET - Get sections for a specific flow
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
    const flowName = url.searchParams.get('flow');
    
    if (!flowName) {
      return NextResponse.json(
        { error: 'Flow name is required' }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .select('*')
      .eq('flow_name', flowName)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch sections: ${error.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      sections: data?.data?.sections || []
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update sections for a specific flow
export async function PUT(request: Request) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { flowName, sections } = body;
    
    if (!flowName || !sections) {
      return NextResponse.json(
        { error: 'Flow name and sections are required' }, 
        { status: 400 }
      );
    }

    // Get current data first
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from(TABLE_NAME)
      .select('*')
      .eq('flow_name', flowName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok for new flows
      return NextResponse.json(
        { error: `Failed to fetch current data: ${fetchError.message}` }, 
        { status: 500 }
      );
    }

    // Process sections to update/delete
    const modifiedSections = sections;
    const finalSections = (currentData?.data?.sections || [])
      .filter((section: any) => 
        !modifiedSections.some((m: any) => m._delete && m.id === section.id)
      )
      .map((existingSection: any) => {
        const modifiedSection = modifiedSections.find((s: any) => s.id === existingSection.id && !s._delete);
        if (!modifiedSection) return existingSection;
        
        // Ensure conditionalDisplay is properly handled
        const updatedSection = { ...existingSection, ...modifiedSection };
        if (modifiedSection.conditionalDisplay === undefined) {
          delete updatedSection.conditionalDisplay;
        }
        return updatedSection;
      });

    // Add new sections
    const newSections = modifiedSections.filter((section: any) => 
      !section._delete && 
      !(currentData?.data?.sections || []).some((s: any) => s.id === section.id)
    );

    // Update database
    const { error: updateError } = await supabaseAdmin
      .from(TABLE_NAME)
      .update({ data: { sections: [...finalSections, ...newSections] } })
      .eq('flow_name', flowName);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update sections: ${updateError.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 