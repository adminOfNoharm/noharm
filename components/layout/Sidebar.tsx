'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, LogOut, Settings, CircleUserRound, Home, UserCheck, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useModal } from '@/contexts/ModalContext';

interface SidebarProps {
  userEmail: string;
  userRole: string;
  kycStatus: string;
}

const Sidebar = ({ userEmail, userRole, kycStatus }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { openDeleteAccountModal } = useModal();
  const [allStagesCompleted, setAllStagesCompleted] = useState(false);
  const [userUuid, setUserUuid] = useState<string>('');
  const [userToolProfile, setUserToolProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Function to fetch user's tool profile if it exists
  const fetchUserToolProfile = async (userUuid: string) => {
    try {
      setProfileLoading(true);
      
      // Direct lookup using user UUID association
      const { data: profile, error } = await supabase
        .from('tool_profiles')
        .select('*')
        .eq('type', userRole)
        .contains('data', { userAssociation: { user_uuid: userUuid } })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      } else if (profile) {
        setUserToolProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Check if dashboard should be accessible
  useEffect(() => {
    const checkOnboardingCompletion = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        setUserUuid(session.user.id);

        const { data: onboardingStages } = await supabase
          .from('user_onboarding_progress')
          .select('stage_id, status')
          .eq('uuid', session.user.id);

        if (onboardingStages && onboardingStages.length > 0) {
          if (userRole === 'seller') {
            // For sellers, dashboard is accessible after Stage 1 (KYC) completion
            const stage1 = onboardingStages.find(stage => stage.stage_id === 1);
            setAllStagesCompleted(stage1?.status === 'completed');
          } else {
            // For other roles, require all stages completed
            const completed = onboardingStages.every(stage => stage.status === 'completed');
            setAllStagesCompleted(completed);
          }
        }

        // Fetch user's tool profile if it exists
        if (session.user.id && userRole) {
          await fetchUserToolProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking onboarding completion:', error);
      }
    };

    checkOnboardingCompletion();
  }, [userRole]);

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
      <div className="p-6">
        <div className="flex justify-center mb-12 mt-5">
        <img src="/images/logos/new-logo-blue.png" alt="Logo" className="h-8 w-auto" />
        </div>
        <nav className="space-y-2">
          <Link
            href="/onboarding/dashboard"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              pathname === '/onboarding/dashboard'
                ? 'bg-black text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Onboarding Section</span>
          </Link>

          {/* Main Dashboard Link - Only show if onboarding is completed */}
          {allStagesCompleted && (
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                pathname === '/dashboard'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-green-50 border border-green-200'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Main Dashboard</span>
            </Link>
          )}

          {/* Your Profile Link - Only show if user has an associated profile */}
          {allStagesCompleted && userToolProfile && !profileLoading && (
            <Link
              href={`/profilepreviews/${userToolProfile.id}?portal=true`}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                pathname.includes('/profilepreviews/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <UserCheck className="h-5 w-5" />
              <span>Your Profile</span>
            </Link>
          )}

          {userRole !== 'admin' && kycStatus === 'completed' && (
            <Link
              href="/onboarding/profile"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                pathname === '/onboarding/profile'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          )}


        </nav>
      </div>

      {/* User Section at bottom of sidebar */}
      <div className="mt-auto border-t border-gray-100">
        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CircleUserRound className="h-9 w-9 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userEmail}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          <button 
            onClick={() => openDeleteAccountModal(userEmail)}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              // Clear any cached tokens
              localStorage.removeItem('supabase.auth.token');
              // Use a short delay to ensure signout completes
              setTimeout(() => {
                window.location.href = '/login';
              }, 100);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 