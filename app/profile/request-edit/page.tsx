'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import PreviewSidebar from '@/components/layout/PreviewSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import dummyData from '@/lib/data/profile-dummy-data.json';
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  uuid: string;
  data: Record<string, any>;
  status: string;
  role: string;
  email?: string;
}

interface EditRequest {
  field: string;
  section: string;
  current_value: string | null;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface EditableFieldProps {
  field: string;
  label: string;
  section: string;
  currentValue: string | null;
  onRequestEdit: (field: string, value: string) => void;
}

function EditableField({ field, label, section, currentValue, onRequestEdit }: EditableFieldProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900" htmlFor={field}>
          {label}
        </label>
        <Textarea
          id={field}
          placeholder={`Request changes to ${label.toLowerCase()}...`}
          onChange={(e) => onRequestEdit(field, e.target.value)}
          className="bg-white mt-1"
        />
      </div>
    </div>
  );
}

const EDITABLE_FIELDS = {
  company: {
    name: 'Company Name',
    location: 'Location',
    website: 'Website',
    description: 'Description',
    operatingRegions: 'Operating Regions',
    foundedYear: 'Founded Year',
    logo: 'Company Logo'
  },
  tool: {
    name: 'Tool Name',
    description: 'Tool Description',
    usp: 'Unique Selling Point',
    category: 'Category',
    inProduction: 'Production Status',
    technologies: 'Technologies',
    customerSupport: 'Customer Support',
    updateFrequency: 'Update Frequency',
    coverage: 'Coverage Areas',
    compliance: 'Compliance Standards'
  }
};

export default function RequestEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editRequests, setEditRequests] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('seller_compound_data')
          .select('*')
          .eq('uuid', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfileData(profile);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEditRequestChange = (field: string, value: string) => {
    setEditRequests(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('You must be logged in to submit edit requests');
        return;
      }

      // Filter out empty requests and format them properly
      const validRequests = Object.entries(editRequests)
        .filter(([_, value]) => value.trim() !== '')
        .map(([field, value]): EditRequest => {
          const [section] = field.split('.');
          return {
            field,
            section,
            current_value: profileData?.data?.[field] || null,
            new_value: value.trim(),
            status: 'pending'
          };
        });

      if (validRequests.length === 0) {
        toast.error('Please provide at least one edit request');
        return;
      }

      console.log('Attempting to submit requests:', validRequests);

      const { error } = await supabase
        .from('profile_edit_requests')
        .insert(validRequests);

      if (error) throw error;

      toast.success('Edit requests submitted successfully');
      router.push('/profile/preview');
    } catch (error) {
      console.error('Error submitting requests:', error);
      toast.error('Failed to submit edit requests');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const editableFields = [
    {
      section: 'Company Information',
      fields: [
        { 
          key: 'companyName', 
          label: 'Company Name', 
          current: profileData?.data?.detailForm?.companyName || 'Not specified' 
        },
        { 
          key: 'companyLocation', 
          label: 'Location', 
          current: profileData?.data?.detailForm?.companyLocation || 'Not specified' 
        },
        { 
          key: 'companyWebsite', 
          label: 'Website', 
          current: profileData?.data?.detailForm?.companyWebsite || 'Not specified' 
        },
        {
          key: 'sustainabilityScore',
          label: 'NoHarm Score',
          current: profileData?.data?.sustainabilityScore?.toString() || 'Not specified'
        }
      ]
    },
    {
      section: 'Tool Information',
      fields: [
        { 
          key: 'toolName', 
          label: 'Tool Name', 
          current: profileData?.data?.toolInfo?.name || dummyData.toolInfo.name 
        },
        { 
          key: 'toolDescription', 
          label: 'Description', 
          current: profileData?.data?.toolInfo?.description || dummyData.toolInfo.description 
        },
        { 
          key: 'toolUSP', 
          label: 'Unique Selling Point', 
          current: profileData?.data?.toolInfo?.usp || dummyData.toolInfo.usp 
        },
        { 
          key: 'toolCategory', 
          label: 'Category', 
          current: profileData?.data?.toolInfo?.category || dummyData.toolInfo.category 
        }
      ]
    }
  ];

  return (
    <div className="h-full flex bg-gray-50">
      <div className="fixed inset-y-0 left-0">
        <PreviewSidebar userEmail={profileData?.email || ''} userRole={profileData?.role || ''} />
      </div>

      <div className="flex-1 ml-[240px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Company Information Section */}
            <section className="bg-white rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(EDITABLE_FIELDS.company).map(([field, label]) => (
                    <EditableField
                      key={field}
                      field={field}
                      label={label}
                      section="company"
                      currentValue={profileData?.data?.detailForm?.[field] || ''}
                      onRequestEdit={handleEditRequestChange}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Tool Information Section */}
            <section className="bg-white rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Tool Information</h2>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(EDITABLE_FIELDS.tool).map(([field, label]) => (
                    <EditableField
                      key={field}
                      field={field}
                      label={label}
                      section="tool"
                      currentValue={profileData?.data?.toolInfo?.[field] || ''}
                      onRequestEdit={handleEditRequestChange}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Other Changes Section */}
            <section className="bg-white rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Other Changes</h2>
              </div>
              <div className="p-6 bg-gray-50">
                <Textarea
                  placeholder="Describe any other changes you'd like to request..."
                  className="min-h-[100px] bg-white"
                  onChange={(e) => handleEditRequestChange('other', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use this section for any changes that don't fit into the categories above
                </p>
              </div>
            </section>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6 -mx-6">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Edit Requests'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 