'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthDebugPage() {
  const [userData, setUserData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState('Checking authentication...');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setAuthStatus('Checking session...');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAuthStatus(`Session error: ${sessionError.message}`);
          return;
        }
        
        if (!session) {
          setAuthStatus('No active session found');
          setLoading(false);
          return;
        }
        
        setSessionData(session);
        setUserData(session.user);
        setAuthStatus('Session found, checking profile...');
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('seller_compound_data')
          .select('*')
          .eq('uuid', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Profile error:', profileError);
          setAuthStatus(`Profile error: ${profileError.message}`);
        } else if (!profile) {
          setAuthStatus('No profile found');
        } else {
          setProfileData(profile);
          setAuthStatus(`User authenticated as ${profile.role}`);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      alert(`Error signing out: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debugging</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Status: {authStatus}</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Login
              </button>
              <button 
                onClick={() => navigate('/admin/login')}
                className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Go to Admin Login
              </button>
              <button 
                onClick={() => navigate('/onboarding/dashboard')}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate('/admin')}
                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Go to Admin Dashboard
              </button>
              <button 
                onClick={handleSignOut}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sign Out
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Refresh
              </button>
            </div>
            
            {userData && (
              <div>
                <h3 className="font-medium">User Data:</h3>
                <pre className="bg-gray-800 text-green-300 p-3 rounded overflow-auto text-xs">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}
            
            {profileData && (
              <div>
                <h3 className="font-medium">Profile Data:</h3>
                <pre className="bg-gray-800 text-green-300 p-3 rounded overflow-auto text-xs">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              </div>
            )}
            
            {sessionData && (
              <div>
                <h3 className="font-medium">Session Data:</h3>
                <pre className="bg-gray-800 text-green-300 p-3 rounded overflow-auto text-xs">
                  {JSON.stringify({
                    ...sessionData,
                    access_token: sessionData.access_token 
                      ? `${sessionData.access_token.substring(0, 10)}...` 
                      : null,
                    refresh_token: sessionData.refresh_token 
                      ? `${sessionData.refresh_token.substring(0, 10)}...` 
                      : null,
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 