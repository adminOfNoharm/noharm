'use client';

import React, { useState } from 'react';
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUuid: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ 
  isOpen, 
  onClose, 
  userUuid,
  userName,
  userEmail,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const expectedConfirmation = `DELETE ${userName}`;

  const handleDelete = async () => {
    if (confirmationText !== expectedConfirmation) {
      toast.error('Please enter the exact confirmation text');
      return;
    }

    setLoading(true);
    try {
      // Get the user's JWT token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Call the existing delete user API
      const response = await fetch(`/api/admin/users/${userUuid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the Authorization header
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      onSuccess();
      onClose();
      
      // Reset confirmation text
      setConfirmationText('');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmationText('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will permanently delete all of the following data:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User profile and personal information</li>
                <li>Authentication account</li>
                <li>Onboarding progress and history</li>
                <li>CRM data and assignments</li>
                <li>Analytics events and tracking data</li>
                <li>Profile notes and comments</li>
                <li>All associated documents and files</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="userDetails">User Details:</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
              <p className="text-xs text-gray-500">UUID: {userUuid}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm deletion, type: <span className="font-mono font-bold text-red-600">{expectedConfirmation}</span>
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedConfirmation}
              className="font-mono"
              disabled={loading}
            />
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>⚠️ This action will:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Remove the user from all systems</li>
              <li>Delete all onboarding progress</li>
              <li>Clear all CRM assignments and data</li>
              <li>Remove all analytics and tracking data</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading || confirmationText !== expectedConfirmation}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserModal; 