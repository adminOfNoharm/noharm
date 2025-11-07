'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BuyerProfileData, BuyerProfileProps } from '@/components/matches/BuyerProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import SellerProfile from '@/components/matches/SellerProfile';
import BuyerProfileComponent from '@/components/matches/BuyerProfile';
import AllyProfile, { AllyProfileProps } from '@/components/matches/AllyProfile';

interface ProfileFromDB {
  id: string;
  name: string;
  data: any;
  password?: string;
  type: 'seller' | 'buyer' | 'ally' | string;
}

export default function ProfilePage() {
  const { uuid } = useParams();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileFromDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isPortalAccess, setIsPortalAccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uuid) {
        setError('No profile ID provided');
        setLoading(false);
        return;
      }
      setLoading(true);
      
      try {
        // Check if this is portal access
        const portalParam = searchParams?.get('portal');
        const isPortal = portalParam === 'true';
        setIsPortalAccess(isPortal);

        // Get current user session if portal access
        let currentUserSession = null;
        if (isPortal) {
          const { data: { session } } = await supabase.auth.getSession();
          currentUserSession = session;
          setCurrentUser(session?.user || null);
        }

        const { data, error: supabaseError } = await supabase
          .from('tool_profiles')
          .select('id, name, data, password, type')
          .eq('id', uuid)
          .single();

        if (supabaseError) {
          if (supabaseError.code === 'PGRST116') {
            setError('Profile not found');
          } else {
            setError('Error loading profile: ' + supabaseError.message);
          }
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Profile not found');
          setLoading(false);
          return;
        }
        
        setProfile(data as ProfileFromDB);

        // Auto-authenticate if portal access and user is associated with this profile
        if (isPortal && currentUserSession?.user && data.data?.userAssociation?.user_uuid) {
          const associatedUserId = data.data.userAssociation.user_uuid;
          if (currentUserSession.user.id === associatedUserId) {
            setIsAuthenticated(true);
            console.log('Auto-authenticated via portal access for associated user');
          }
        }
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uuid, searchParams]);

  const handlePasswordSubmit = async () => {
    if (!profile) return;
    setVerifying(true);
    try {
      if (password === profile.password) {
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setError('Failed to verify password');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && (!profile || error.includes('not found'))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{error.includes('not found') ? 'Profile Not Found' : 'Error'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center ${error.includes('not found') ? 'text-amber-600' : 'text-red-600'}`}>
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested profile data could not be loaded or is unavailable.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Please enter the password to view {profile.name || "this"}'s profile
            </p>
            <div className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-full"
              />
              <Button
                onClick={handlePasswordSubmit}
                className="w-full"
                disabled={verifying || !password.trim()}
              >
                {verifying ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  'Submit'
                )}
              </Button>
              {error && !verifying && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          {profile.type === 'buyer' && (
            <BuyerProfileComponent profile={{ ...profile.data, id: profile.id } as BuyerProfileProps['profile']} className="" />
          )}
          {profile.type === 'seller' && (
            <SellerProfile profile={profile as any} className="" />
          )}
          {profile.type === 'ally' && (
            <AllyProfile profile={{ ...profile.data, id: profile.id } as AllyProfileProps['profile']} className="" />
          )}
          {profile.type !== 'buyer' && profile.type !== 'seller' && profile.type !== 'ally' && (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Unsupported Profile Type</h3>
              <p className="mt-1 text-sm text-gray-500">The profile type '{profile.type}' is not currently supported for viewing.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
} 