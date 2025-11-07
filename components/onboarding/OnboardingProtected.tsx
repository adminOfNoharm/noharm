"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function OnboardingProtected({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Utility function to completely sign out and redirect
  const forceSignOutAndRedirect = async (redirectTo: string) => {
    try {
      await supabase.auth.signOut();
      console.log("OnboardingProtected: Force sign out successful, redirecting to:", redirectTo);
      // Clear any cached state
      localStorage.removeItem('supabase.auth.token');
      // Use setTimeout to ensure signOut completes before redirect
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 100);
    } catch (error) {
      console.error("OnboardingProtected: Error during force sign out:", error);
      // Redirect anyway
      window.location.href = redirectTo;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkAuthStatus = async () => {
      try {
        console.log("OnboardingProtected: Checking session...");
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("OnboardingProtected: No session found, redirecting to login");
          if (isMounted) {
            // Use force sign out and redirect
            await forceSignOutAndRedirect('/login');
          }
          return;
        }
        
        console.log("OnboardingProtected: Session found, checking user role");
        // User is authenticated - check if they have a profile in the system
        const { data, error } = await supabase
          .from('seller_compound_data')
          .select('role')
          .eq('uuid', session.user.id)
          .single();
        
        console.log("OnboardingProtected: User data:", data, "Error:", error);
        
        // User with role 'admin' should be redirected to admin dashboard
        if (!error && data && data.role === 'admin') {
          console.log("OnboardingProtected: Admin user detected, redirecting to admin dashboard");
          if (isMounted) {
            // Don't sign out admin users, just redirect
            window.location.href = '/admin';
          }
          return;
        }
        
        // Allow users even if they don't have a role yet (they may be in the process
        // of setting up their profile in the onboarding process)
        
        // User is authenticated
        console.log("OnboardingProtected: User authenticated, rendering content");
        if (isMounted) {
          setIsAuthenticated(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('OnboardingProtected: Error checking authentication status:', error);
        if (isMounted) {
          // Use force sign out and redirect
          await forceSignOutAndRedirect('/login');
        }
      }
    };
    
    checkAuthStatus();
    
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 