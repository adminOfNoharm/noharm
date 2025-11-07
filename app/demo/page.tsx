'use client';

import { useRouter } from 'next/navigation';
import NavDemoWrapper from '@/components/demo/NavDemoWrapper';
import { useKeepInDemo } from '@/components/demo/useKeepInDemo';

interface DemoRoute {
  name: string;
  path: string;
  description: string;
}

export default function DemoPage() {
  const router = useRouter();
  
  // Use the custom hook to keep navigation within the demo environment
  useKeepInDemo();

  const demoRoutes: DemoRoute[] = [
    {
      name: 'Dashboard',
      path: '/demo/dashboard',
      description: 'Onboarding dashboard with progress tracking'
    },
    {
      name: 'Matches',
      path: '/demo/matches',
      description: 'View and interact with matched profiles'
    },
    {
      name: 'Profile',
      path: '/demo/profile',
      description: 'Standalone profile view with template selection'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <NavDemoWrapper>
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Demo Navigation</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the NoHarm Platform demo. Use the navigation bar above to explore key features.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoRoutes.map((route) => (
            <div
              key={route.path}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
              onClick={() => handleNavigation(route.path)}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h2>
              <p className="text-gray-600 mb-4">{route.description}</p>
              <div className="text-emerald-600 font-medium">
                Navigate →
              </div>
            </div>
          ))}
        </div>
      </div>
    </NavDemoWrapper>
  );
} 