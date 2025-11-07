"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, Save, Trash, X, ExternalLink, Copy, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";

const generateRandomPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Helper function to convert YouTube URLs to embed URLs
const convertToEmbedUrl = (url: string): string => {
  // If it's already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Handle different YouTube URL formats
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    // youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    // youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // If no YouTube pattern matches, return the original URL
  return url;
};

interface ToolProfile {
  id: string;
  name: string;
  data: any;
  password: string;
  type: 'seller'; // Explicitly type as seller
}

interface HowItWorksStep {
  title: string;
  description: string;
}

interface Certificate {
  name: string;
  image: string;
  status: string;
}

interface FormData {
  toolInfo: {
    name: string;
    category: string;
    usp: string[];
    technologies: string[];
    inProduction: boolean;
    customerSupport: string;
    updateFrequency: string;
  };
  companyInfo: {
    name: string;
    description: string;
    foundedYear: number | null;
    location: string;
    website: string;
    operatingRegions: string[];
    sustainabilityScore: number | null;
    logo: string;
  };
  howItWorks: {
    steps: HowItWorksStep[];
  };
  scoreComponents: {
    technologyReadiness: number;
    impactPotential: number;
    marketViability: number;
    regularityFit: number;
    documentationAndVerification: number;
    platformEngagement: number;
    innovationType: number;
  };
  toolDescription: {
    short: string;
    long: string;
  };
  sidebarDescription: string;
  useCases: string[];
  certificates: Certificate[];
  ipStatus: string[];
  media: {
    video_url: string;
  };
  userAssociation: {
    user_uuid: string;
    user_email: string;
    user_name: string;
  };
}

interface User {
  uuid: string;
  email: string;
  name: string;
  role: string;
  companyName?: string;
}

export default function ToolProfilesPage() {
  const [profiles, setProfiles] = useState<ToolProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ToolProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    toolInfo: {
      name: '',
      category: '',
      usp: [],
      technologies: [],
      inProduction: false,
      customerSupport: '',
      updateFrequency: ''
    },
    companyInfo: {
      name: '',
      description: '',
      foundedYear: null,
      location: '',
      website: '',
      operatingRegions: [],
      sustainabilityScore: null,
      logo: ''
    },
    howItWorks: {
      steps: []
    },
    scoreComponents: {
      technologyReadiness: 0,
      impactPotential: 0,
      marketViability: 0,
      regularityFit: 0,
      documentationAndVerification: 0,
      platformEngagement: 0,
      innovationType: 0
    },
    toolDescription: {
      short: '',
      long: ''
    },
    sidebarDescription: '',
    useCases: [],
    certificates: [],
    ipStatus: [],
    media: {
      video_url: ''
    },
    userAssociation: {
      user_uuid: '',
      user_email: '',
      user_name: ''
    }
  });

  useEffect(() => {
    fetchProfiles();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Fetch users from seller_compound_data with their auth info
      const { data: profilesData, error: profilesError } = await supabase
        .from('seller_compound_data')
        .select('uuid, role, data')
        .neq('role', 'admin') // Exclude admin users
        .order('uuid');

      if (profilesError) throw profilesError;

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // Get auth info for these users
      const userIds = profilesData.map(p => p.uuid);
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.warn('Could not fetch auth users:', authError);
      }

      // Combine profile and auth data
      const combinedUsers: User[] = profilesData.map(profile => {
        const authUser = authUsers?.find(u => u.id === profile.uuid);
        const detailForm = profile.data?.detailForm || {};
        
        return {
          uuid: profile.uuid,
          email: authUser?.email || '',
          name: detailForm.firstName && detailForm.lastName 
            ? `${detailForm.firstName} ${detailForm.lastName}`
            : profile.data?.name || 'Unknown User',
          role: profile.role,
          companyName: detailForm.companyName || profile.data?.companyName || ''
        };
      });

      setUsers(combinedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tool_profiles')
        .select('*')
        .eq('type', 'seller') // Fetch only seller profiles
        .order('name');

      if (error) throw error;

      setProfiles(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile: ToolProfile) => {
    setSelectedProfile(profile);
    console.log('Raw profile data:', profile.data);
    
    // Get scoreComponents from companyInfo
    const scoreComponents = profile.data?.companyInfo?.scoreComponents || {
      technologyReadiness: 0,
      impactPotential: 0,
      marketViability: 0,
      regularityFit: 0,
      documentationAndVerification: 0,
      platformEngagement: 0,
      innovationType: 0
    };
    
    console.log('Score components found:', scoreComponents);

    setFormData({
      toolInfo: {
        name: profile.data?.toolInfo?.name || '',
        category: profile.data?.toolInfo?.category || '',
        usp: profile.data?.toolInfo?.usp || [],
        technologies: profile.data?.toolInfo?.technologies || [],
        inProduction: profile.data?.toolInfo?.inProduction || false,
        customerSupport: profile.data?.toolInfo?.customerSupport || '',
        updateFrequency: profile.data?.toolInfo?.updateFrequency || ''
      },
      companyInfo: {
        name: profile.data?.companyInfo?.name || profile.data?.companyName || '',
        description: profile.data?.companyInfo?.description || '',
        foundedYear: profile.data?.companyInfo?.foundedYear || null,
        location: profile.data?.companyInfo?.location || '',
        website: profile.data?.companyInfo?.website || '',
        operatingRegions: profile.data?.companyInfo?.operatingRegions || [],
        sustainabilityScore: profile.data?.companyInfo?.sustainabilityScore || null,
        logo: profile.data?.companyInfo?.logo || ''
      },
      howItWorks: {
        steps: profile.data?.howItWorks?.steps || []
      },
      scoreComponents,
      toolDescription: {
        short: profile.data?.toolDescription?.short || '',
        long: profile.data?.toolDescription?.long || ''
      },
      sidebarDescription: profile.data?.sidebarDescription || '',
      useCases: profile.data?.useCases || [],
      certificates: profile.data?.certificates || [],
      ipStatus: profile.data?.ipStatus || [],
      media: {
        video_url: profile.data?.media?.video_url || ''
      },
      userAssociation: {
        user_uuid: profile.data?.userAssociation?.user_uuid || '',
        user_email: profile.data?.userAssociation?.user_email || '',
        user_name: profile.data?.userAssociation?.user_name || ''
      }
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedProfile(null);
    setFormData({
      toolInfo: {
        name: '',
        category: '',
        usp: [],
        technologies: [],
        inProduction: false,
        customerSupport: '',
        updateFrequency: ''
      },
      companyInfo: {
        name: '',
        description: '',
        foundedYear: null,
        location: '',
        website: '',
        operatingRegions: [],
        sustainabilityScore: null,
        logo: ''
      },
      howItWorks: {
        steps: []
      },
      scoreComponents: {
        technologyReadiness: 0,
        impactPotential: 0,
        marketViability: 0,
        regularityFit: 0,
        documentationAndVerification: 0,
        platformEngagement: 0,
        innovationType: 0
      },
      toolDescription: {
        short: '',
        long: ''
      },
      sidebarDescription: '',
      useCases: [],
      certificates: [],
      ipStatus: [],
      media: {
        video_url: ''
      },
      userAssociation: {
        user_uuid: '',
        user_email: '',
        user_name: ''
      }
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.toolInfo.name.trim()) {
        toast.error("Tool name is required");
        return;
      }

      // Check for duplicate user associations (if a user is selected)
      if (formData.userAssociation.user_uuid && formData.userAssociation.user_uuid !== 'none') {
        const { data: existingProfiles, error: checkError } = await supabase
          .from('tool_profiles')
          .select('id, name')
          .contains('data', { userAssociation: { user_uuid: formData.userAssociation.user_uuid } })
          .neq('id', selectedProfile?.id || ''); // Exclude current profile if editing

        if (checkError) {
          console.warn('Error checking for duplicate associations:', checkError);
        } else if (existingProfiles && existingProfiles.length > 0) {
          toast.error(`User is already associated with profile: "${existingProfiles[0].name}"`);
          return;
        }
      }

      const profileData = {
        name: formData.toolInfo.name,
        data: {
          ...formData,
          companyName: formData.companyInfo.name,
          companyInfo: {
            ...formData.companyInfo,
            scoreComponents: formData.scoreComponents
          }
        },
        password: selectedProfile?.password || generateRandomPassword(),
        type: 'seller' as const // Ensure type is set to seller
      };

      console.log('Saving profile data:', profileData);

      if (selectedProfile) {
        const { error } = await supabase
          .from('tool_profiles')
          .update(profileData)
          .eq('id', selectedProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tool_profiles')
          .insert([profileData]);

        if (error) throw error;
      }

      toast.success(`Tool profile ${selectedProfile ? 'updated' : 'created'} successfully`);

      setIsEditing(false);
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const initiateDelete = (id: string) => {
    setProfileToDelete(id);
    setDeleteConfirm('');
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    
    const profile = profiles.find(p => p.id === profileToDelete);
    if (!profile) return;

    if (deleteConfirm !== profile.name) {
      toast.error("Please type the tool name correctly to confirm deletion");
      return;
    }

    try {
      const { error } = await supabase
        .from('tool_profiles')
        .delete()
        .eq('id', profileToDelete);

      if (error) throw error;

      toast.success("Tool profile deleted successfully");
      setIsDeleting(false);
      setProfileToDelete(null);
      setDeleteConfirm('');
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleArrayInput = (
    field: keyof FormData | 'usp' | 'technologies' | 'operatingRegions',
    value: string,
    parentField?: 'toolInfo' | 'companyInfo'
  ) => {
    const values = value.split(',').map(v => v.trim()).filter(Boolean);
    
    if (parentField) {
      setFormData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [field]: values
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const renderArrayInput = (
    field: keyof FormData | 'usp' | 'technologies' | 'operatingRegions',
    label: string,
    parentField?: 'toolInfo' | 'companyInfo'
  ) => {
    const value = parentField 
      ? formData[parentField][field as keyof typeof formData[typeof parentField]]
      : formData[field as keyof FormData];
    
    return (
      <div className="space-y-2">
        <Label>{label} (comma-separated)</Label>
        <Input
          value={Array.isArray(value) ? value.join(', ') : ''}
          onChange={(e) => handleArrayInput(field, e.target.value, parentField)}
          placeholder={`Enter ${label.toLowerCase()} separated by commas`}
          className="bg-white"
        />
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tool Profiles</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Tool Profile
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProfile ? 'Edit Tool Profile' : 'Create New Tool Profile'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Association Section */}
            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                User Association
              </h3>
              <p className="text-sm text-gray-600">
                Associate this profile with a specific user who has completed onboarding
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="userSelect">Select User</Label>
                  {!usersLoading && (
                    <span className="text-xs text-gray-500">
                      {users.length} users available
                    </span>
                  )}
                </div>
                {usersLoading ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading users...
                  </div>
                ) : (
                  <Select
                    value={formData.userAssociation.user_uuid || "none"}
                    onValueChange={(value) => {
                      if (value === "none") {
                        setFormData(prev => ({
                          ...prev,
                          userAssociation: {
                            user_uuid: '',
                            user_email: '',
                            user_name: ''
                          }
                        }));
                      } else {
                        const selectedUser = users.find(u => u.uuid === value);
                        setFormData(prev => ({
                          ...prev,
                          userAssociation: {
                            user_uuid: value,
                            user_email: selectedUser?.email || '',
                            user_name: selectedUser?.name || ''
                          }
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a user to associate with this profile" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned" className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="none">None - No user associated</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.uuid} value={user.uuid}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                            {user.companyName && (
                              <span className="text-xs text-gray-400">{user.companyName}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {formData.userAssociation.user_uuid && formData.userAssociation.user_uuid !== 'none' && (
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-sm font-medium text-gray-900">Associated User:</p>
                  <p className="text-sm text-gray-600">{formData.userAssociation.user_name}</p>
                  <p className="text-xs text-gray-500">{formData.userAssociation.user_email}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Tool Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="toolName">Tool Name</Label>
                <Input
                  id="toolName"
                  value={formData.toolInfo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    toolInfo: { ...prev.toolInfo, name: e.target.value }
                  }))}
                  placeholder="Tool name"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.toolInfo.category}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    toolInfo: { ...prev.toolInfo, category: e.target.value }
                  }))}
                  placeholder="Tool category"
                  className="bg-white"
                />
              </div>

              {renderArrayInput('usp', 'USPs', 'toolInfo')}
              {renderArrayInput('technologies', 'Technologies', 'toolInfo')}

              <div className="space-y-2">
                <Label htmlFor="inProduction">Production Status</Label>
                <div className="flex items-center space-x-2 bg-white p-2 rounded">
                  <input
                    type="checkbox"
                    id="inProduction"
                    checked={formData.toolInfo.inProduction}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      toolInfo: { ...prev.toolInfo, inProduction: e.target.checked }
                    }))}
                  />
                  <span>In Production</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerSupport">Customer Support</Label>
                <Input
                  id="customerSupport"
                  value={formData.toolInfo.customerSupport}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    toolInfo: { ...prev.toolInfo, customerSupport: e.target.value }
                  }))}
                  placeholder="e.g., 24/7"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateFrequency">Update Frequency</Label>
                <Input
                  id="updateFrequency"
                  value={formData.toolInfo.updateFrequency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    toolInfo: { ...prev.toolInfo, updateFrequency: e.target.value }
                  }))}
                  placeholder="e.g., Monthly"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logo"
                    value={formData.companyInfo.logo}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, logo: e.target.value }
                    }))}
                    placeholder="Enter logo URL"
                    className="bg-white"
                  />
                  {formData.companyInfo.logo && (
                    <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={formData.companyInfo.logo} 
                        alt="Company logo" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-logo.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyInfo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, name: e.target.value }
                  }))}
                  placeholder="Company name"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Input
                  id="companyDescription"
                  value={formData.companyInfo.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, description: e.target.value }
                  }))}
                  placeholder="Company description"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.companyInfo.foundedYear || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, foundedYear: parseInt(e.target.value) || null }
                  }))}
                  placeholder="Year founded"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.companyInfo.location}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, location: e.target.value }
                  }))}
                  placeholder="Company location"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.companyInfo.website}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, website: e.target.value }
                  }))}
                  placeholder="Company website"
                  className="bg-white"
                />
              </div>

              {renderArrayInput('operatingRegions', 'Operating Regions', 'companyInfo')}

              <div className="space-y-2">
                <Label htmlFor="sustainabilityScore">Sustainability Score</Label>
                <Input
                  id="sustainabilityScore"
                  type="number"
                  value={formData.companyInfo.sustainabilityScore || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, sustainabilityScore: parseInt(e.target.value) || null }
                  }))}
                  placeholder="Score (0-100)"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Tool Descriptions</h3>
              
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.toolDescription.short}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    toolDescription: { ...prev.toolDescription, short: e.target.value }
                  }))}
                  placeholder="Brief description of the tool"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Long Description</Label>
                <textarea
                  id="longDescription"
                  value={formData.toolDescription.long}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    toolDescription: { ...prev.toolDescription, long: e.target.value }
                  }))}
                  placeholder="Detailed description of the tool"
                  className="w-full min-h-[100px] p-2 rounded-md border border-gray-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebarDescription">Tool Card Description</Label>
                <Input
                  id="sidebarDescription"
                  value={formData.sidebarDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sidebarDescription: e.target.value
                  }))}
                  placeholder="Description that appears on the tool card"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
              
              {formData.howItWorks.steps.map((step, index) => (
                <div key={index} className="space-y-2 bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Step {index + 1}</span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          howItWorks: {
                            steps: prev.howItWorks.steps.filter((_, i) => i !== index)
                          }
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...formData.howItWorks.steps];
                      newSteps[index] = { ...newSteps[index], title: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        howItWorks: { steps: newSteps }
                      }));
                    }}
                    placeholder="Step title"
                    className="bg-white"
                  />
                  <Input
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...formData.howItWorks.steps];
                      newSteps[index] = { ...newSteps[index], description: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        howItWorks: { steps: newSteps }
                      }));
                    }}
                    placeholder="Step description"
                    className="bg-white"
                  />
                </div>
              ))}
              
              <Button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    howItWorks: {
                      steps: [...prev.howItWorks.steps, { title: '', description: '' }]
                    }
                  }));
                }}
                variant="outline"
                className="w-full"
              >
                Add Step
              </Button>
            </div>

            <div className="space-y-4 bg-yellow-50 p-6 rounded-lg border border-yellow-100">
              <h3 className="text-lg font-semibold text-gray-900">NoHarm Score Components</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technologyReadiness">Technology Readiness</Label>
                  <Input
                    id="technologyReadiness"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.technologyReadiness}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        technologyReadiness: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactPotential">Impact Potential</Label>
                  <Input
                    id="impactPotential"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.impactPotential}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        impactPotential: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketViability">Market Viability</Label>
                  <Input
                    id="marketViability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.marketViability}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        marketViability: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regularityFit">Regulatory Fit</Label>
                  <Input
                    id="regularityFit"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.regularityFit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        regularityFit: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentationAndVerification">Documentation & Verification</Label>
                  <Input
                    id="documentationAndVerification"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.documentationAndVerification}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        documentationAndVerification: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformEngagement">Platform Engagement</Label>
                  <Input
                    id="platformEngagement"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.platformEngagement}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        platformEngagement: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="innovationType">Innovation Type</Label>
                  <Input
                    id="innovationType"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreComponents.innovationType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scoreComponents: { 
                        ...prev.scoreComponents, 
                        innovationType: parseInt(e.target.value) || 0 
                      }
                    }))}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900">Certificates</h3>
              
              {formData.certificates.map((cert, index) => (
                <div key={index} className="space-y-2 bg-white p-4 rounded-lg border border-indigo-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Certificate {index + 1}</span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          certificates: prev.certificates.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    value={cert.name}
                    onChange={(e) => {
                      const newCerts = [...formData.certificates];
                      newCerts[index] = { ...newCerts[index], name: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        certificates: newCerts
                      }));
                    }}
                    placeholder="Certificate name"
                    className="bg-white"
                  />
                  <Input
                    value={cert.image}
                    onChange={(e) => {
                      const newCerts = [...formData.certificates];
                      newCerts[index] = { ...newCerts[index], image: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        certificates: newCerts
                      }));
                    }}
                    placeholder="Certificate image URL"
                    className="bg-white"
                  />
                  <Input
                    value={cert.status}
                    onChange={(e) => {
                      const newCerts = [...formData.certificates];
                      newCerts[index] = { ...newCerts[index], status: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        certificates: newCerts
                      }));
                    }}
                    placeholder="Certificate status"
                    className="bg-white"
                  />
                  {cert.image && (
                    <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={cert.image} 
                        alt={cert.name} 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-certificate.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <Button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    certificates: [...prev.certificates, { name: '', image: '', status: '' }]
                  }));
                }}
                variant="outline"
                className="w-full"
              >
                Add Certificate
              </Button>
            </div>

            <div className="space-y-4 bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              {renderArrayInput('useCases', 'Use Cases')}
              {renderArrayInput('ipStatus', 'IP Status')}
            </div>

            {/* Add Media Configuration Section */}
            <div className="space-y-4 bg-pink-50 p-6 rounded-lg border border-pink-100">
              <h3 className="text-lg font-semibold text-gray-900">Media</h3>
              
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.media.video_url}
                  onChange={(e) => {
                    const url = e.target.value;
                    const embedUrl = convertToEmbedUrl(url);
                    setFormData(prev => ({
                      ...prev,
                      media: { ...prev.media, video_url: embedUrl }
                    }));
                  }}
                  placeholder="Enter video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://vimeo.com/VIDEO_ID)"
                  className="bg-white"
                />
                <p className="text-sm text-gray-500">
                  Enter a video URL. For YouTube videos, you can paste the standard watch URL or share URL. For other platforms, use their embed URL.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={(open) => !open && setIsDeleting(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              This action cannot be undone. Please type <strong>{profiles.find(p => p.id === profileToDelete)?.name}</strong> to confirm deletion:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type the tool name to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Associated User</TableHead>
                <TableHead>Preview Link</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>{profile.data?.toolInfo?.category || 'N/A'}</TableCell>
                  <TableCell>
                    {profile.data?.userAssociation?.user_name && 
                     profile.data?.userAssociation?.user_uuid && 
                     profile.data?.userAssociation?.user_uuid !== 'none' ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{profile.data.userAssociation.user_name}</span>
                        <span className="text-xs text-gray-500">{profile.data.userAssociation.user_email}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not associated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a 
                      href={`https://noharm.tech/profilepreviews/${profile.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>••••••••</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPassword(profile.password)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(profile)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => initiateDelete(profile.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 