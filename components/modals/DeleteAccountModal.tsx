'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/toast';
import { X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const router = useRouter();
  const [deleteAccountEmail, setDeleteAccountEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    // Verify email matches
    if (deleteAccountEmail.toLowerCase() !== userEmail.toLowerCase()) {
      toast.error('Email does not match');
      return;
    }

    try {
      setIsDeleting(true);

      // Call the request deletion API endpoint
      const response = await fetch('/api/request-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }), // Send email in request body
        credentials: 'include', // Include cookies in the request
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to request account deletion');
      }

      // Show success message and close modal
      toast.success('Account deletion requested. Your account will be deleted within 24 hours.');
      onClose();
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      toast.error('Failed to request account deletion. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Your account and all associated data will be permanently deleted within 24 hours. You will still have access to your account during this time. This action cannot be undone.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter your email to confirm deletion
            </label>
            <input
              type="email"
              value={deleteAccountEmail}
              onChange={(e) => setDeleteAccountEmail(e.target.value)}
              placeholder={userEmail}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting || !deleteAccountEmail}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Requesting Deletion...' : 'Request Deletion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 