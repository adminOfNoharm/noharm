import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";
import { Search, Trash2, Download } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { deleteUser } from '@/lib/utils/user-management';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteUserModal } from '@/components/modals/DeleteUserModal';
import { fetchOnboardingStages } from '@/lib/utils/stage-management';
import { fetchAllProfiles, ProfileWithStage } from '@/lib/utils/admin-management';

// Local interfaces for the component
interface StageInfo {
  stage_id: number;
  stage_name: string;
  onboarding_stage_index: number;
}

const OnboardingProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileWithStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [allStages, setAllStages] = useState<StageInfo[]>([]);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ uuid: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfiles();
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const stages = await fetchOnboardingStages();
      setAllStages(stages.map(stage => ({ stage_name: stage.stage_name, stage_id: stage.stage_id, onboarding_stage_index: stage.onboarding_stage_index })));
    } catch (error) {
      console.error("Error fetching stages:", error);
      toast.error('Failed to fetch onboarding stages');
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const profilesData = await fetchAllProfiles();
      
      // Sort profiles by creation date (newest first)
      const sortedProfiles = profilesData.sort((a, b) => {
        if (!a.created_at) return 1;  // null values go to the end
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setProfiles(sortedProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error('Failed to fetch user profiles');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.current_stage?.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.current_stage?.stage_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || profile.current_stage?.status === statusFilter;
    const matchesStage = stageFilter === 'all' || profile.current_stage?.stage_name === stageFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesStage;
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

  const uniqueRoles = Array.from(new Set(profiles.map(p => p.role))).sort();
  const statusOptions = ['not_started', 'in_progress', 'in_review', 'completed'];

  const handleDeleteClick = (uuid: string, email: string) => {
    setUserToDelete({ uuid, email });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeletingUser(userToDelete.uuid);
    try {
      const result = await deleteUser(userToDelete.uuid);
      if (result.success) {
        toast.success('User deleted successfully');
        // Remove user from local state
        setProfiles(profiles.filter(p => p.uuid !== userToDelete.uuid));
        setDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const exportToCSV = () => {
    if (filteredProfiles.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Prepare CSV content
    const headers = ['Email', 'Role', 'Stage', 'Status', 'Created', 'Comments Last Updated'];
    
    const rows = filteredProfiles.map(profile => [
      profile.email || 'Email not found',
      profile.role || '',
      profile.current_stage ? `${profile.current_stage.stage_index}. ${formatStageName(profile.current_stage.stage_name)}` : 'Not Started',
      profile.current_stage ? capitalize(profile.current_stage.status.replace('_', ' ')) : 'Not Started',
      profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown',
      profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'No updates'
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
    link.setAttribute('download', `profiles-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {capitalize(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {allStages.map(stage => (
                    <SelectItem key={stage.stage_name} value={stage.stage_name}>
                      <Badge className={getStageBadgeColor(stage.stage_name)} variant="secondary">
                        {formatStageName(stage.stage_name)}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
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
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <p className="text-sm text-gray-500 ml-auto">
              Showing {filteredProfiles.length} of {profiles.length} profiles
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Comments Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow
                  key={profile.uuid}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell 
                    className="font-medium"
                    onClick={() => router.push(`/admin/profile/${profile.uuid}`)}
                  >{profile.email}</TableCell>
                  <TableCell onClick={() => router.push(`/admin/profile/${profile.uuid}`)}>
                    <Badge variant="outline">
                      {capitalize(profile.role)}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/admin/profile/${profile.uuid}`)}>
                    {profile.current_stage ? (
                      <Badge className={getStageBadgeColor(profile.current_stage.stage_name)}>
                        {profile.current_stage.stage_index}. {formatStageName(profile.current_stage.stage_name)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Not Started</span>
                    )}
                  </TableCell>
                  <TableCell onClick={() => router.push(`/admin/profile/${profile.uuid}`)}>
                    {profile.current_stage ? (
                      <Badge className={getStatusColor(profile.current_stage.status)}>
                        {capitalize(profile.current_stage.status.replace('_', ' '))}
                      </Badge>
                    ) : (
                      <Badge className={getStatusColor('not_started')}>
                        Not Started
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell 
                    className="text-sm text-gray-500"
                    onClick={() => router.push(`/admin/profile/${profile.uuid}`)}
                  >
                    {profile.created_at 
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </TableCell>
                  <TableCell 
                    className="text-sm text-gray-500"
                    onClick={() => router.push(`/admin/profile/${profile.uuid}`)}
                  >
                    {profile.updated_at 
                      ? new Date(profile.updated_at).toLocaleDateString()
                      : 'No updates'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(profile.uuid, profile.email || '');
                      }}
                      disabled={deletingUser === profile.uuid}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {userToDelete && (
        <DeleteUserModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          userEmail={userToDelete.email}
          isDeleting={deletingUser === userToDelete.uuid}
        />
      )}
    </>
  );
};

export default OnboardingProfiles;
