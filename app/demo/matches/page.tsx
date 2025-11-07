'use client';

import { useState, useEffect, useRef } from 'react';
import NavDemoWrapper from '@/components/demo/NavDemoWrapper';

export default function DemoMatchesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  
  useEffect(() => {
    // Set a timeout to hide the loader after 5 seconds 
    // in case the onLoad event doesn't fire correctly
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    // Add load event listener directly to the iframe element
    const handleLoad = () => {
      console.log('Iframe loaded');
    };
    
    // Handle iframe unload or navigation to prevent message channel errors
    const handleBeforeUnload = () => {
      // Clean up any pending message listeners
      window.removeEventListener('message', handleMessage);
      setIframeReady(false);
    };
    
    // Handle potential iframe messages
    const handleMessage = (event: MessageEvent) => {
      // Only handle messages from our iframe
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        console.log('Received message from iframe:', event.data);
        
        // Handle specific message types
        if (event.data.type === 'IFRAME_READY') {
          setIframeReady(true);
          // Send acknowledgment back to the iframe
          if (iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'PARENT_READY' }, '*');
          }
        }
        
        if (event.data.type === 'LOADING_COMPLETE') {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
        
        // Always return false to avoid the "message channel closed" error
        return false;
      }
    };
    
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleLoad);
      window.addEventListener('message', handleMessage);
      
      // Try to access contentWindow to add beforeunload listener
      try {
        const iframeWindow = iframeRef.current.contentWindow;
        if (iframeWindow) {
          iframeWindow.addEventListener('beforeunload', handleBeforeUnload);
        }
      } catch (error) {
        console.warn('Could not add beforeunload listener to iframe:', error);
      }
    }
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
      
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleLoad);
        
        // Try to remove beforeunload listener
        try {
          const iframeWindow = iframeRef.current.contentWindow;
          if (iframeWindow) {
            iframeWindow.removeEventListener('beforeunload', handleBeforeUnload);
          }
        } catch (error) {
          console.warn('Could not remove beforeunload listener from iframe:', error);
        }
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
          src="/matches"
          className="w-full flex-grow border-0"
          title="NoHarm Matches"
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
        />
      </div>
    </NavDemoWrapper>
  );
} 