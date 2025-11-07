'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, FileEdit, LogOut } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface PreviewSidebarProps {
  userEmail?: string;
  userRole?: string;
}

export default function PreviewSidebar({ userEmail, userRole }: PreviewSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Preview', href: '/profile/preview', icon: Eye },
    { name: 'Request Edit', href: '/profile/request-edit', icon: FileEdit },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-full w-[240px] flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 flex justify-center items-center">
        <img 
          src="/images/logos/new-logo-blue.png" 
          alt="Logo" 
          className="h-12 w-auto"
        />
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-6 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 