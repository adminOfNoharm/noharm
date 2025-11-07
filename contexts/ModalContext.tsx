'use client';

import React, { createContext, useContext, useState } from 'react';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';

interface ModalContextType {
  openDeleteAccountModal: (email: string) => void;
  closeDeleteAccountModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const openDeleteAccountModal = (email: string) => {
    setUserEmail(email);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteAccountModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <ModalContext.Provider value={{ openDeleteAccountModal, closeDeleteAccountModal }}>
      {children}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteAccountModal}
        userEmail={userEmail}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
} 