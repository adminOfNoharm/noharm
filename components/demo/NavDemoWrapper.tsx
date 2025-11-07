'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Menu, X } from 'lucide-react';

interface DemoRoute {
  name: string;
  path: string;
}

export default function NavDemoWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const demoRoutes: DemoRoute[] = [
    {
      name: 'Home',
      path: '/demo',
    },
    {
      name: 'Dashboard',
      path: '/demo/dashboard',
    },
    {
      name: 'Matches',
      path: '/demo/matches',
    },
    {
      name: 'Profile',
      path: '/demo/profile',
    },
  ];

  // Handle navigation with loading state
  const handleNavigation = (path: string) => {
    setLoading(true);
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  // Reset loading when navigation completes
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // Determine which route is active
  const getActiveClass = (path: string) => {
    if (path === '/demo' && pathname === '/demo') {
      return 'bg-white text-black font-medium';
    }
    
    if (path !== '/demo' && pathname.startsWith(path)) {
      return 'bg-white text-black font-medium';
    }
    
    return 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <div className="min-h-screen">
      {/* Demo Navigation bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#8e00f6] text-white shadow-lg border-b border-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/demo" className="flex items-center">
                <div className="h-12 px-4 py-2 relative bg-white rounded-md flex items-center justify-center">
                  <img 
                    src="/images/logos/new-logo-blue.png" 
                    alt="NoHarm Logo" 
                    className="h-full w-auto object-contain"
                  />
                  <div className="mx-2 h-6 w-px bg-gray-300"></div>
                  <span className="text-xs font-medium text-gray-800">Demo Mode</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {demoRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => handleNavigation(route.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass(route.path)}`}
                >
                  {route.name}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#8e00f6] border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {demoRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => handleNavigation(route.path)}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    getActiveClass(route.path)
                  }`}
                >
                  {route.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content with padding for nav bar */}
      <div className="pt-16">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-64px)]">
            <LoadingSpinner />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
} 