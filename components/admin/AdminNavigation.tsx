"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GitBranch, 
  Layers, 
  Users, 
  BarChart2,
  LogOut,
  UserCog,
  Wrench,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  // Overview Group
  { 
    group: 'Overview',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
      { href: '/admin/crm', icon: UserCog, label: 'CRM' },
    ]
  },
  // Users Group
  {
    group: 'Users',
    items: [
      { href: '/admin/profiles', icon: Users, label: 'Profiles' },
    ]
  },
  // Questionnaires Group
  {
    group: 'Questionnaires',
    items: [
      { href: '/admin/flows', icon: GitBranch, label: 'Flows' },
      { href: '/admin/sections', icon: Layers, label: 'Sections' },
    ]
  },
  // Listings Group
  {
    group: 'Listings',
    items: [
      { href: '/admin/tool-profiles', icon: Wrench, label: 'Tool Profiles' },
      { href: '/admin/buyer-profiles', icon: Users, label: 'Buyer Profiles' },
      { href: '/admin/ally-profiles', icon: Briefcase, label: 'Ally Profiles' },
    ]
  },
];

export const AdminNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      setLoggingOut(false);
    }
  };

  return (
    <nav className="w-64 bg-white border-r h-full flex flex-col">
      <div className="p-4 flex-1">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Panel</h1>
        <div className="space-y-6">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">
                {group.group}
              </h2>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium
                      ${isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sign out button at the bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {loggingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </nav>
  );
}; 