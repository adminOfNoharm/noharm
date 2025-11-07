import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Sign out on server-side
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Create a success response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // In App Router, we can let Supabase handle the cookies automatically
    // The signOut() method will clear the cookies on the client side when called
    
    return response;
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
} 