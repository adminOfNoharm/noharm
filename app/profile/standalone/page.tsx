'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ecosenseProfile, ProfileData } from './data';
import Template1 from './template1';
import Template2 from './template2';

export default function StandaloneProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<1 | 2>(1);

  // Set the profile data from the imported data
  useEffect(() => {
    setProfile(ecosenseProfile);
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Template selector header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">EcoMetrics Profile Preview</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 mr-2">Template:</label>
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setSelectedTemplate(1)}
              className={`px-3 py-1.5 text-sm ${
                selectedTemplate === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Template 1
            </button>
            <button
              onClick={() => setSelectedTemplate(2)}
              className={`px-3 py-1.5 text-sm ${
                selectedTemplate === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Template 2
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : profile ? (
          <>
            {selectedTemplate === 1 ? (
              <Template1 profile={profile} />
            ) : (
              <Template2 profile={profile} />
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Profile not found</p>
          </div>
        )}
      </div>
    </div>
  );
} 