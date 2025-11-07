'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CalendlyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendlyBookingModal({ isOpen, onClose }: CalendlyBookingModalProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Add overflow hidden to body to prevent background scrolling
      document.body.style.overflow = 'hidden';

      // Load and initialize Calendly
      const loadCalendly = () => {
        // Check if Calendly script is already loaded
        const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
        
        if (!existingScript) {
          // Load Calendly widget script
          const script = document.createElement('script');
          script.src = 'https://assets.calendly.com/assets/external/widget.js';
          script.async = true;
          script.onload = () => {
            // Initialize widget after script loads
            initializeCalendlyWidget();
          };
          document.head.appendChild(script);
        } else {
          // Script already exists, initialize widget directly
          initializeCalendlyWidget();
        }
      };

      const initializeCalendlyWidget = () => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (calendlyRef.current && (window as any).Calendly) {
            // Clear any existing widget content
            calendlyRef.current.innerHTML = '';
            
            // Initialize the Calendly widget
            (window as any).Calendly.initInlineWidget({
              url: 'https://calendly.com/alihassanataxone/30min',
              parentElement: calendlyRef.current,
              prefill: {},
              utm: {}
            });
          }
        }, 100);
      };

      loadCalendly();

      return () => {
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
        
        // Clear the widget content when modal closes
        if (calendlyRef.current) {
          calendlyRef.current.innerHTML = '';
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] mx-4 flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Book a 1:1 Session</h2>
            <p className="text-sm text-gray-600 mt-1">Schedule a personalized consultation with our climate tech experts</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Calendly Widget Container */}
        <div className="flex-1 p-6">
          <div 
            ref={calendlyRef}
            className="w-full h-full"
            style={{ minWidth: '320px', height: '100%' }}
          >
            {/* Loading message while Calendly initializes */}
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00792b] mx-auto mb-4"></div>
                <p>Loading calendar...</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Having trouble? Contact us at <a href="mailto:support@noharm.tech" className="text-[#00792b] hover:underline">support@noharm.tech</a></p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00792b] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 