'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Calendar, User, Building, Phone, Edit, ExternalLink, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { capitalize } from '@/lib/utils';
import { 
  fetchAllProfiles, 
  ProfileWithStage, 
  checkContractSignStatus, 
  checkPaymentStatus 
} from '@/lib/utils/admin-management';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import EditCRMModal from './edit-modal';
import CreateUserModal from './create-user-modal';
import FullEditModal from './full-edit-modal';
import DeleteUserModal from './delete-user-modal';

// Custom ScrollableTable wrapper component
const ScrollableTable = ({ children }: { children: React.ReactNode }) => {
  // Reference to the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md border">
      {/* Simple overflow container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto"
      >
        {children}
      </div>
    </div>
  );
};

// Define the extended profile interface with additional CRM fields
interface CRMProfile extends ProfileWithStage {
  // Company data
  companyName?: string;
  website?: string;
  category?: string[];
  
  // POC data
  pocName?: string;
  pocTitle?: string;
  contactNumber?: string;
  
  // Status tracking
  userType?: string;
  leadCreationDate?: string;
  accountCreationDate?: string;
  linkClickedDate?: string;
  
  // Contract status
  signed?: boolean;
  contractSignedDate?: string;
  paid?: boolean;
  paidDate?: string;
  
  // Waiver info
  waiver?: boolean;
  waiverDuration?: string;
  waiverStartDate?: string;
  
  // Follow-up and onboarding
  followUpDate?: string;
  onboardingStartedDate?: string;
  onboardingCompletedDate?: string;
  
  // Marketplace
  listedOnMarketplace?: boolean;
  listedOnMarketplaceDate?: string;
  
  // Additional info
  comments?: string;
  tags?: string[];
  assignedTo?: string;
  assignedToName?: string;
}

// Admin team members mapping for assignments
const ADMIN_TEAM = [
  { name: 'Maria', uuid: 'e9812b0b-79b6-4ea8-b0b5-58bfef48ec17' },
  { name: 'Maz', uuid: 'dc4b5f6a-62bd-4319-8029-c1f25cb3ce17' },
  { name: 'Ali', uuid: '192fca7b-d3cf-462b-9286-67a36919f75a' },
  { name: 'Delma', uuid: '726a710e-4665-498f-a3ac-ec5007705a93' },
  { name: 'Sam', uuid: '048e73b4-beff-45ed-9285-62e993451e79' }
];

const CRMPage = () => {
  const [profiles, setProfiles] = useState<CRMProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [showSellersOnly, setShowSellersOnly] = useState(false);
  const [showUuids, setShowUuids] = useState(false);
  const [signedFilter, setSignedFilter] = useState<string>('all');
  const [paidFilter, setPaidFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tagsFilter, setTagsFilter] = useState<string>('all');
  const [waiverFilter, setWaiverFilter] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<CRMProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserUuid, setCurrentUserUuid] = useState<string | null>(null);
  const [crmData, setCrmData] = useState<Record<string, any>>({});
  const [myAssignments, setMyAssignments] = useState<CRMProfile[]>([]);

  // New CRUD modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    uuid: string;
    name: string;
    email: string;
  } | null>(null);
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);

  // Add a state to track the user being debugged
  const [debugUserUuid, setDebugUserUuid] = useState<string | null>(null);

  useEffect(() => {
    // First fetch the current user, then CRM data, then profiles to ensure proper order of operations
    const initData = async () => {
      try {
        setLoading(true);
        await fetchCurrentUser();
        await fetchCRMData();
        await fetchProfiles();
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []);

  // Helper function to extract company name from profile data
  const getCompanyNameFromProfileData = (profile: ProfileWithStage, debug = false): string => {
    const { data } = profile;
    if (!data) {
      if (debug) console.log('🔍 No data found for profile:', profile.uuid);
      return '';
    }
    
    if (debug) {
      console.log('🔍 Profile data for', profile.uuid, ':', {
        'detailForm.companyName': data.detailForm?.companyName,
        'companyName': data.companyName,
        'company_name': data.company_name,
        'company': data.company
      });
    }
    
    if (data.detailForm?.companyName) {
      if (debug) console.log('✅ Using detailForm.companyName:', data.detailForm.companyName);
      return data.detailForm.companyName;
    }
    if (data.companyName) {
      if (debug) console.log('✅ Using companyName:', data.companyName);
      return data.companyName;
    }
    if (data.company_name) {
      if (debug) console.log('✅ Using company_name:', data.company_name);
      return data.company_name;
    }
    if (data.company) {
      if (debug) console.log('✅ Using company:', data.company);
      return data.company;
    }
    
    if (debug) console.log('❌ No company name found for profile:', profile.uuid);
    return '';
  };

  // Helper function to extract phone number from profile data
  const getPhoneFromProfileData = (profile: ProfileWithStage): string => {
    const { data } = profile;
    if (!data) return '';
    
    if (data.detailForm?.phone) {
      // Return just the phone number without country code
      return data.detailForm.phone || '';
    }
    
    if (data.phone) return data.phone;
    if (data.contactNumber) return data.contactNumber;
    if (data.contactPhone) return data.contactPhone;
    
    return '';
  };

  // Helper function to extract industry/category from profile data
  const getCategoryFromProfileData = (profile: ProfileWithStage): string[] => {
    const { data } = profile;
    if (!data) return [];
    
    // Check primary category fields first
    if (data.Industries && Array.isArray(data.Industries)) {
      return data.Industries;
    }
    
    if (data.category) return [data.category];
    if (data.industry) return [data.industry];
    
    // Check techToolCategory if other fields are empty
    if (data.techToolCategory) {
      return Array.isArray(data.techToolCategory) 
        ? data.techToolCategory 
        : [data.techToolCategory];
    }
    
    // Check nested techToolCategory if exists
    if (data.detailForm?.techToolCategory) {
      return Array.isArray(data.detailForm.techToolCategory) 
        ? data.detailForm.techToolCategory 
        : [data.detailForm.techToolCategory];
    }
    
    return [];
  };

  // Helper function to extract POC name from profile data
  const getPOCNameFromProfileData = (profile: ProfileWithStage): string => {
    const { data } = profile;
    if (!data) return '';
    
    if (data.detailForm?.firstName && data.detailForm?.lastName) {
      return `${data.detailForm.firstName} ${data.detailForm.lastName}`;
    }
    
    if (data.contactName) return data.contactName;
    if (data.pocName) return data.pocName;
    
    return '';
  };

  // Helper function to extract website from profile data
  const getWebsiteFromProfileData = (profile: ProfileWithStage): string => {
    const { data } = profile;
    if (!data) return '';
    
    if (data.detailForm?.companyWebsite) return data.detailForm.companyWebsite;
    if (data.website) return data.website;
    if (data.companyWebsite) return data.companyWebsite;
    
    return '';
  };

  // Helper function to extract title/position from profile data
  const getTitleFromProfileData = (profile: ProfileWithStage): string => {
    const { data } = profile;
    if (!data) return '';
    
    if (data.detailForm?.title) return data.detailForm.title;
    if (data.title) return data.title;
    if (data.position) return data.position;
    
    return '';
  };

  const fetchProfiles = async (existingCrmData?: Record<string, any>) => {
    try {
      setLoading(true);
      const profilesData = await fetchAllProfiles();
      
      // Filter out admin users, test emails, and noharm.tech emails
      const filteredProfilesData = profilesData.filter(profile => 
        profile.role !== 'admin' && 
        !(profile.email && profile.email.toLowerCase().startsWith('test')) &&
        !(profile.email && profile.email.toLowerCase().endsWith('@noharm.tech'))
      );
      
      // Gather all UUIDs to fetch progress data in a single batch
      const uuids = filteredProfilesData.map(profile => profile.uuid);
      
      // Fetch onboarding progress data for all profiles at once
      const { data: progressData, error: progressError } = await supabase
        .from('user_onboarding_progress')
        .select('uuid, stage_id, status, last_updated_at')
        .in('uuid', uuids);
      
      if (progressError) {
        console.error('Error fetching progress data:', progressError);
        // Continue with default values if there's an error
      }
      
      // Create a mapping of uuid to stages
      const progressMap = new Map();
      
      // Initialize progress map for each user
      uuids.forEach(uuid => {
        progressMap.set(uuid, {
          signed: false,
          paid: false,
          onboardingStartedDate: null,
          onboardingCompletedDate: null
        });
      });
      
      // Process progress data if available
      if (progressData) {
        progressData.forEach(record => {
          const userProgress = progressMap.get(record.uuid) || { 
            signed: false, 
            paid: false,
            onboardingStartedDate: null,
            onboardingCompletedDate: null
          };
          
          // Check contract status (stage_id = 2) independently
          if (record.stage_id === 2 && record.status === 'completed') {
            userProgress.signed = true;
          }
          
          // Check payment status (stage_id = 3) independently
          if (record.stage_id === 3 && record.status === 'completed') {
            userProgress.paid = true;
            // Set onboarding completed date when stage 3 is completed
            userProgress.onboardingCompletedDate = record.last_updated_at;
          }
          
          // Set onboarding started date when we have the first stage (KYC/Initial onboarding)
          if (record.stage_id === 1) {
            userProgress.onboardingStartedDate = record.last_updated_at;
          }
          
          progressMap.set(record.uuid, userProgress);
        });
      }
      
      // Map profiles with progress data
      const transformedProfiles: CRMProfile[] = filteredProfilesData.map(profile => {
        const progress = progressMap.get(profile.uuid) || { 
          signed: false, 
          paid: false,
          onboardingStartedDate: null,
          onboardingCompletedDate: null
        };
        
        const isDebugging = profile.uuid === debugUserUuid;
        if (isDebugging) {
          console.log('🔍 Processing profile for debugging:', profile.uuid);
        }
        
        return {
          ...profile,
          companyName: getCompanyNameFromProfileData(profile, isDebugging),
          website: getWebsiteFromProfileData(profile),
          category: getCategoryFromProfileData(profile),
          pocName: getPOCNameFromProfileData(profile),
          pocTitle: getTitleFromProfileData(profile),
          contactNumber: getPhoneFromProfileData(profile),
          userType: profile.role || '',
          leadCreationDate: profile.created_at || '',
          accountCreationDate: profile.created_at || '',
          signed: progress.signed,
          paid: progress.paid,
          onboardingStartedDate: progress.onboardingStartedDate,
          onboardingCompletedDate: progress.onboardingCompletedDate,
          assignedTo: '',
          assignedToName: 'Unassigned'
          // Other fields would come from actual database in real implementation
        };
      });
      
      // Use the provided crmData if available, otherwise use the state
      const crmDataToUse = existingCrmData || crmData;
      
      // After setting base profile data, update with CRM data if available
      const profilesWithCRM = transformedProfiles.map(profile => {
        const profileCRMData = crmDataToUse[profile.uuid];
        console.log(`Processing profile ${profile.uuid}:`, profile.pocName || profile.email);
        
        // Debug onboarding dates from progress data
        console.log(`Onboarding dates from progress data for ${profile.uuid}:`, {
          startDate: profile.onboardingStartedDate,
          completedDate: profile.onboardingCompletedDate
        });
        
        if (profileCRMData) {
          console.log(`Found CRM data for profile ${profile.uuid}:`, profileCRMData);
          
          // Check both assigned_to and assigned_to_name fields (for migration period)
          let assignedTo = undefined; // Default to undefined for proper SQL handling
          
          // Only use valid, non-empty strings for assignment
          if (profileCRMData.assigned_to && profileCRMData.assigned_to.trim() !== '') {
            assignedTo = profileCRMData.assigned_to;
            console.log(`Using assigned_to: ${assignedTo}`);
          } else if (profileCRMData.assigned_to_name && profileCRMData.assigned_to_name.trim() !== '') {
            // Try to find UUID for the name during migration period
            const admin = ADMIN_TEAM.find(a => a.name === profileCRMData.assigned_to_name);
            if (admin && admin.uuid) {
              assignedTo = admin.uuid;
              console.log(`Mapped assigned_to_name ${profileCRMData.assigned_to_name} to UUID ${assignedTo}`);
            }
          }
          
          const assignedToName = getAdminNameByUuid(assignedTo);
          
          console.log(`Final assignment: UUID=${assignedTo || 'undefined'}, Name=${assignedToName}`);
          
          // Create return object with preserved onboarding dates
          const returnObject = {
            ...profile,
            assignedTo: assignedTo,
            assignedToName: assignedToName,
            followUpDate: profileCRMData.follow_up_date,
            // Don't override onboarding dates from progress data
            // onboardingStartedDate: profileCRMData.onboarding_started_date, 
            // onboardingCompletedDate: profileCRMData.onboarding_completed_date,
            listedOnMarketplace: profileCRMData.listed_on_marketplace || false,
            listedOnMarketplaceDate: profileCRMData.listed_on_marketplace_date,
            comments: profileCRMData.comments,
            tags: profileCRMData.tags,
            waiver: profileCRMData.has_waiver,
            waiverDuration: profileCRMData.waiver_duration,
            waiverStartDate: profileCRMData.waiver_start_date
          };
          
          // Log final onboarding dates for debugging
          console.log(`Final onboarding dates for ${profile.uuid}:`, {
            startDate: returnObject.onboardingStartedDate,
            completedDate: returnObject.onboardingCompletedDate
          });
          
          return returnObject;
        } else {
          console.log(`No CRM data found for profile ${profile.uuid}`);
        }
        return profile;
      });
      
      // Sort profiles by creation date (newest first)
      const sortedProfiles = profilesWithCRM.sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setProfiles(sortedProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    // Search across multiple fields
    const searchFields = [
      profile.companyName,
      profile.pocName,
      profile.email,
      profile.contactNumber,
      // Convert category array to string for search purposes
      Array.isArray(profile.category) ? profile.category.join(', ') : profile.category,
      profile.assignedTo
    ].filter(Boolean).map(field => field?.toLowerCase());
    
    const matchesSearch = searchTerm === '' || 
      searchFields.some(field => field?.includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || profile.current_stage?.status === statusFilter;
    const matchesStage = stageFilter === 'all' || profile.current_stage?.stage_name === stageFilter;
    const matchesAssignedTo = assignedToFilter === 'all' || profile.assignedTo === assignedToFilter;
    const matchesSellersToggle = !showSellersOnly || profile.role === 'seller';
    
    // Existing filters
    const matchesSigned = signedFilter === 'all' || 
      (signedFilter === 'yes' && profile.signed) || 
      (signedFilter === 'no' && !profile.signed);
    
    const matchesPaid = paidFilter === 'all' || 
      (paidFilter === 'yes' && profile.paid) || 
      (paidFilter === 'no' && !profile.paid);
    
    const matchesCategory = categoryFilter === 'all' || 
      (Array.isArray(profile.category) && profile.category.includes(categoryFilter));
    
    // New filters
    const matchesTags = tagsFilter === 'all' || 
      (Array.isArray(profile.tags) && profile.tags.includes(tagsFilter));
    
    const matchesWaiver = waiverFilter === 'all' || 
      (waiverFilter === 'yes' && profile.waiver) || 
      (waiverFilter === 'no' && !profile.waiver) ||
      // Match specific waiver durations if the duration is a number
      (profile.waiver && profile.waiverDuration && /^\d+$/.test(waiverFilter) && 
        parseInt(profile.waiverDuration) === parseInt(waiverFilter));

    return matchesSearch && matchesRole && matchesStatus && matchesStage && 
           matchesAssignedTo && matchesSellersToggle && matchesSigned && 
           matchesPaid && matchesCategory && matchesTags && matchesWaiver;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const getStageBadgeColor = (stageName: string) => {
    const colors = {
      kyc: 'bg-fuchsia-100 text-fuchsia-800',
      contract_sign: 'bg-lime-100 text-lime-800',
      awaiting_payment: 'bg-purple-100 text-purple-800',
      tool_questionaire: 'bg-orange-100 text-orange-800',
      document_input: 'bg-sky-100 text-sky-800'
    };
    return colors[stageName?.toLowerCase() as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const formatStageName = (stageName: string): string => {
    if (!stageName) return 'Not Started';
    if (stageName.toLowerCase() === 'kyc') {
      return 'Initial Onboarding';
    }
    return stageName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const uniqueRoles = Array.from(new Set(profiles.map(p => p.role))).filter(Boolean).sort();
  const statusOptions = ['not_started', 'in_progress', 'in_review', 'completed'];
  const stageOptions = Array.from(new Set(profiles.map(p => p.current_stage?.stage_name))).filter(Boolean).sort();
  const assignedToOptions = Array.from(new Set(profiles.map(p => p.assignedTo)))
    .filter((value): value is string => Boolean(value && value.trim() !== ''))
    .sort();
  
  const exportToCSV = () => {
    if (filteredProfiles.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Prepare CSV content
    const headers = [
      'Company Name', 'POC Name', 'Email', 'Phone', 'Category', 
      'User Type', 'Status', 'Onboarding Stage', 'Lead Creation Date',
      'Account Creation Date', 'Signed', 'Paid', 'Follow Up Date',
      'Onboarding Started', 'Onboarding Completed', 'Assigned To'
    ];
    
    const rows = filteredProfiles.map(profile => [
      profile.companyName || '',
      profile.pocName || '',
      profile.email || '',
      profile.contactNumber || '',
      Array.isArray(profile.category) ? profile.category.join(', ') : '',
      profile.userType || '',
      profile.current_stage?.status ? capitalize(profile.current_stage.status.replace('_', ' ')) : 'Not Started',
      profile.current_stage ? formatStageName(profile.current_stage.stage_name) : 'Not Started',
      formatDate(profile.leadCreationDate),
      formatDate(profile.accountCreationDate),
      profile.signed ? 'Yes' : 'No',
      profile.paid ? 'Yes' : 'No',
      formatDate(profile.followUpDate),
      formatDate(profile.onboardingStartedDate),
      formatDate(profile.onboardingCompletedDate),
      profile.assignedToName || 'Unassigned'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crm-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to render categories as badges
  const renderCategoryBadges = (categories: string[] | undefined) => {
    if (!categories || categories.length === 0) return <span>N/A</span>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {categories.map((category, index) => {
          // Extract emoji if present (common pattern: "Category 🔑")
          const match = category.match(/(.*?)(\s+[^\w\s])?$/);
          const text = match ? match[1].trim() : category;
          const emoji = match && match[2] ? match[2].trim() : '';
          
          return (
            <Badge key={index} variant="outline" className="bg-blue-50">
              {emoji && <span className="mr-1">{emoji}</span>}
              {text}
            </Badge>
          );
        })}
      </div>
    );
  };

  // Add a helper function to get badge variant based on status
  const getStatusBadgeVariant = (isComplete: boolean | undefined) => {
    return isComplete ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800";
  };

  // Add a function to copy UUID to clipboard
  const copyUuidToClipboard = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
      .then(() => {
        toast.success('UUID copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy UUID:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to copy UUID');
      });
  };

  // Add helper function to determine row highlight class
  const getRowHighlightClass = (profile: CRMProfile) => {
    if (profile.signed && profile.paid) {
      return "bg-green-50 hover:bg-green-100";
    }
    return "";
  };

  // Function to handle opening the edit modal
  const handleEditClick = (profile: CRMProfile) => {
    setSelectedProfile(profile);
    setIsEditModalOpen(true);
  };

  // Function to refresh data after edit
  const handleEditComplete = async () => {
    console.log("Refreshing data after edit");
    try {
      setLoading(true);
      // Clear existing data first
      setCrmData({});
      
      // Fetch CRM data first, then profiles to ensure proper data flow
      const freshCrmData = await fetchCRMData();
      
      // Wait a moment to ensure database consistency
      setTimeout(async () => {
        await fetchProfiles(freshCrmData);
        await refreshMyAssignments();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setLoading(false);
    }
  };

  // Get the current user's UUID
  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      
      if (user) {
        console.log("Current user:", user);
        setCurrentUserUuid(user.id);
      } else {
        console.log("No authenticated user found");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch CRM data for all users
  const fetchCRMData = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_user_data')
        .select('*');
        
      if (error) {
        console.error("Error fetching CRM data:", error);
        return;
      }
      
      console.log("Raw CRM data from database:", data);
      
      // Check if any CRM data includes onboarding dates
      const hasOnboardingDates = data.some(item => 
        item.onboarding_started_date || item.onboarding_completed_date
      );
      
      console.log("CRM data contains onboarding dates:", hasOnboardingDates);
      if (hasOnboardingDates) {
        console.log("Example records with onboarding dates:", 
          data.filter(item => item.onboarding_started_date || item.onboarding_completed_date).slice(0, 3)
        );
      }
      
      // Convert array to object with user_uuid as key for easier lookup
      const crmDataMap: Record<string, any> = {};
      data.forEach(item => {
        crmDataMap[item.user_uuid] = item;
      });
      
      console.log("Processed CRM data map:", crmDataMap);
      setCrmData(crmDataMap);
      return crmDataMap;
    } catch (error) {
      console.error("Error in fetchCRMData:", error);
      return {};
    }
  };

  // Helper to get admin name from UUID
  const getAdminNameByUuid = (uuid: string | null | undefined): string => {
    if (!uuid) return 'Unassigned';
    const admin = ADMIN_TEAM.find(admin => admin.uuid === uuid);
    return admin ? admin.name : 'Unassigned';
  };

  // Add a specific function to get my assignments directly from the database
  const fetchMyAssignments = async () => {
    if (!currentUserUuid) {
      console.log("Cannot fetch assignments: No current user UUID");
      return [];
    }
    
    console.log(`Fetching assignments for user ${currentUserUuid}`);
    
    try {
      // Direct database query for assignments
      const { data, error } = await supabase
        .from('crm_user_data')
        .select('user_uuid')
        .eq('assigned_to', currentUserUuid);
      
      if (error) {
        console.error("Error fetching assignments:", error);
        return [];
      }
      
      console.log(`Found ${data.length} direct assignments:`, data);
      
      // Get the UUIDs of assigned profiles
      const assignedUuids = data.map(item => item.user_uuid);
      
      // Filter the profiles based on these UUIDs
      const myDirectAssignments = filteredProfiles.filter(profile => 
        assignedUuids.includes(profile.uuid)
      );
      
      console.log(`Matched ${myDirectAssignments.length} profiles to assignments`);
      return myDirectAssignments;
    } catch (error) {
      console.error("Error in fetchMyAssignments:", error);
      return [];
    }
  };

  // Function to refresh My Assignments view
  const refreshMyAssignments = async () => {
    if (!currentUserUuid) return;
    
    console.log("Refreshing My Assignments");
    const assignments = await fetchMyAssignments();
    setMyAssignments(assignments);
  };

  // Call refreshMyAssignments whenever the tab changes to "myassignments"
  const handleTabChange = async (value: string) => {
    if (value === "myassignments") {
      await refreshMyAssignments();
    }
  };

  // New CRUD handlers
  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = async () => {
    await fetchCRMData();
    await fetchProfiles();
    await refreshMyAssignments();
  };

  const handleFullEditClick = (profile: CRMProfile) => {
    console.log('🔵 Opening full edit for user:', profile.uuid);
    setDebugUserUuid(profile.uuid); // Enable debug logging for this user
    setSelectedUserUuid(profile.uuid);
    setIsFullEditModalOpen(true);
  };

  const handleFullEditSuccess = async () => {
    console.log('🔄 Starting full edit success refresh...');
    
    try {
      console.log('🔄 Fetching CRM data...');
      await fetchCRMData();
      
      console.log('🔄 Fetching profiles...');
      await fetchProfiles();
      
      console.log('🔄 Refreshing my assignments...');
      await refreshMyAssignments();
      
      console.log('✅ Full refresh completed successfully');
      
      // Clear debug user after refresh
      setTimeout(() => setDebugUserUuid(null), 5000);
    } catch (error) {
      console.error('❌ Error during refresh:', error);
    }
  };

  const handleDeleteClick = (profile: CRMProfile) => {
    setUserToDelete({
      uuid: profile.uuid,
      name: profile.pocName || profile.companyName || profile.email || 'Unknown User',
      email: profile.email || 'No email'
    });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = async () => {
    await fetchCRMData();
    await fetchProfiles();
    await refreshMyAssignments();
    setUserToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleCloseFullEditModal = () => {
    setIsFullEditModalOpen(false);
    setSelectedUserUuid(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage and track client relationships</p>
          </div>
          <Button 
            onClick={handleCreateUser}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Search and filter bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies, contacts, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {capitalize(role || '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stageOptions.map(stage => (
                      <SelectItem key={stage} value={stage || ''}>
                        <span className="truncate">
                          {formatStageName(stage || '')}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {capitalize(status.replace('_', ' '))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Assigned to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {assignedToOptions.map(person => (
                      <SelectItem key={person} value={person}>
                        {getAdminNameByUuid(person) || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* New filters */}
                <Select value={signedFilter} onValueChange={setSignedFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Contract signed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Signed?</SelectItem>
                    <SelectItem value="yes">Signed</SelectItem>
                    <SelectItem value="no">Not Signed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paidFilter} onValueChange={setPaidFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Paid?</SelectItem>
                    <SelectItem value="yes">Paid</SelectItem>
                    <SelectItem value="no">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Extract unique categories from all profiles */}
                    {Array.from(new Set(
                      profiles.flatMap(p => Array.isArray(p.category) ? p.category : [])
                    )).filter(Boolean).sort().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={tagsFilter} onValueChange={setTagsFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {/* Extract unique tags from all profiles */}
                    {Array.from(new Set(
                      profiles.flatMap(p => Array.isArray(p.tags) ? p.tags : [])
                    )).filter(Boolean).sort().map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={waiverFilter} onValueChange={setWaiverFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Waiver status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Waiver Status</SelectItem>
                    <SelectItem value="yes">Has Waiver</SelectItem>
                    <SelectItem value="no">No Waiver</SelectItem>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show active filters */}
        {(roleFilter !== 'all' || statusFilter !== 'all' || stageFilter !== 'all' || assignedToFilter !== 'all' || 
          signedFilter !== 'all' || paidFilter !== 'all' || categoryFilter !== 'all' || tagsFilter !== 'all' || 
          waiverFilter !== 'all' || showSellersOnly) && (
          <div className="bg-white rounded-md p-3 shadow-sm border flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500 mr-2">Active filters:</span>
            {roleFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Role: {capitalize(roleFilter)}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setRoleFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {capitalize(statusFilter.replace('_', ' '))}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setStatusFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {stageFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Stage: {formatStageName(stageFilter)}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setStageFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {assignedToFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Assigned: {getAdminNameByUuid(assignedToFilter) || 'Unassigned'}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setAssignedToFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {signedFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Signed: {signedFilter === 'yes' ? 'Yes' : 'No'}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setSignedFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {paidFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Paid: {paidFilter === 'yes' ? 'Yes' : 'No'}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setPaidFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categoryFilter}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setCategoryFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {tagsFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tag: {tagsFilter}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setTagsFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {waiverFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Waiver: {waiverFilter === 'yes' ? 'Yes' : 
                        waiverFilter === 'no' ? 'No' : 
                        `${waiverFilter} month${waiverFilter === '1' ? '' : 's'}`}
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setWaiverFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {showSellersOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sellers Only
                <button
                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                  onClick={() => setShowSellersOnly(false)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button 
              className="ml-auto text-xs h-7 bg-outline text-sm" 
              onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
                setStageFilter('all');
                setAssignedToFilter('all');
                setSignedFilter('all');
                setPaidFilter('all');
                setCategoryFilter('all');
                setTagsFilter('all');
                setWaiverFilter('all');
                setShowSellersOnly(false);
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs defaultValue="main" className="space-y-4" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center sticky top-0 z-20 bg-white py-3 px-4 shadow-md rounded-lg border border-gray-200">
            <TabsList className="grid grid-cols-5 sm:max-w-[800px]">
              <TabsTrigger value="main" className="border-b-2 border-blue-500 data-[state=active]:border-b-4 data-[state=active]:text-blue-700 rounded-none">Main View</TabsTrigger>
              <TabsTrigger value="quick1" className="border-b-2 border-green-500 data-[state=active]:border-b-4 data-[state=active]:text-green-700 rounded-none">Status Overview</TabsTrigger>
              <TabsTrigger value="quick2" className="border-b-2 border-purple-500 data-[state=active]:border-b-4 data-[state=active]:text-purple-700 rounded-none">Onboarding Progress</TabsTrigger>
              <TabsTrigger value="quick3" className="border-b-2 border-amber-500 data-[state=active]:border-b-4 data-[state=active]:text-amber-700 rounded-none">Contact Details</TabsTrigger>
              <TabsTrigger value="myassignments" className="border-b-2 border-pink-500 data-[state=active]:border-b-4 data-[state=active]:text-pink-700 rounded-none">My Assignments</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="seller-toggle" 
                  checked={showSellersOnly} 
                  onCheckedChange={setShowSellersOnly}
                />
                <label 
                  htmlFor="seller-toggle" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Sellers Only
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="uuid-toggle" 
                  checked={showUuids} 
                  onCheckedChange={setShowUuids}
                />
                <label 
                  htmlFor="uuid-toggle" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Show UUIDs
                </label>
              </div>
            </div>
          </div>

          {/* Main View - All Fields */}
          <TabsContent value="main" className="space-y-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="border-b border-blue-100">
                <CardTitle>Complete Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Actions</TableHead>
                        {showUuids && <TableHead className="w-10">UUID</TableHead>}
                        <TableHead>Company</TableHead>
                        <TableHead>POC</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Lead Creation</TableHead>
                        <TableHead>Account Creation</TableHead>
                        <TableHead>Signed</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Onboarding Started</TableHead>
                        <TableHead>Onboarding Completed</TableHead>
                        <TableHead>Listed</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Waiver</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                          <TableRow 
                            key={profile.uuid}
                            className={getRowHighlightClass(profile)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleEditClick(profile)}
                                  title="Quick Edit CRM"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleFullEditClick(profile)}
                                  title="Full Edit Profile"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteClick(profile)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => window.open(`/admin/profile/${profile.uuid}`, '_blank')}
                                  title="View Profile"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                            {showUuids && (
                              <TableCell>
                                <button 
                                  className="bg-ghost text-sm py-0 px-1 rounded-md" 
                                  onClick={() => copyUuidToClipboard(profile.uuid)}
                                >
                                  {profile.uuid.substring(0, 8)}...
                                </button>
                              </TableCell>
                            )}
                            <TableCell className="font-medium">{profile.companyName || 'N/A'}</TableCell>
                            <TableCell>{profile.pocName || 'N/A'}</TableCell>
                            <TableCell>{profile.website || 'N/A'}</TableCell>
                            <TableCell>{profile.email || 'N/A'}</TableCell>
                            <TableCell>{profile.contactNumber || 'N/A'}</TableCell>
                            <TableCell>{renderCategoryBadges(profile.category)}</TableCell>
                            <TableCell>{capitalize(profile.userType || '')}</TableCell>
                            <TableCell>
                              {profile.current_stage?.status ? (
                                <Badge className={getStatusColor(profile.current_stage.status)}>
                                  {capitalize(profile.current_stage.status.replace('_', ' '))}
                                </Badge>
                              ) : (
                                'Not Started'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.current_stage?.stage_name ? (
                                <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                                  {formatStageName(profile.current_stage.stage_name)}
                                </Badge>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>{formatDate(profile.leadCreationDate)}</TableCell>
                            <TableCell>{formatDate(profile.accountCreationDate)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeVariant(profile.signed)}
                              >
                                {profile.signed ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={getStatusBadgeVariant(profile.paid)}
                              >
                                {profile.paid ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(profile.followUpDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingStartedDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingCompletedDate)}</TableCell>
                            <TableCell>
                              <Badge variant={profile.listedOnMarketplace ? "outline" : "secondary"}>
                                {profile.listedOnMarketplace ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {Array.isArray(profile.tags) && profile.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {profile.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="bg-purple-50">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.waiver ? (
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="bg-amber-50 mb-1">
                                    {profile.waiverDuration ? `${profile.waiverDuration} month(s)` : 'Active'}
                                  </Badge>
                                  {profile.waiverStartDate && (
                                    <span className="text-xs text-gray-500">
                                      From: {formatDate(profile.waiverStartDate)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                'No'
                              )}
                            </TableCell>
                            <TableCell>{profile.assignedToName || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={showUuids ? 22 : 21} className="text-center py-6 text-gray-500">
                            No matching profiles found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollableTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick View 1 */}
          <TabsContent value="quick1" className="space-y-4">
            <Card className="border-2 border-green-200">
              <CardHeader className="border-b border-green-100">
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Actions</TableHead>
                        {showUuids && <TableHead className="w-10">UUID</TableHead>}
                        <TableHead>Company Name</TableHead>
                        <TableHead>POC Name</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Signed</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                          <TableRow 
                            key={profile.uuid}
                            className={getRowHighlightClass(profile)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleEditClick(profile)}
                                  title="Quick Edit CRM"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleFullEditClick(profile)}
                                  title="Full Edit Profile"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteClick(profile)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => window.open(`/admin/profile/${profile.uuid}`, '_blank')}
                                  title="View Profile"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                            {showUuids && (
                              <TableCell>
                                <button 
                                  className="bg-ghost text-sm py-0 px-1 rounded-md" 
                                  onClick={() => copyUuidToClipboard(profile.uuid)}
                                >
                                  {profile.uuid.substring(0, 8)}...
                                </button>
                              </TableCell>
                            )}
                            <TableCell className="font-medium">{profile.companyName || 'N/A'}</TableCell>
                            <TableCell>{profile.pocName || profile.email || 'N/A'}</TableCell>
                            <TableCell>{capitalize(profile.userType || '')}</TableCell>
                            <TableCell>
                              {profile.current_stage?.stage_name ? (
                                <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                                  {formatStageName(profile.current_stage.stage_name)}
                                </Badge>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.current_stage?.status ? (
                                <Badge className={getStatusColor(profile.current_stage.status)}>
                                  {capitalize(profile.current_stage.status.replace('_', ' '))}
                                </Badge>
                              ) : (
                                'Not Started'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeVariant(profile.signed)}
                              >
                                {profile.signed ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={getStatusBadgeVariant(profile.paid)}
                              >
                                {profile.paid ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>{profile.assignedToName || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                            No matching profiles found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollableTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick View 2 */}
          <TabsContent value="quick2" className="space-y-4">
            <Card className="border-2 border-purple-200">
              <CardHeader className="border-b border-purple-100">
                <CardTitle>Onboarding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Actions</TableHead>
                        {showUuids && <TableHead className="w-10">UUID</TableHead>}
                        <TableHead>Company Name</TableHead>
                        <TableHead>POC Name</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Lead Created</TableHead>
                        <TableHead>Account Created</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Onboarding Started</TableHead>
                        <TableHead>Onboarding Completed</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                          <TableRow 
                            key={profile.uuid}
                            className={getRowHighlightClass(profile)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleEditClick(profile)}
                                  title="Quick Edit CRM"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleFullEditClick(profile)}
                                  title="Full Edit Profile"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteClick(profile)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => window.open(`/admin/profile/${profile.uuid}`, '_blank')}
                                  title="View Profile"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                            {showUuids && (
                              <TableCell>
                                <button 
                                  className="bg-ghost text-sm py-0 px-1 rounded-md" 
                                  onClick={() => copyUuidToClipboard(profile.uuid)}
                                >
                                  {profile.uuid.substring(0, 8)}...
                                </button>
                              </TableCell>
                            )}
                            <TableCell className="font-medium">{profile.companyName || 'N/A'}</TableCell>
                            <TableCell>{profile.pocName || 'N/A'}</TableCell>
                            <TableCell>{capitalize(profile.userType || '')}</TableCell>
                            <TableCell>
                              {profile.current_stage?.status ? (
                                <Badge className={getStatusColor(profile.current_stage.status)}>
                                  {capitalize(profile.current_stage.status.replace('_', ' '))}
                                </Badge>
                              ) : (
                                'Not Started'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.current_stage?.stage_name ? (
                                <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                                  {formatStageName(profile.current_stage.stage_name)}
                                </Badge>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>{formatDate(profile.leadCreationDate)}</TableCell>
                            <TableCell>{formatDate(profile.accountCreationDate)}</TableCell>
                            <TableCell>{formatDate(profile.followUpDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingStartedDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingCompletedDate)}</TableCell>
                            <TableCell>{profile.assignedToName || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-6 text-gray-500">
                            No matching profiles found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollableTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick View 3 */}
          <TabsContent value="quick3" className="space-y-4">
            <Card className="border-2 border-amber-200">
              <CardHeader className="border-b border-amber-100">
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Actions</TableHead>
                        {showUuids && <TableHead className="w-10">UUID</TableHead>}
                        <TableHead>Company Name</TableHead>
                        <TableHead>POC Name</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Lead Created</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Onboarding Started</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                          <TableRow 
                            key={profile.uuid}
                            className={getRowHighlightClass(profile)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleEditClick(profile)}
                                  title="Quick Edit CRM"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleFullEditClick(profile)}
                                  title="Full Edit Profile"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteClick(profile)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => window.open(`/admin/profile/${profile.uuid}`, '_blank')}
                                  title="View Profile"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                            {showUuids && (
                              <TableCell>
                                <button 
                                  className="bg-ghost text-sm py-0 px-1 rounded-md" 
                                  onClick={() => copyUuidToClipboard(profile.uuid)}
                                >
                                  {profile.uuid.substring(0, 8)}...
                                </button>
                              </TableCell>
                            )}
                            <TableCell className="font-medium">{profile.companyName || 'N/A'}</TableCell>
                            <TableCell>{profile.pocName || 'N/A'}</TableCell>
                            <TableCell>{capitalize(profile.userType || '')}</TableCell>
                            <TableCell>{profile.email || 'N/A'}</TableCell>
                            <TableCell>{profile.contactNumber || 'N/A'}</TableCell>
                            <TableCell>
                              {profile.current_stage?.status ? (
                                <Badge className={getStatusColor(profile.current_stage.status)}>
                                  {capitalize(profile.current_stage.status.replace('_', ' '))}
                                </Badge>
                              ) : (
                                'Not Started'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.current_stage?.stage_name ? (
                                <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                                  {formatStageName(profile.current_stage.stage_name)}
                                </Badge>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>{formatDate(profile.leadCreationDate)}</TableCell>
                            <TableCell>{formatDate(profile.followUpDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingStartedDate)}</TableCell>
                            <TableCell>{profile.assignedToName || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-6 text-gray-500">
                            No matching profiles found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollableTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Assignments Tab */}
          <TabsContent value="myassignments" className="space-y-4">
            <Card className="border-2 border-pink-200">
              <CardHeader className="border-b border-pink-100">
                <CardTitle>My Assigned Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Actions</TableHead>
                        {showUuids && <TableHead className="w-10">UUID</TableHead>}
                        <TableHead>Company</TableHead>
                        <TableHead>POC</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Lead Creation</TableHead>
                        <TableHead>Account Creation</TableHead>
                        <TableHead>Signed</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Onboarding Started</TableHead>
                        <TableHead>Onboarding Completed</TableHead>
                        <TableHead>Listed</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Waiver</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myAssignments.length > 0 ? (
                        myAssignments.map((profile) => (
                          <TableRow 
                            key={profile.uuid}
                            className={getRowHighlightClass(profile)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleEditClick(profile)}
                                  title="Quick Edit CRM"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => handleFullEditClick(profile)}
                                  title="Full Edit Profile"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteClick(profile)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-ghost text-sm py-0 px-1 rounded-md"
                                  onClick={() => window.open(`/admin/profile/${profile.uuid}`, '_blank')}
                                  title="View Profile"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                            {showUuids && (
                              <TableCell>
                                <button 
                                  className="bg-ghost text-sm py-0 px-1 rounded-md" 
                                  onClick={() => copyUuidToClipboard(profile.uuid)}
                                >
                                  {profile.uuid.substring(0, 8)}...
                                </button>
                              </TableCell>
                            )}
                            <TableCell className="font-medium">{profile.companyName || 'N/A'}</TableCell>
                            <TableCell>{profile.pocName || 'N/A'}</TableCell>
                            <TableCell>{profile.website || 'N/A'}</TableCell>
                            <TableCell>{profile.email || 'N/A'}</TableCell>
                            <TableCell>{profile.contactNumber || 'N/A'}</TableCell>
                            <TableCell>{renderCategoryBadges(profile.category)}</TableCell>
                            <TableCell>{capitalize(profile.userType || '')}</TableCell>
                            <TableCell>
                              {profile.current_stage?.status ? (
                                <Badge className={getStatusColor(profile.current_stage.status)}>
                                  {capitalize(profile.current_stage.status.replace('_', ' '))}
                                </Badge>
                              ) : (
                                'Not Started'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.current_stage?.stage_name ? (
                                <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                                  {formatStageName(profile.current_stage.stage_name)}
                                </Badge>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>{formatDate(profile.leadCreationDate)}</TableCell>
                            <TableCell>{formatDate(profile.accountCreationDate)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeVariant(profile.signed)}
                              >
                                {profile.signed ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={getStatusBadgeVariant(profile.paid)}
                              >
                                {profile.paid ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(profile.followUpDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingStartedDate)}</TableCell>
                            <TableCell>{formatDate(profile.onboardingCompletedDate)}</TableCell>
                            <TableCell>
                              <Badge variant={profile.listedOnMarketplace ? "outline" : "secondary"}>
                                {profile.listedOnMarketplace ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {Array.isArray(profile.tags) && profile.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {profile.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="bg-purple-50">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.waiver ? (
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="bg-amber-50 mb-1">
                                    {profile.waiverDuration ? `${profile.waiverDuration} month(s)` : 'Active'}
                                  </Badge>
                                  {profile.waiverStartDate && (
                                    <span className="text-xs text-gray-500">
                                      From: {formatDate(profile.waiverStartDate)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                'No'
                              )}
                            </TableCell>
                            <TableCell>{profile.assignedToName || 'Unassigned'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={showUuids ? 22 : 21} className="text-center py-6 text-gray-500">
                            No assigned clients found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollableTable>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Existing Edit Modal */}
      <EditCRMModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userUuid={selectedProfile?.uuid || ''}
        userName={selectedProfile?.pocName || selectedProfile?.companyName || 'Unknown User'}
        companyName={selectedProfile?.companyName || 'Unknown Company'}
        onRefresh={handleEditComplete}
      />

      {/* New CRUD Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedUserUuid && (
        <FullEditModal
          isOpen={isFullEditModalOpen}
          onClose={handleCloseFullEditModal}
          userUuid={selectedUserUuid}
          onSuccess={handleFullEditSuccess}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          userUuid={userToDelete.uuid}
          userName={userToDelete.name}
          userEmail={userToDelete.email}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default CRMPage; 