"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { AlertCircle, Plus, Save, Trash, X, ExternalLink, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast"; // Assuming this is a custom toast component

// Interfaces from BuyerProfile.tsx (or define them here if not globally accessible)
interface BuyerCompanyInfo {
  logo?: string;
  name: string;
  website?: string;
  location?: string;
  description?: string;
  foundedYear?: number | null;
  operatingRegions?: string[];
}

interface Budget {
  type: string;
  range: string;
}

interface ProjectTimeline {
  urgency: string;
  startDate?: string | null; // Should be YYYY-MM-DD
  endDate?: string | null; // Should be YYYY-MM-DD
}

interface BuyerProfileData {
  // id is part of BuyerProfile, not BuyerProfileData directly in the form
  industry: string;
  region: string;
  companySize: string;
  budget: Budget;
  projectRequirements: string[];
  developmentType: string;
  projectTimeline: ProjectTimeline;
  esgGoals: string[];
  technologyReadiness: string;
  preferredEngagementModel: string;
  companyInfo: BuyerCompanyInfo;
  sidebarDescription?: string;
}

// Main profile structure stored in Supabase
interface BuyerProfile {
  id: string; // UUID from Supabase
  name: string; // companyInfo.name
  data: BuyerProfileData; // Data is now purely BuyerProfileData
  type: 'buyer'; // Type is a dedicated column
  password?: string; 
}


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

const initialFormData: BuyerProfileData = {
  industry: '',
  region: '',
  companySize: '',
  budget: { type: '', range: '' },
  projectRequirements: [],
  developmentType: '',
  projectTimeline: { urgency: '', startDate: null, endDate: null },
  esgGoals: [],
  technologyReadiness: '',
  preferredEngagementModel: '',
  companyInfo: {
    logo: '',
    name: '',
    website: '',
    location: '',
    description: '',
    foundedYear: null,
    operatingRegions: [],
  },
  sidebarDescription: '',
};

export default function BuyerProfilesPage() {
  const [profiles, setProfiles] = useState<BuyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<BuyerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<BuyerProfileData>(initialFormData);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('tool_profiles')
        .select('*')
        .eq('type', 'buyer') // Filter by dedicated type column
        .order('name');

      if (fetchError) throw fetchError;

      setProfiles(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile: BuyerProfile) => {
    setSelectedProfile(profile);
    // Ensure all fields from BuyerProfileData are mapped, providing defaults if missing
    const data = profile.data;
    setFormData({
      industry: data.industry || '',
      region: data.region || '',
      companySize: data.companySize || '',
      budget: data.budget || { type: '', range: '' },
      projectRequirements: data.projectRequirements || [],
      developmentType: data.developmentType || '',
      projectTimeline: data.projectTimeline || { urgency: '', startDate: null, endDate: null },
      esgGoals: data.esgGoals || [],
      technologyReadiness: data.technologyReadiness || '',
      preferredEngagementModel: data.preferredEngagementModel || '',
      companyInfo: data.companyInfo || initialFormData.companyInfo,
      sidebarDescription: data.sidebarDescription || '',
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedProfile(null);
    setFormData(initialFormData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.companyInfo.name.trim()) {
        toast.error("Company name is required");
        return;
      }

      const profileDataPayload = {
        name: formData.companyInfo.name,
        data: { ...formData }, // Data is now just the form data
        type: 'buyer' as const, // Set type in the dedicated column
        password: selectedProfile?.password || generateRandomPassword(),
      };

      if (selectedProfile) {
        const { error: updateError } = await supabase
          .from('tool_profiles')
          .update(profileDataPayload)
          .eq('id', selectedProfile.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('tool_profiles')
          .insert([profileDataPayload]);
        if (insertError) throw insertError;
      }

      toast.success(`Buyer profile ${selectedProfile ? 'updated' : 'created'} successfully`);
      setIsEditing(false);
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  const handleCopyPassword = (password: string | undefined) => {
    if (password) {
      navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard");
    } else {
      toast.error("No password to copy.");
    }
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
      toast.error("Please type the company name correctly to confirm deletion");
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('tool_profiles')
        .delete()
        .eq('id', profileToDelete);
      if (deleteError) throw deleteError;

      toast.success("Buyer profile deleted successfully");
      setIsDeleting(false);
      setProfileToDelete(null);
      setDeleteConfirm('');
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleInputChange = (section: keyof BuyerProfileData, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...(sectionData as object),
            [field]: value,
          },
        };
      }
      return { ...prev, [field]: value }; // For top-level fields if any (none in this schema)
    });
  };
  
  const handleDirectFormChange = (field: keyof BuyerProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (
    section: 'companyInfo' | 'projectRequirements' | 'esgGoals', // Explicitly list sections that have array fields or are arrays themselves
    value: string,
    field?: keyof BuyerCompanyInfo | undefined // Field within companyInfo, or undefined if section itself is the array
  ) => {
    const values = value.split(',').map(v => v.trim()).filter(Boolean);
    
    if (section === 'companyInfo' && field) {
        setFormData(prev => ({
            ...prev,
            companyInfo: {
                ...prev.companyInfo,
                [field as keyof BuyerCompanyInfo]: values // Type assertion
            }
        }));
    } else if (section === 'projectRequirements' || section === 'esgGoals') {
         setFormData(prev => ({
            ...prev,
            [section]: values
        }));
    }
  };

  const renderArrayInput = (
    section: 'companyInfo' | 'projectRequirements' | 'esgGoals',
    label: string,
    field?: keyof BuyerCompanyInfo | undefined,
    placeholder?: string
  ) => {
    let currentValue: string[] = [];
    if (section === 'companyInfo' && field) {
        const companyInfoFieldVal = formData.companyInfo[field as keyof BuyerCompanyInfo];
        if (Array.isArray(companyInfoFieldVal)) {
            currentValue = companyInfoFieldVal;
        }
    } else if (section === 'projectRequirements') {
        currentValue = formData.projectRequirements;
    } else if (section === 'esgGoals') {
        currentValue = formData.esgGoals;
    }
    
    return (
      <div className="space-y-2">
        <Label>{label} (comma-separated)</Label>
        <Input
          value={currentValue.join(', ')}
          onChange={(e) => handleArrayInput(section, e.target.value, field)}
          placeholder={placeholder || `Enter ${label.toLowerCase()} separated by commas`}
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
        <h1 className="text-3xl font-bold text-gray-900">Buyer Profiles</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Buyer Profile
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>
              {selectedProfile ? 'Edit Buyer Profile' : 'Create New Buyer Profile'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Company Information Section */}
            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name*</Label>
                <Input id="companyName" value={formData.companyInfo.name} onChange={(e) => handleInputChange('companyInfo', 'name', e.target.value)} placeholder="Company name" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo URL</Label>
                <Input id="logo" value={formData.companyInfo.logo} onChange={(e) => handleInputChange('companyInfo', 'logo', e.target.value)} placeholder="https://example.com/logo.png" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <Input id="website" value={formData.companyInfo.website} onChange={(e) => handleInputChange('companyInfo', 'website', e.target.value)} placeholder="https://example.com" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.companyInfo.location} onChange={(e) => handleInputChange('companyInfo', 'location', e.target.value)} placeholder="City, Country" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input id="foundedYear" type="number" value={formData.companyInfo.foundedYear || ''} onChange={(e) => handleInputChange('companyInfo', 'foundedYear', parseInt(e.target.value) || null)} placeholder="YYYY" className="bg-white"/>
              </div>
               {renderArrayInput('companyInfo', 'Operating Regions', 'operatingRegions')}
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea id="companyDescription" value={formData.companyInfo.description} onChange={(e) => handleInputChange('companyInfo', 'description', e.target.value)} placeholder="Brief company overview" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sidebarDescription">Short/Card Description</Label>
                <Textarea id="sidebarDescription" value={formData.sidebarDescription} onChange={(e) => handleDirectFormChange('sidebarDescription', e.target.value)} placeholder="Short summary for cards/previews" className="bg-white"/>
              </div>
            </div>

            {/* General Profile Information Section */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">General Profile Information</h3>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={formData.industry} onChange={(e) => handleDirectFormChange('industry', e.target.value)} placeholder="e.g., SaaS, Manufacturing" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Primary Region</Label>
                <Input id="region" value={formData.region} onChange={(e) => handleDirectFormChange('region', e.target.value)} placeholder="e.g., North America, Europe" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Input id="companySize" value={formData.companySize} onChange={(e) => handleDirectFormChange('companySize', e.target.value)} placeholder="e.g., 1-50 employees, 500+ employees" className="bg-white"/>
              </div>
            </div>

            {/* Project Details Section */}
            <div className="space-y-4 bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              <div className="space-y-2">
                <Label htmlFor="budgetType">Budget Type</Label>
                <Input id="budgetType" value={formData.budget.type} onChange={(e) => handleInputChange('budget', 'type', e.target.value)} placeholder="e.g., Fixed, Range" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Budget Range</Label>
                <Input id="budgetRange" value={formData.budget.range} onChange={(e) => handleInputChange('budget', 'range', e.target.value)} placeholder="e.g., $50k - $100k" className="bg-white"/>
              </div>
              {renderArrayInput('projectRequirements', 'Project Requirements', undefined, 'Requirement A, Requirement B')}
              <div className="space-y-2">
                <Label htmlFor="developmentType">Development Type</Label>
                <Input id="developmentType" value={formData.developmentType} onChange={(e) => handleDirectFormChange('developmentType', e.target.value)} placeholder="e.g., New Product, System Integration" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectUrgency">Project Urgency</Label>
                <Input id="projectUrgency" value={formData.projectTimeline.urgency} onChange={(e) => handleInputChange('projectTimeline', 'urgency', e.target.value)} placeholder="e.g., Immediate, Within 6 months" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Estimated Start Date</Label>
                <Input id="startDate" type="date" value={formData.projectTimeline.startDate || ''} onChange={(e) => handleInputChange('projectTimeline', 'startDate', e.target.value || null)} className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Estimated End Date</Label>
                <Input id="endDate" type="date" value={formData.projectTimeline.endDate || ''} onChange={(e) => handleInputChange('projectTimeline', 'endDate', e.target.value || null)} className="bg-white"/>
              </div>
            </div>

            {/* Goals & Preferences Section */}
            <div className="space-y-4 bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900">Goals & Preferences</h3>
              {renderArrayInput('esgGoals', 'ESG/Compliance Goals', undefined, 'Goal X, Standard Y')}
              <div className="space-y-2">
                <Label htmlFor="technologyReadiness">Technology Readiness</Label>
                <Input id="technologyReadiness" value={formData.technologyReadiness} onChange={(e) => handleDirectFormChange('technologyReadiness', e.target.value)} placeholder="e.g., Exploring, Ready to Implement" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredEngagementModel">Preferred Engagement Model</Label>
                <Input id="preferredEngagementModel" value={formData.preferredEngagementModel} onChange={(e) => handleDirectFormChange('preferredEngagementModel', e.target.value)} placeholder="e.g., Fixed Price, T&M" className="bg-white"/>
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
              placeholder="Type the company name to confirm"
              className="bg-white"
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
                <TableHead>Company Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Preview Link</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>{profile.data.industry || 'N/A'}</TableCell>
                  <TableCell>{profile.data.region || 'N/A'}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://noharm.tech/profilepreviews/${profile.id}`} // Assuming preview link structure remains same
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </a>
                  </TableCell>
                  <TableCell>
                    {profile.password ? (
                      <div className="flex items-center space-x-1">
                        <span>••••••••</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPassword(profile.password)}
                          className="p-1"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      'N/A'
                    )}
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
                        <Trash className="h-4 w-4 mr-1" /> Delete
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