import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function OnboardingHeader() {
  const router = useRouter();

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/onboarding/dashboard')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <img src="/images/logos/new-logo-blue.png" alt="Logo" className="h-12" />
        </div>
      </div>
    </div>
  );
} 