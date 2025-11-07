'use client';

import { ProfileData } from './data';
import ProfilePreview from '@/components/matches/SellerProfile';

interface Template1Props {
  profile: ProfileData;
}

// Adapter function to convert ProfileData to the format expected by ProfilePreview
const adaptProfileForPreview = (profile: ProfileData) => {
  return {
    id: profile.uuid,
    uuid: profile.uuid,
    name: profile.data.companyName,
    data: profile.data,
  };
};

export default function Template1({ profile }: Template1Props) {
  // Convert the profile to the expected format
  const adaptedProfile = adaptProfileForPreview(profile);
  
  return (
    <div className="h-full overflow-y-auto">
      <ProfilePreview 
        profile={adaptedProfile} 
        className=""
      />
    </div>
  );
} 