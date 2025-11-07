'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface FullEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUuid: string;
  onSuccess: () => void;
}

interface FullProfileData {
  // Basic Profile Data
  name: string;
  role: 'buyer' | 'seller' | 'ally';
  status: string;
  email: string;
  
  // Company Info
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  location: string;
  foundedYear: number | null;
  
  // Contact Info
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  phoneCountryCode: string;
  
  // Industries
  industries: string[];
  
  // CRM Data
  assignedTo: string;
  followUpDate: string;
  followUpNotes: string;
  comments: string;
  tags: string[];
  hasWaiver: boolean;
  waiverDuration: string;
  waiverStartDate: string;
  listedOnMarketplace: boolean;
  listedOnMarketplaceDate: string;
}

const INDUSTRIES = [
  'Carbon Management',
  'Renewable Energy',
  'Energy Storage',
  'Water Technology',
  'Waste Management',
  'Sustainable Agriculture',
  'Green Transportation',
  'Climate Analytics',
  'ESG Technology',
  'Circular Economy'
];

const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+31', country: 'Netherlands' },
  { code: '+32', country: 'Belgium' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' }
];

const TEAM_MEMBERS = [
  { name: 'Unassigned', uuid: 'unassigned' },
  { name: 'Maria', uuid: 'e9812b0b-79b6-4ea8-b0b5-58bfef48ec17' },
  { name: 'Maz', uuid: 'dc4b5f6a-62bd-4319-8029-c1f25cb3ce17' },
  { name: 'Ali', uuid: '192fca7b-d3cf-462b-9286-67a36919f75a' },
  { name: 'Delma', uuid: '726a710e-4665-498f-a3ac-ec5007705a93' },
  { name: 'Sam', uuid: '048e73b4-beff-45ed-9285-62e993451e79' }
];

const SUGGESTED_TAGS = [
  'onboarded',
  'pilot',
  'new',
  'prospect',
  'priority',
  'follow-up',
  'demo-scheduled',
  'contract-pending'
];

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FullEditModal: React.FC<FullEditModalProps> = ({ 
  isOpen, 
  onClose, 
  userUuid,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState<FullProfileData>({
    name: '',
    role: 'seller',
    status: 'not_started',
    email: '',
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    location: '',
    foundedYear: null,
    firstName: '',
    lastName: '',
    title: '',
    phone: '',
    phoneCountryCode: '+1',
    industries: [],
    assignedTo: 'unassigned',
    followUpDate: '',
    followUpNotes: '',
    comments: '',
    tags: [],
    hasWaiver: false,
    waiverDuration: '',
    waiverStartDate: '',
    listedOnMarketplace: false,
    listedOnMarketplaceDate: ''
  });
  const [newTag, setNewTag] = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  useEffect(() => {
    if (isOpen && userUuid) {
      fetchUserData();
    }
  }, [isOpen, userUuid]);

  const fetchUserData = async () => {
    try {
      setInitialLoading(true);

      // Fetch main profile data
      const { data: mainProfile, error: mainError } = await supabase
        .from('seller_compound_data')
        .select('*')
        .eq('uuid', userUuid)
        .single();

      if (mainError) throw mainError;

      // Fetch auth user data for email
      const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userUuid);

      // Fetch CRM data
      const { data: crmData, error: crmError } = await supabase
        .from('crm_user_data')
        .select('*')
        .eq('user_uuid', userUuid)
        .single();

      if (crmError && crmError.code !== 'PGRST116') {
        console.error('CRM data error:', crmError);
      }

      // Parse and set profile data
      const data = mainProfile.data || {};
      const detailForm = data.detailForm || {};

      setProfileData({
        name: mainProfile.name || '',
        role: mainProfile.role || 'seller',
        status: mainProfile.status || 'not_started',
        email: user?.email || '',
        companyName: detailForm.companyName || data.companyName || '',
        companyWebsite: detailForm.companyWebsite || data.website || '',
        companyDescription: detailForm.companyDescription || data.description || '',
        location: detailForm.location || data.location || '',
        foundedYear: detailForm.foundedYear || data.foundedYear || null,
        firstName: detailForm.firstName || '',
        lastName: detailForm.lastName || '',
        title: detailForm.title || '',
        phone: detailForm.phone || '',
        phoneCountryCode: detailForm.phoneCountryCode || '+1',
        industries: data.Industries || data.industries || [],
        assignedTo: crmData?.assigned_to || 'unassigned',
        followUpDate: formatDateForInput(crmData?.follow_up_date),
        followUpNotes: crmData?.follow_up_notes || '',
        comments: crmData?.comments || '',
        tags: crmData?.tags || [],
        hasWaiver: crmData?.has_waiver || false,
        waiverDuration: crmData?.waiver_duration || '',
        waiverStartDate: formatDateForInput(crmData?.waiver_start_date),
        listedOnMarketplace: crmData?.listed_on_marketplace || false,
        listedOnMarketplaceDate: formatDateForInput(crmData?.listed_on_marketplace_date)
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load user data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof FullProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !profileData.tags.includes(tag)) {
      setProfileData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setProfileData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddIndustry = (industry: string) => {
    if (industry && !profileData.industries.includes(industry)) {
      setProfileData(prev => ({
        ...prev,
        industries: [...prev.industries, industry]
      }));
    }
    setNewIndustry('');
  };

  const handleRemoveIndustry = (industry: string) => {
    setProfileData(prev => ({
      ...prev,
      industries: prev.industries.filter(i => i !== industry)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      console.log('🔵 Starting save process...');
      console.log('🔵 Company name being saved:', profileData.companyName);

      // Update main profile data
      const mainUpdateData = {
        name: profileData.name,
        role: profileData.role,
        status: profileData.status,
        data: {
          detailForm: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            title: profileData.title,
            phone: profileData.phone,
            phoneCountryCode: profileData.phoneCountryCode,
            companyName: profileData.companyName,
            companyWebsite: profileData.companyWebsite,
            companyDescription: profileData.companyDescription,
            location: profileData.location,
            foundedYear: profileData.foundedYear
          },
          Industries: profileData.industries,
          companyName: profileData.companyName,
          company_name: profileData.companyName,
          website: profileData.companyWebsite,
          companyWebsite: profileData.companyWebsite,
          description: profileData.companyDescription,
          location: profileData.location,
          foundedYear: profileData.foundedYear
        }
      };

      console.log('🔵 Main update data:', mainUpdateData);

      const { error: mainUpdateError } = await supabase
        .from('seller_compound_data')
        .update(mainUpdateData)
        .eq('uuid', userUuid);

      if (mainUpdateError) {
        console.error('❌ Main update error:', mainUpdateError);
        throw mainUpdateError;
      }

      console.log('✅ Main profile data saved successfully');

      // Update/Insert CRM data
      const crmUpdateData = {
        user_uuid: userUuid,
        assigned_to: profileData.assignedTo === 'unassigned' ? null : profileData.assignedTo || null,
        follow_up_date: profileData.followUpDate || null,
        follow_up_notes: profileData.followUpNotes,
        comments: profileData.comments,
        tags: profileData.tags,
        has_waiver: profileData.hasWaiver,
        waiver_duration: profileData.waiverDuration || null, // Fix: convert empty string to null
        waiver_start_date: profileData.waiverStartDate || null,
        listed_on_marketplace: profileData.listedOnMarketplace,
        listed_on_marketplace_date: profileData.listedOnMarketplaceDate || null
      };

      console.log('🔵 CRM update data:', crmUpdateData);

      const { error: crmUpdateError } = await supabase
        .from('crm_user_data')
        .upsert(crmUpdateData, { onConflict: 'user_uuid' });

      if (crmUpdateError) {
        console.error('❌ CRM update error:', crmUpdateError);
        throw crmUpdateError;
      }

      console.log('✅ CRM data saved successfully');

      // Verify the save by reading it back
      const { data: verificationData, error: verifyError } = await supabase
        .from('seller_compound_data')
        .select('data')
        .eq('uuid', userUuid)
        .single();

      if (verifyError) {
        console.error('❌ Verification error:', verifyError);
      } else {
        console.log('🔍 Verification - saved company name:', verificationData?.data?.detailForm?.companyName);
      }

      toast.success('Profile updated successfully!');
      
      // Add a longer delay to ensure database consistency
      setTimeout(() => {
        console.log('🔄 Triggering data refresh...');
        onSuccess();
        onClose();
      }, 1000); // Increased delay from immediate to 1 second

    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <VisuallyHidden>
            <DialogTitle>Loading User Profile</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update complete user profile information including company details, contact info, and CRM data.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="crm">CRM Data</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={profileData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="ally">Ally</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={profileData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Industries</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.industries.map((industry, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveIndustry(industry)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={newIndustry} onValueChange={setNewIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.filter(ind => !profileData.industries.includes(ind)).map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddIndustry(newIndustry)}
                  disabled={!newIndustry}
                >
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={profileData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={profileData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                value={profileData.companyDescription}
                onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={profileData.foundedYear || ''}
                  onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value) || null)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={profileData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select value={profileData.phoneCountryCode} onValueChange={(value) => handleInputChange('phoneCountryCode', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map(({ code, country }) => (
                      <SelectItem key={code} value={code}>
                        {code} ({country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crm" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={profileData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map(member => (
                      <SelectItem key={member.uuid} value={member.uuid}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={profileData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Follow-up Notes</Label>
              <Textarea
                id="followUpNotes"
                value={profileData.followUpNotes}
                onChange={(e) => handleInputChange('followUpNotes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={profileData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={newTag} onValueChange={setNewTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_TAGS.filter(tag => !profileData.tags.includes(tag)).map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddTag(newTag)}
                  disabled={!newTag}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasWaiver"
                    checked={profileData.hasWaiver}
                    onCheckedChange={(checked) => handleInputChange('hasWaiver', checked)}
                  />
                  <Label htmlFor="hasWaiver">Has Waiver</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="listedOnMarketplace"
                    checked={profileData.listedOnMarketplace}
                    onCheckedChange={(checked) => handleInputChange('listedOnMarketplace', checked)}
                  />
                  <Label htmlFor="listedOnMarketplace">Listed on Marketplace</Label>
                </div>
              </div>
            </div>

            {profileData.hasWaiver && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waiverDuration">Waiver Duration (months)</Label>
                  <Input
                    id="waiverDuration"
                    type="number"
                    value={profileData.waiverDuration}
                    onChange={(e) => handleInputChange('waiverDuration', e.target.value)}
                    placeholder="e.g., 3"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="waiverStartDate">Waiver Start Date</Label>
                  <Input
                    id="waiverStartDate"
                    type="date"
                    value={profileData.waiverStartDate}
                    onChange={(e) => handleInputChange('waiverStartDate', e.target.value)}
                  />
                </div>
              </div>
            )}

            {profileData.listedOnMarketplace && (
              <div className="space-y-2">
                <Label htmlFor="listedOnMarketplaceDate">Listed Date</Label>
                <Input
                  id="listedOnMarketplaceDate"
                  type="date"
                  value={profileData.listedOnMarketplaceDate}
                  onChange={(e) => handleInputChange('listedOnMarketplaceDate', e.target.value)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FullEditModal; 