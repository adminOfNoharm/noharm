'use client';

import { useState, useEffect, useRef } from 'react';
import NavDemoWrapper from '@/components/demo/NavDemoWrapper';

export default function DemoDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Set a timeout to hide the loader after 5 seconds 
    // in case the onLoad event doesn't fire correctly
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    // Add load event listener directly to the iframe element
    const handleLoad = () => {
      setIsLoading(false);
      clearTimeout(timeoutId);
    };
    
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleLoad);
    }
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  return (
    <NavDemoWrapper>
      <div className="w-full h-screen flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/onboarding/dashboard"
          className="w-full flex-grow border-0"
          title="NoHarm Dashboard"
        />
      </div>
    </NavDemoWrapper>
  );
}