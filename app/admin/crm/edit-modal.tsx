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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Define CRM data interface
interface CRMData {
  id?: string;
  user_uuid: string;
  assigned_to?: string | null;
  assigned_to_name?: string;
  follow_up_date?: string | null;
  follow_up_notes?: string;
  comments?: string;
  tags?: string[];
  has_waiver?: boolean;
  waiver_duration?: string | null;
  waiver_start_date?: string | null;
  listed_on_marketplace?: boolean;
  listed_on_marketplace_date?: string | null;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUuid: string;
  userName: string;
  companyName: string;
  initialRefresh?: boolean;
  onRefresh?: () => void;
}

// Helper to format date for input field
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// List of possible team members for assignment
const TEAM_MEMBERS = [
  { name: 'Unassigned', uuid: 'unassigned' },
  { name: 'Maria', uuid: 'e9812b0b-79b6-4ea8-b0b5-58bfef48ec17' },
  { name: 'Maz', uuid: 'dc4b5f6a-62bd-4319-8029-c1f25cb3ce17' },
  { name: 'Ali', uuid: '192fca7b-d3cf-462b-9286-67a36919f75a' },
  { name: 'Delma', uuid: '726a710e-4665-498f-a3ac-ec5007705a93' },
  { name: 'Sam', uuid: '048e73b4-beff-45ed-9285-62e993451e79' }
];

// Suggested tags
const SUGGESTED_TAGS = [
  'onboarded',
  'pilot',
  'new',
  'prospect'
];

const EditCRMModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  userUuid, 
  userName,
  companyName,
  onRefresh 
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CRMData>({
    user_uuid: userUuid,
    assigned_to: 'unassigned',
    tags: [],
    has_waiver: false,
    listed_on_marketplace: false
  });
  const [newTag, setNewTag] = useState('');
  const [openTagsCombobox, setOpenTagsCombobox] = useState(false);

  // Fetch existing CRM data on open
  useEffect(() => {
    if (isOpen && userUuid) {
      fetchCRMData();
    }
  }, [isOpen, userUuid]);

  const fetchCRMData = async () => {
    try {
      setLoading(true);
      const { data: crmData, error } = await supabase
        .from('crm_user_data')
        .select('*')
        .eq('user_uuid', userUuid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (crmData) {
        // Log for debugging
        console.log('Fetched CRM data:', crmData);
        console.log('Follow-up notes value:', crmData.follow_up_notes);
        
        // Ensure tags is always an array
        if (!crmData.tags) {
          crmData.tags = [];
        }
        
        // Convert null assigned_to to 'unassigned' for the UI
        if (!crmData.assigned_to) {
          crmData.assigned_to = 'unassigned';
        }
        
        // Use the data as is - dates are already in ISO string format
        setData(crmData);
      } else {
        // Reset to defaults for new record
        setData({
          user_uuid: userUuid,
          assigned_to: 'unassigned', // Use 'unassigned' instead of undefined
          tags: [],
          has_waiver: false,
          listed_on_marketplace: false,
          follow_up_notes: '' // Initialize empty follow_up_notes
        });
      }
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComplete = () => {
    console.log("Save completed, triggering refresh");
    // Force a small delay to ensure database operations complete
    setTimeout(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, 500);
    onClose();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Create a clean copy of the data for saving
      const saveData = { ...data };
      
      // Ensure assigned_to is handled correctly for unassigned
      if (!saveData.assigned_to || saveData.assigned_to === '' || saveData.assigned_to === 'unassigned') {
        // Use null for database to indicate unassigned
        saveData.assigned_to = null;
      }
      
      // Handle empty string for waiver_duration (convert to null for database)
      if (saveData.waiver_duration === '') {
        saveData.waiver_duration = null;
      }
      
      // Log data before saving
      console.log('Saving CRM data:', saveData);
      console.log('Follow-up notes being saved:', saveData.follow_up_notes);

      // Upsert data (insert if not exists, update if exists)
      const { error } = await supabase
        .from('crm_user_data')
        .upsert(saveData, { 
          onConflict: 'user_uuid'
        });

      if (error) throw error;
      
      // Verify data was saved correctly
      const { data: savedData, error: fetchError } = await supabase
        .from('crm_user_data')
        .select('*')
        .eq('user_uuid', saveData.user_uuid)
        .single();
        
      if (fetchError) {
        console.error("Error verifying saved data:", fetchError);
      } else {
        console.log("Verified saved data:", savedData);
      }
      
      toast.success('CRM data saved successfully');
      handleSaveComplete();
    } catch (error) {
      console.error("Error saving CRM data:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to save CRM data');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ 
      ...prev, 
      [name]: value ? new Date(value).toISOString() : null 
    }));
  };

  const handleAddTag = () => {
    if (newTag && (!data.tags || !data.tags.includes(newTag))) {
      setData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSelectTag = (tag: string) => {
    if (!data.tags || !data.tags.includes(tag)) {
      setData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
    setOpenTagsCombobox(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit CRM Data</DialogTitle>
          <DialogDescription>
            {companyName || userName || `User ID: ${userUuid}`}
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>}

        {!loading && (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="followups">Follow Ups</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <select 
                      id="assigned_to"
                      name="assigned_to"
                      value={data.assigned_to || 'unassigned'}
                      onChange={e => {
                        const newValue = e.target.value;
                        console.log("Assignment selection changed to:", newValue);
                        
                        // Update state with the new value
                        setData(prev => {
                          const updated = { 
                            ...prev, 
                            assigned_to: newValue
                          };
                          console.log("Updated state:", updated);
                          return updated;
                        });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="unassigned">Unassigned</option>
                      {TEAM_MEMBERS.filter(member => member.uuid !== 'unassigned').map(member => (
                        <option key={member.uuid} value={member.uuid}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments/Notes</Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      placeholder="Add notes about this client..."
                      value={data.comments || ''}
                      onChange={handleInputChange}
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(data.tags || []).map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Popover open={openTagsCombobox} onOpenChange={setOpenTagsCombobox}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10">Select Tags</Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[200px]">
                          <div className="py-2 px-1">
                            <div className="text-sm font-medium px-3 py-1.5">Suggested Tags</div>
                            <div className="space-y-1 mt-1">
                              {SUGGESTED_TAGS.filter(tag => !data.tags?.includes(tag)).map(tag => (
                                <div 
                                  key={tag}
                                  className="flex items-center px-3 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer"
                                  onClick={() => {
                                    handleSelectTag(tag);
                                    setOpenTagsCombobox(false);
                                  }}
                                >
                                  {tag}
                                </div>
                              ))}
                              {SUGGESTED_TAGS.filter(tag => !data.tags?.includes(tag)).length === 0 && (
                                <div className="text-sm text-gray-500 px-3 py-1.5">
                                  All suggested tags already added
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="flex gap-2 flex-1">
                        <Input
                          placeholder="Add custom tag..."
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button type="button" onClick={handleAddTag}>Add</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="listed_on_marketplace">Listed on Marketplace</Label>
                      <Switch
                        id="listed_on_marketplace"
                        checked={data.listed_on_marketplace || false}
                        onCheckedChange={checked => handleSwitchChange('listed_on_marketplace', checked)}
                      />
                    </div>
                    {data.listed_on_marketplace && (
                      <div className="mt-2">
                        <Label htmlFor="listed_on_marketplace_date">Listing Date</Label>
                        <Input
                          id="listed_on_marketplace_date"
                          name="listed_on_marketplace_date"
                          type="date"
                          value={formatDateForInput(data.listed_on_marketplace_date)}
                          onChange={handleDateChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Follow Ups Tab */}
            <TabsContent value="followups" className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    name="follow_up_date"
                    type="date"
                    value={formatDateForInput(data.follow_up_date)}
                    onChange={handleDateChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                  <Textarea
                    id="follow_up_notes"
                    name="follow_up_notes"
                    placeholder="Notes for the next follow-up..."
                    value={data.follow_up_notes || ''}
                    onChange={handleInputChange}
                    className="min-h-16"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has_waiver">Payment Waiver</Label>
                    <Switch
                      id="has_waiver"
                      checked={data.has_waiver || false}
                      onCheckedChange={checked => handleSwitchChange('has_waiver', checked)}
                    />
                  </div>
                  
                  {data.has_waiver && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="waiver_duration">Waiver Duration (Months)</Label>
                        <Input
                          id="waiver_duration"
                          name="waiver_duration"
                          type="number"
                          min="1"
                          placeholder="e.g., 3"
                          value={data.waiver_duration || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="waiver_start_date">Waiver Start Date</Label>
                        <Input
                          id="waiver_start_date"
                          name="waiver_start_date"
                          type="date"
                          value={formatDateForInput(data.waiver_start_date)}
                          onChange={handleDateChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCRMModal; 