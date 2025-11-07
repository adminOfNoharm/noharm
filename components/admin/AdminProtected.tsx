"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AdminProtected({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      try {
        console.log("AdminProtected: Checking session...");
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("AdminProtected: No session found, redirecting to login");
          if (isMounted) {
            window.location.href = '/login';
          }
          return;
        }
        
        console.log("AdminProtected: Session found for user ID:", session.user.id);
        // Session exists, check if user is admin
        const { data, error } = await supabase
          .from('seller_compound_data')
          .select('role')
          .eq('uuid', session.user.id)
          .single();
        
        console.log("AdminProtected: User data:", data, "Error:", error);
        
        if (error || !data || data.role !== 'admin') {
          console.log("AdminProtected: User is not admin, redirecting to dashboard");
          if (isMounted) {
            window.location.href = '/onboarding/dashboard';
          }
          return;
        }
        
        // User is admin
        console.log("AdminProtected: Admin confirmed, rendering content");
        if (isMounted) {
          setIsAdmin(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('AdminProtected: Error checking admin status:', error);
        if (isMounted) {
          window.location.href = '/login';
        }
      }
    };
    
    checkAdminStatus();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
} 