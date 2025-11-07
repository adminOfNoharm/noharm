import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth-admin';
import { getTemplate } from '@/lib/flowTemplates';

// Initialize Supabase with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

const TABLE_NAME = 'onboarding_questions';

// GET - List all flows
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

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .select('flow_name');

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch flows: ${error.message}` }, 
        { status: 500 }
      );
    }

    const flows = data?.map((row: any) => row.flow_name) || [];
    return NextResponse.json({ flows });
  } catch (error) {
    console.error('Error fetching flows:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new flow
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

    const body = await request.json();
    const { flowName, templateName } = body;
    
    if (!flowName) {
      return NextResponse.json(
        { error: 'Flow name is required' }, 
        { status: 400 }
      );
    }

    // Check if flow already exists
    const { data: existingFlow, error: checkError } = await supabaseAdmin
      .from(TABLE_NAME)
      .select('flow_name')
      .eq('flow_name', flowName)
      .single();

    if (existingFlow) {
      return NextResponse.json(
        { error: 'Flow with this name already exists' },
        { status: 409 }
      );
    }

    // Create new flow
    const { error } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert([{ flow_name: flowName, data: { sections: [] } }]);

    if (error) {
      return NextResponse.json(
        { error: `Failed to create flow: ${error.message}` }, 
        { status: 500 }
      );
    }

    // Apply template if specified
    if (templateName) {
      const template = getTemplate(templateName);
      if (template && template.sections) {
        const { error: templateError } = await supabaseAdmin
          .from(TABLE_NAME)
          .update({ data: { sections: template.sections } })
          .eq('flow_name', flowName);

        if (templateError) {
          return NextResponse.json(
            { error: `Flow created but failed to apply template: ${templateError.message}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Flow created successfully' 
    });
  } catch (error) {
    console.error('Error creating flow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a flow
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

    const url = new URL(request.url);
    const flowName = url.searchParams.get('flow');
    
    if (!flowName) {
      return NextResponse.json(
        { error: 'Flow name is required' }, 
        { status: 400 }
      );
    }

    // Delete flow
    const { error } = await supabaseAdmin
      .from(TABLE_NAME)
      .delete()
      .eq('flow_name', flowName);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete flow: ${error.message}` }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Flow deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting flow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 