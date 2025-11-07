"use client";

import AdminProtected from "@/components/admin/AdminProtected";
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtected>
      <div className="flex h-screen bg-gray-100">
        <AdminNavigation />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminProtected>
  );
} 