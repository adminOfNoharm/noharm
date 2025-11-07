import { Button } from "@/components/ui/button";
import { Mail, Calendar } from 'lucide-react';
import Image from 'next/image';

interface ActionBarProps {
  variant?: 'default' | 'compact';
  onScheduleCall?: () => void;
  onContactSeller?: () => void;
  companyName?: string;
  companyLogo?: string;
  toolName?: string;
}

export function ActionBar({ 
  variant = 'default',
  onScheduleCall,
  onContactSeller,
  companyName = '',
  companyLogo = '/images/placeholder-logo.jpg',
  toolName = ''
}: ActionBarProps) {
  return (
    <div className="h-full bg-white border-t border-gray-200 shadow-lg">
      <div className="h-full max-w-5xl mx-auto px-4 lg:px-6 py-4">
        <div className="h-full flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
              <Image
                src={companyLogo}
                alt={`${companyName} Logo`}
                fill
                className="object-contain rounded-md border border-gray-200 bg-white p-1"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{companyName}</h3>
              <p className="text-xs text-gray-500">{toolName}</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 flex-1 lg:max-w-[500px]">
            <Button 
              variant="outline" 
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 lg:px-6"
              onClick={onScheduleCall}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Call</span>
            </Button>
            <Button 
              variant="default" 
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 lg:px-6"
              onClick={onContactSeller}
            >
              <Mail className="w-4 h-4" />
              <span>Contact Seller</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 