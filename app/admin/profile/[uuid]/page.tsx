'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { capitalize } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import JSZip from 'jszip';
import workflows from '@/components/workflows.json';
import { 
  updateStageStatus,
  fetchUserProfile,
  fetchNextStages,
  moveToNextStage,
  fetchUserDocuments,
  fetchBuyerToolPreferences,
  UserProfile,
  UserDocument,
  updateTrialStatus
} from '@/lib/utils/user-profile-management';
import { saveProfileNotes, fetchProfileNotes, ProfileNotes } from '@/lib/utils/profile-management';
import { Switch } from "@/components/ui/switch";

interface ProfileData {
  uuid: string;
  data: Record<string, any>;
  status: string;
  role: string;
  email?: string;
  is_trial_enabled?: boolean;
  current_stage?: {
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
  };
  onboarding_stages?: Array<{
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
    data: Record<string, any>;
  }>;
}

interface OnboardingStage {
  stage_id: number;
  stage_name: string;
  onboarding_stage_index: number;
}

interface OnboardingProgress {
  stage_id: number;
  status: string;
  data: Record<string, any>;
  onboarding_stages: OnboardingStage;
}

const DetailForm = ({ data }: { data: Record<string, string> }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
    {Object.entries(data).map(([key, value]) => (
      <div 
        key={key} 
        className="flex flex-col p-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
      >
        <dt className="text-sm font-medium text-gray-500">
          {capitalize(key)}
        </dt>
        <dd className="mt-1 text-sm text-gray-900">
          {value || "N/A"}
        </dd>
      </div>
    ))}
  </div>
);

const ArrayDisplay = ({ items }: { items: any[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        {String(item)}
      </Badge>
    ))}
  </div>
);

const DataContent = ({ keyName, value }: { keyName: string; value: any }) => {
  if (keyName === "detailForm" && typeof value === "object") {
    return <DetailForm data={value} />;
  }

  if (Array.isArray(value)) {
    return <ArrayDisplay items={value} />;
  }

  // Handle simple single value
  if (typeof value !== 'object' || value === null) {
    return <p className="text-sm text-gray-900">{String(value || "N/A")}</p>;
  }

  // Handle object values
  const entries = Object.entries(value);
  
  // Group entries by type
  const simpleEntries = entries.filter(([_, val]) => 
    typeof val !== 'object' || val === null || Array.isArray(val)
  );
  const complexEntries = entries.filter(([_, val]) => 
    typeof val === 'object' && !Array.isArray(val) && val !== null
  );

  return (
    <div className="space-y-6">
      {/* Display simple values in a grid */}
      {simpleEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 bg-gray-50 p-4 rounded-lg">
          {simpleEntries.map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <dt className="text-sm font-medium text-gray-500">
                {capitalize(key)}
              </dt>
              <dd className="mt-1">
                {Array.isArray(val) ? (
                  <ArrayDisplay items={val} />
                ) : (
                  <span className="text-sm text-gray-900">
                    {String(val || "N/A")}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </div>
      )}

      {/* Display complex nested objects */}
      {complexEntries.length > 0 && (
        <div className="space-y-4">
          {complexEntries.map(([key, val]) => (
            <div key={key} className="border-l-2 border-gray-200 pl-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {capitalize(key)}
              </h4>
              <div className="pl-2">
                <DataContent keyName={key} value={val} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const aggregateStageData = (stages: Array<{data: Record<string, any>}>) => {
  const aggregatedData: Record<string, any> = {};
  
  stages.forEach(stage => {
    if (stage.data) {
      Object.entries(stage.data).forEach(([key, value]) => {
        // If the key already exists and both values are objects, merge them
        if (aggregatedData[key] && typeof aggregatedData[key] === 'object' && typeof value === 'object') {
          aggregatedData[key] = { ...aggregatedData[key], ...value };
        } 
        // If the key already exists and both values are arrays, concatenate unique values
        else if (Array.isArray(aggregatedData[key]) && Array.isArray(value)) {
          aggregatedData[key] = [...new Set([...aggregatedData[key], ...value])];
        }
        // Otherwise just take the latest value
        else {
          aggregatedData[key] = value;
        }
      });
    }
  });

  return aggregatedData;
};

export default function ProfilePage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = React.use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [notesId, setNotesId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedNextStage, setSelectedNextStage] = useState<number | null>(null);
  const [nextStages, setNextStages] = useState<OnboardingStage[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [toolPreferences, setToolPreferences] = useState<string>('');
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [updatingTrial, setUpdatingTrial] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile data for UUID:', resolvedParams.uuid);
      
      // Use the API utility to fetch the profile data
      const profileData: UserProfile = await fetchUserProfile(resolvedParams.uuid);
      
      if (!profileData) {
        throw new Error('Profile not found');
      }
      
      console.log('Loaded profile data:', {
        uuid: profileData.uuid,
        email: profileData.email,
        role: profileData.role,
        status: profileData.status,
        current_stage: profileData.current_stage
      });
      
      setProfile(profileData);
      
      // Fetch notes
      const notesData: ProfileNotes | null = await fetchProfileNotes(resolvedParams.uuid);
      if (notesData) {
        setNotes(notesData.notes || '');
        setNotesId(notesData.id);
      }
      
      // If role is buyer, fetch tool preferences
      if (profileData.role === 'buyer') {
        try {
          const preferences = await fetchBuyerToolPreferences(resolvedParams.uuid);
          setToolPreferences(preferences || '');
        } catch (error) {
          console.error("Error fetching tool preferences:", error);
        } finally {
          setLoadingPreferences(false);
        }
      } else {
        setLoadingPreferences(false);
      }
      
      // Fetch documents
      fetchUserDocsData();
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setSaving(true);
      if (!profile?.current_stage) {
        toast.error('No active stage found');
        return;
      }

      const updatedStage = await updateStageStatus(
        resolvedParams.uuid, 
        profile.current_stage.stage_id, 
        newStatus
      );
      
      // Update the current stage with the response
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          current_stage: {
            ...updatedStage
          }
        };
      });
      
      toast.success('Status updated successfully');
      
      // Refresh the full profile to ensure all data is up to date
      fetchProfile();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const updateNotes = async () => {
    try {
      setSaving(true);
      
      // Use API utility to save notes
      const updatedNotes = await saveProfileNotes(resolvedParams.uuid, notes);
      
      if (updatedNotes && updatedNotes.id) {
        setNotesId(updatedNotes.id);
      }
      
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    if (!profile) return;
    
    const blob = new Blob([JSON.stringify(profile.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile_${profile.uuid}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchNextStagesData = async () => {
    if (!profile?.current_stage?.stage_id || !profile.role) return;
    
    try {
      const stages = await fetchNextStages(resolvedParams.uuid, profile.current_stage.stage_id, profile.role);
      setNextStages(stages);
    } catch (error) {
      console.error("Error fetching next stages:", error);
      toast.error('Failed to fetch next stages');
    }
  };

  const moveToNextStageHandler = async () => {
    if (!selectedNextStage) {
      toast.error('No stage selected');
      return;
    }

    try {
      setSaving(true);
      const newStage = await moveToNextStage(resolvedParams.uuid, selectedNextStage.toString());
      
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          current_stage: newStage
        };
      });

      setSelectedNextStage(null);
      toast.success('Successfully moved to next stage');
      
      // Refresh the full profile to ensure all data is up to date
      fetchProfile();
    } catch (error) {
      console.error("Error moving to next stage:", error);
      toast.error('Failed to move to next stage');
    } finally {
      setSaving(false);
    }
  };

  const fetchUserDocsData = async () => {
    try {
      setLoadingDocuments(true);
      const userDocs = await fetchUserDocuments(resolvedParams.uuid);
      setDocuments(userDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user documents';
      toast.error(errorMessage);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const downloadAllDocuments = async () => {
    try {
      if (documents.length === 0) {
        toast.error('No documents to download');
        return;
      }

      // Create a new zip file
      const zip = new JSZip();
      
      // Show loading state
      setSaving(true);
      toast.success('Preparing documents for download...');

      // Download each file and add to zip
      const downloadPromises = documents.map(async (doc) => {
        try {
          const response = await fetch(doc.url);
          const blob = await response.blob();
          // Use the cleaned filename (remove timestamp)
          const fileName = doc.name.split('-').slice(1).join('-');
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Error downloading ${doc.name}:`, error);
          throw new Error(`Failed to download ${doc.name}`);
        }
      });

      await Promise.all(downloadPromises);

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents-${resolvedParams.uuid}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Documents downloaded successfully');
    } catch (error) {
      console.error('Error downloading documents:', error);
      toast.error('Failed to download documents');
    } finally {
      setSaving(false);
    }
  };

  const handleTrialToggle = async (checked: boolean) => {
    setUpdatingTrial(true);
    try {
      const result = await updateTrialStatus(resolvedParams.uuid, checked);
      if (result.success) {
        // Refresh the profile data to get the latest trial status
        await fetchProfile();
        toast.success(`Trial mode ${checked ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error updating trial status:', error);
      toast.error('Failed to update trial status');
    } finally {
      setUpdatingTrial(false);
    }
  };

  useEffect(() => {
    if (profile?.current_stage) {
      fetchNextStagesData();
    }
  }, [profile?.current_stage]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Profile not found</p>
      </div>
    );
  }

  const statusOptions = ['not_started', 'in_progress', 'in_review', 'completed'];

  const getStageBadgeColor = (stageName: string) => {
    const colors = {
      kyc: 'bg-fuchsia-100 text-fuchsia-800',
      contract_sign: 'bg-emerald-100 text-emerald-800',
      awaiting_payment: 'bg-violet-100 text-violet-800',
      tool_questionaire: 'bg-orange-100 text-orange-800',
      document_input: 'bg-sky-100 text-sky-800'
    };
    return colors[stageName.toLowerCase() as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const formatStageName = (stageName: string): string => {
    if (stageName.toLowerCase() === 'kyc') {
      return 'Initial Onboarding';
    }
    return stageName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Group the data into detailForm, simple fields, and complex fields
  const groupedData = Object.entries(profile?.data || {}).reduce((acc, [key, value]) => {
    if (key === "detailForm") {
      acc.detailForm = [key, value];
    } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      acc.complex.push([key, value]);
    } else {
      acc.simple.push([key, value]);
    }
    return acc;
  }, { 
    detailForm: null as [string, any] | null, 
    simple: [] as [string, any][], 
    complex: [] as [string, any][] 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Details</h1>
                <p className="text-gray-500 mt-2">
                  Email: <span className="font-medium">{profile.email || 'Email not available'}</span>
                </p>
                {!profile.email && (
                  <p className="text-amber-600 text-sm mt-1">
                    User email is missing. Please check the user account.
                  </p>
                )}
              </div>
              
              {/* Actions Group */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={exportData}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.is_trial_enabled || false}
                    onCheckedChange={handleTrialToggle}
                    disabled={updatingTrial}
                  />
                  <span className="text-sm font-medium">
                    {updatingTrial ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Trial Mode'
                    )}
                  </span>
                  {profile.is_trial_enabled && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Trial Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="text-lg" variant="outline">
                    {capitalize(profile.role)}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Current Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.current_stage ? (
                    <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                      {profile.current_stage.stage_index}. {formatStageName(profile.current_stage.stage_name)}
                    </Badge>
                  ) : (
                    <Badge className={getStageBadgeColor('kyc')}>
                      1. {formatStageName('kyc')}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={profile.current_stage?.status || 'not_started'} 
                    onValueChange={updateStatus}
                    disabled={!profile.current_stage}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {capitalize(status.replace('_', ' '))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Move to Next Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-gray-500">Select Next Stage</label>
                      <Select
                        value={selectedNextStage?.toString() || ''}
                        onValueChange={(value) => setSelectedNextStage(Number(value))}
                        disabled={!nextStages.length}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select next stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {nextStages.map((stage) => (
                            <SelectItem key={stage.stage_id} value={stage.stage_id.toString()}>
                              <Badge className={getStageBadgeColor(stage.stage_name)} variant="secondary">
                                {formatStageName(stage.stage_name)}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!nextStages.length && (
                        <p className="text-sm text-gray-500">No next stages available</p>
                      )}
                    </div>
                    <Button
                      onClick={moveToNextStageHandler}
                      disabled={!selectedNextStage || saving}
                      className="w-full"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Moving...
                        </>
                      ) : 'Move to Selected Stage'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tool Preferences Card - Only show for buyers */}
              {profile.role === 'buyer' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tool Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPreferences ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : toolPreferences ? (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{toolPreferences}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-lg font-medium">No preferences set</p>
                        <p className="text-sm mt-1">This buyer hasn't specified their tool preferences yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this profile..."
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={updateNotes}
                    className="mt-4"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Notes'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* DetailForm first */}
                  {groupedData.detailForm && (
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {capitalize(groupedData.detailForm[0])}
                      </h3>
                      <div className="pl-4">
                        <DetailForm data={groupedData.detailForm[1]} />
                      </div>
                    </div>
                  )}

                  {/* Simple fields in a grid */}
                  {groupedData.simple.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      {groupedData.simple.map(([key, value], index) => (
                        <div 
                          key={key} 
                          className="flex flex-col p-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
                        >
                          <dt className="text-sm font-medium text-gray-500">
                            {capitalize(key)}
                          </dt>
                          <dd className="mt-1">
                            {Array.isArray(value) ? (
                              <ArrayDisplay items={value} />
                            ) : (
                              <span className="text-sm text-gray-900">
                                {String(value || "N/A")}
                              </span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other complex fields */}
                  {groupedData.complex.map(([section, sectionData]) => (
                    <div key={section} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {capitalize(section)}
                      </h3>
                      <div className="pl-4">
                        <DataContent keyName={section} value={sectionData} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>User Documents</CardTitle>
                  {documents.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAllDocuments}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download All
                        </>
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingDocuments ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.name}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center space-x-4">
                            <FileText className="h-6 w-6 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.name.split('-').slice(1).join('-')}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(doc.size)} • {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <a
                            href={doc.url}
                            download
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No documents uploaded</p>
                      <p className="text-sm mt-1">This user hasn't uploaded any documents yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Profile not found</p>
          </div>
        )}
      </div>
    </div>
  );
} 