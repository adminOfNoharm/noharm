"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AdminLoginRedirector() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check once on mount, then let the protected components handle auth
    const checkAdminStatus = async () => {
      try {
        console.log("Admin login page: Checking session...");
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Admin login page: No session found, redirecting to main login");
          window.location.href = '/login';
          return;
        }
        
        console.log("Admin login page: Session found, checking admin role");
        
        // Session exists, check if user is admin
        const { data, error } = await supabase
          .from('seller_compound_data')
          .select('role')
          .eq('uuid', session.user.id)
          .single();
        
        console.log("Admin login page: User data:", data, "Error:", error);
        
        if (error || !data) {
          console.log("Admin login page: No user data found, redirecting to main login");
          window.location.href = '/login';
          return;
        }
        
        if (data.role === 'admin') {
          console.log("Admin login page: Admin confirmed, redirecting to admin dashboard");
          window.location.href = '/admin';
          return;
        } else {
          console.log("Admin login page: User is not admin, redirecting to onboarding");
          window.location.href = '/onboarding/dashboard';
          return;
        }
      } catch (error) {
        console.error('Admin login page: Error checking session:', error);
        setError('Error checking authentication. Please try again.');
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4 min-h-[100dvh]">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 p-6">
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
          <p className="text-sm text-slate-600 text-center">Checking credentials...</p>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner />
              <p className="mt-4 text-sm text-slate-600">Validating your account...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-colors py-6 text-base rounded-lg"
              >
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 