import { createClient } from '@supabase/supabase-js';

type AdminCheckResult = {
  isAdmin: boolean;
  userId?: string;
  error?: string;
};

export async function verifyAdmin(request: Request): Promise<AdminCheckResult> {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'No valid authorization header found' };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return { isAdmin: false, error: 'No token provided' };
    }



    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return { isAdmin: false, error: userError?.message || 'User not found' };
    }
    
    // Get the user's role from seller_compound_data
    const { data: userData, error: dataError } = await supabaseAdmin
      .from('seller_compound_data')
      .select('role')
      .eq('uuid', user.id)
      .single();
    
    if (dataError) {
      return { isAdmin: false, error: dataError.message };
    }
    
    return { 
      isAdmin: userData.role === 'admin', 
      userId: user.id 
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { 
      isAdmin: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 