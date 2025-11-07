'use client';

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
import { toast } from "@/components/ui/toast";

// Interfaces based on AllyProfile.tsx and the provided schema
interface AllyCompanyInfo { 
  logo?: string;
  name: string;
  website?: string;
  location?: string;
  description?: string;
  foundedYear?: number | null;
  operatingRegions?: string[];
}

interface AllyCost {
  type: string;
  range: string;
}

interface AllyClimateTechExperience {
  years: number | null;
  sectors: string[];
}

interface AllyCertificate {
  name: string;
  image?: string;
  status: string;
}

// This is the structure of the 'data' object in Supabase for Ally profiles
interface AllyProfileFormData {
  region: string;
  name: string; // Main name of the Ally/service
  serviceOffered: string;
  cost: AllyCost;
  useCases: string[];
  clientTypesServed: string[];
  climateTechExperience: AllyClimateTechExperience;
  certificates: AllyCertificate[];
  preferredStageOfInnovators: string;
  successMetrics: string;
  availability: string;
  companyInfo: AllyCompanyInfo; // Ally's own company details
  sidebarDescription?: string;
}

// Main profile structure stored in Supabase for Ally profiles
interface AllySupabaseProfile {
  id: string; // UUID from Supabase
  name: string; // Main name of the Ally/service (matches AllyProfileFormData.name)
  data: AllyProfileFormData;
  type: 'ally'; 
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

const initialAllyFormData: AllyProfileFormData = {
  region: '',
  name: '',
  serviceOffered: '',
  cost: { type: '', range: '' },
  useCases: [],
  clientTypesServed: [],
  climateTechExperience: { years: null, sectors: [] },
  certificates: [],
  preferredStageOfInnovators: '',
  successMetrics: '',
  availability: '',
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

export default function AllyProfilesPage() {
  const [profiles, setProfiles] = useState<AllySupabaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AllySupabaseProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<AllyProfileFormData>(initialAllyFormData);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('tool_profiles')
        .select('*')
        .eq('type', 'ally') // Filter by type 'ally'
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

  const handleEdit = (profile: AllySupabaseProfile) => {
    setSelectedProfile(profile);
    const data = profile.data;
    // Map all fields from AllyProfileFormData, providing defaults
    setFormData({
      region: data.region || '',
      name: data.name || '',
      serviceOffered: data.serviceOffered || '',
      cost: data.cost || { type: '', range: '' },
      useCases: data.useCases || [],
      clientTypesServed: data.clientTypesServed || [],
      climateTechExperience: data.climateTechExperience || { years: null, sectors: [] },
      certificates: data.certificates || [],
      preferredStageOfInnovators: data.preferredStageOfInnovators || '',
      successMetrics: data.successMetrics || '',
      availability: data.availability || '',
      companyInfo: data.companyInfo || initialAllyFormData.companyInfo,
      sidebarDescription: data.sidebarDescription || '',
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedProfile(null);
    setFormData(initialAllyFormData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) { // Using formData.name (service name) as required
        toast.error("Ally/Service name is required");
        return;
      }

      const profileDataPayload = {
        name: formData.name, // Main name for the Supabase record
        data: { ...formData }, 
        type: 'ally' as const, 
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

      toast.success(`Ally profile ${selectedProfile ? 'updated' : 'created'} successfully`);
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

    if (deleteConfirm !== profile.name) { // Confirm with profile.name (service name)
      toast.error("Please type the Ally/Service name correctly to confirm deletion");
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('tool_profiles')
        .delete()
        .eq('id', profileToDelete);
      if (deleteError) throw deleteError;

      toast.success("Ally profile deleted successfully");
      setIsDeleting(false);
      setProfileToDelete(null);
      setDeleteConfirm('');
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Generic input change handler for nested objects (like companyInfo, cost, climateTechExperience)
  const handleNestedInputChange = (section: keyof AllyProfileFormData, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: {
            ...(sectionData as object),
            [field]: value,
          },
        };
      }
      // This case should ideally not be hit if used correctly for nested objects
      return { ...prev, [field as keyof AllyProfileFormData]: value }; 
    });
  };
  
  // Handler for direct fields in formData (top-level string, boolean, etc.)
  const handleDirectFormChange = (field: keyof AllyProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for array inputs (comma-separated strings)
  const handleArrayInput = (
    sectionOrField: keyof AllyProfileFormData | 'companyInfo.operatingRegions' | 'climateTechExperience.sectors',
    value: string
  ) => {
    const values = value.split(',').map(v => v.trim()).filter(Boolean);
    
    if (sectionOrField === 'companyInfo.operatingRegions') {
        setFormData(prev => ({
            ...prev,
            companyInfo: { ...prev.companyInfo, operatingRegions: values }
        }));
    } else if (sectionOrField === 'climateTechExperience.sectors') {
        setFormData(prev => ({
            ...prev,
            climateTechExperience: { ...prev.climateTechExperience, sectors: values }
        }));
    } else if (sectionOrField === 'useCases' || sectionOrField === 'clientTypesServed') {
         setFormData(prev => ({ ...prev, [sectionOrField]: values }));
    } 
    // Note: 'certificates' is an array of objects, handled differently (e.g. by add/removeCertificateItem)
  };

  // Helper to render array inputs (for string arrays)
  const renderArrayInput = (
    sectionOrField: keyof AllyProfileFormData | 'companyInfo.operatingRegions' | 'climateTechExperience.sectors',
    label: string,
    placeholder?: string
  ) => {
    let currentValue: string[] = [];
    if (sectionOrField === 'companyInfo.operatingRegions') {
        currentValue = formData.companyInfo.operatingRegions || [];
    } else if (sectionOrField === 'climateTechExperience.sectors') {
        currentValue = formData.climateTechExperience.sectors || [];
    } else if (sectionOrField === 'useCases') {
        currentValue = formData.useCases || [];
    } else if (sectionOrField === 'clientTypesServed') {
        currentValue = formData.clientTypesServed || [];
    }
    
    return (
      <div className="space-y-2">
        <Label>{label} (comma-separated)</Label>
        <Input
          value={currentValue.join(', ')}
          onChange={(e) => handleArrayInput(sectionOrField, e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()} separated by commas`}
          className="bg-white"
        />
      </div>
    );
  };

  // Functions to handle 'certificates' array of objects
  const handleAddCertificate = () => {
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { name: '', image: '', status: '' }]
    }));
  };

  const handleRemoveCertificate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const handleCertificateChange = (index: number, field: keyof AllyCertificate, value: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  // The JSX for DialogContent and Table needs to be updated for AllyProfileFormData
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ally Profiles</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Ally Profile
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
              {selectedProfile ? 'Edit Ally Profile' : 'Create New Ally Profile'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Ally Service Core Information */}
            <div className="space-y-4 bg-sky-50 p-6 rounded-lg border border-sky-100">
              <h3 className="text-lg font-semibold text-gray-900">Core Ally/Service Information</h3>
              <div className="space-y-2">
                <Label htmlFor="allyName">Ally/Service Name*</Label>
                <Input id="allyName" value={formData.name} onChange={(e) => handleDirectFormChange('name', e.target.value)} placeholder="e.g., EcoConsult Pro Services" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceOffered">Service Offered</Label>
                <Input id="serviceOffered" value={formData.serviceOffered} onChange={(e) => handleDirectFormChange('serviceOffered', e.target.value)} placeholder="e.g., Sustainability Strategy" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Primary Operating Region</Label>
                <Input id="region" value={formData.region} onChange={(e) => handleDirectFormChange('region', e.target.value)} placeholder="e.g., Global, North America" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sidebarDescription">Short Card/Sidebar Description</Label>
                <Textarea id="sidebarDescription" value={formData.sidebarDescription || ''} onChange={(e) => handleDirectFormChange('sidebarDescription', e.target.value)} placeholder="Brief summary for cards/previews" className="bg-white"/>
              </div>
            </div>

            {/* Cost & Availability Section */}
            <div className="space-y-4 bg-lime-50 p-6 rounded-lg border border-lime-100">
              <h3 className="text-lg font-semibold text-gray-900">Cost & Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costType">Cost Type</Label>
                  <Input id="costType" value={formData.cost.type} onChange={(e) => handleNestedInputChange('cost', 'type', e.target.value)} placeholder="e.g., Project-Based, Retainer" className="bg-white"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costRange">Cost Range</Label>
                  <Input id="costRange" value={formData.cost.range} onChange={(e) => handleNestedInputChange('cost', 'range', e.target.value)} placeholder="e.g., $5k-$10k, Custom" className="bg-white"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" value={formData.availability} onChange={(e) => handleDirectFormChange('availability', e.target.value)} placeholder="e.g., Available from Q3 2024" className="bg-white"/>
              </div>
            </div>

            {/* Client & Project Focus Section */}
            <div className="space-y-4 bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-900">Client & Project Focus</h3>
              {renderArrayInput('clientTypesServed', 'Client Types Served', 'e.g., Startups, SMEs, Enterprise')}
              {renderArrayInput('useCases', 'Common Use Cases', 'e.g., Carbon tracking, ESG reporting')}
              <div className="space-y-2">
                <Label htmlFor="preferredStageOfInnovators">Preferred Stage of Innovators</Label>
                <Input id="preferredStageOfInnovators" value={formData.preferredStageOfInnovators} onChange={(e) => handleDirectFormChange('preferredStageOfInnovators', e.target.value)} placeholder="e.g., Early-stage, Growth-stage" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="successMetrics">Primary Success Metrics</Label>
                <Textarea id="successMetrics" value={formData.successMetrics} onChange={(e) => handleDirectFormChange('successMetrics', e.target.value)} placeholder="e.g., Client CO2 reduction, ROI achieved" className="bg-white"/>
              </div>
            </div>

            {/* Climate Tech Experience Section */}
            <div className="space-y-4 bg-teal-50 p-6 rounded-lg border border-teal-100">
              <h3 className="text-lg font-semibold text-gray-900">Climate Tech Experience</h3>
              <div className="space-y-2">
                <Label htmlFor="climateTechYears">Years of Experience in Climate Tech</Label>
                <Input id="climateTechYears" type="number" value={formData.climateTechExperience.years || ''} onChange={(e) => handleNestedInputChange('climateTechExperience', 'years', parseInt(e.target.value) || null)} placeholder="e.g., 5" className="bg-white"/>
              </div>
              {renderArrayInput('climateTechExperience.sectors', 'Sectors of Experience', 'e.g., Renewable Energy, Sustainable Ag')}
            </div>

            {/* Ally's Company Information Section */}
            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900">Ally's Company Information</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={formData.companyInfo.name} onChange={(e) => handleNestedInputChange('companyInfo', 'name', e.target.value)} placeholder="Company name of the Ally" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogo">Company Logo URL</Label>
                <Input id="companyLogo" value={formData.companyInfo.logo || ''} onChange={(e) => handleNestedInputChange('companyInfo', 'logo', e.target.value)} placeholder="https://example.com/logo.png" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input id="companyWebsite" value={formData.companyInfo.website || ''} onChange={(e) => handleNestedInputChange('companyInfo', 'website', e.target.value)} placeholder="https://example.com" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLocation">Company Location</Label>
                <Input id="companyLocation" value={formData.companyInfo.location || ''} onChange={(e) => handleNestedInputChange('companyInfo', 'location', e.target.value)} placeholder="City, Country" className="bg-white"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyFoundedYear">Company Founded Year</Label>
                <Input id="companyFoundedYear" type="number" value={formData.companyInfo.foundedYear || ''} onChange={(e) => handleNestedInputChange('companyInfo', 'foundedYear', parseInt(e.target.value) || null)} placeholder="YYYY" className="bg-white"/>
              </div>
              {renderArrayInput('companyInfo.operatingRegions', 'Company Operating Regions', 'e.g., USA, Canada')}
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea id="companyDescription" value={formData.companyInfo.description || ''} onChange={(e) => handleNestedInputChange('companyInfo', 'description', e.target.value)} placeholder="Brief overview of the Ally's company" className="bg-white"/>
              </div>
            </div>

            {/* Certificates Section */}
            <div className="space-y-4 bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Certificates & Credentials</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCertificate}>
                  <Plus className="mr-2 h-4 w-4" /> Add Certificate
                </Button>
              </div>
              {formData.certificates.map((cert, index) => (
                <div key={index} className="p-4 border rounded-md bg-white space-y-3 relative">
                  <Button 
                    type="button" 
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-auto text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveCertificate(index)}>
                      <Trash className="h-4 w-4" />
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor={`certName-${index}`}>Certificate Name</Label>
                    <Input id={`certName-${index}`} value={cert.name} onChange={(e) => handleCertificateChange(index, 'name', e.target.value)} placeholder="e.g., B Corp" className="bg-white"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`certStatus-${index}`}>Status</Label>
                    <Input id={`certStatus-${index}`} value={cert.status} onChange={(e) => handleCertificateChange(index, 'status', e.target.value)} placeholder="e.g., Certified 2022" className="bg-white"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`certImage-${index}`}>Image URL (Optional)</Label>
                    <Input id={`certImage-${index}`} value={cert.image || ''} onChange={(e) => handleCertificateChange(index, 'image', e.target.value)} placeholder="https://example.com/image.png" className="bg-white"/>
                  </div>
                </div>
              ))}
              {formData.certificates.length === 0 && (
                <p className="text-sm text-gray-500">No certificates added yet.</p>
              )}
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
              placeholder="Type the Ally/Service name to confirm"
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
                <TableHead>Ally/Service Name</TableHead>
                <TableHead>Service Offered</TableHead>
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
                  <TableCell>{profile.data.serviceOffered || 'N/A'}</TableCell>
                  <TableCell>{profile.data.region || 'N/A'}</TableCell>
                  <TableCell>
                    <a 
                      href={`/profilepreviews/${profile.id}`} 
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