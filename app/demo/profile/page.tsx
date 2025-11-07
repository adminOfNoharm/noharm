'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import NavDemoWrapper from '@/components/demo/NavDemoWrapper';
import Template1 from '@/app/profile/standalone/template1';
import { ecosenseProfile, ProfileData } from '@/app/profile/standalone/data';

export default function DemoProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Set the profile data from the imported data
  useEffect(() => {
    setProfile(ecosenseProfile);
    setLoading(false);
  }, []);

  return (
    <NavDemoWrapper>
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : profile ? (
            <Template1 profile={profile} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Profile not found</p>
            </div>
          )}
        </div>
      </div>
    </NavDemoWrapper>
  );
} 