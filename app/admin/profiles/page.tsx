"use client";

import React from 'react';
import OnboardingProfiles from '@/components/admin/OnboardingProfiles';

export default function ProfilesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Onboarding Profiles
        </h1>
        <OnboardingProfiles />
      </div>
    </div>
  );
} 