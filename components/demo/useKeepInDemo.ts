'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to intercept navigation attempts and keep users within the demo environment
 */
export function useKeepInDemo() {
  const router = useRouter();

  useEffect(() => {
    // Function to intercept link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        
        // If the link is not part of the demo section, prevent default and handle it
        if (href && !href.startsWith('/demo') && !href.startsWith('#') && !href.startsWith('https://')) {
          e.preventDefault();
          
          // Map specific routes to their demo equivalents
          if (href.startsWith('/onboarding/dashboard')) {
            router.push('/demo/dashboard');
          } else if (href.startsWith('/matches')) {
            router.push('/demo/matches');
          } else if (href.startsWith('/profile/standalone')) {
            router.push('/demo/profile');
          } else if (href.startsWith('/onboarding/kyc_buyer')) {
            router.push('/demo/kyc_buyer');
          }
          // For other internal links, stay on the current page
          // External links with https:// will still work normally
        }
      }
    };

    // Add event listener
    document.addEventListener('click', handleLinkClick, true);

    // Override navigation methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(data, title, url) {
      // If attempting to navigate away from demo, redirect to appropriate demo page
      if (url && typeof url === 'string') {
        if (url.startsWith('/onboarding/dashboard')) {
          router.push('/demo/dashboard');
          return;
        } else if (url.startsWith('/matches')) {
          router.push('/demo/matches');
          return;
        } else if (url.startsWith('/profile/standalone')) {
          router.push('/demo/profile');
          return;
        } else if (url.startsWith('/onboarding/kyc_buyer')) {
          router.push('/demo/kyc_buyer');
          return;
        }
      }
      
      // Allow demo navigation to proceed
      return originalPushState.apply(this, [data, title, url]);
    };

    history.replaceState = function(data, title, url) {
      // Similar logic for replaceState
      if (url && typeof url === 'string') {
        if (url.startsWith('/onboarding/dashboard')) {
          router.push('/demo/dashboard');
          return;
        } else if (url.startsWith('/matches')) {
          router.push('/demo/matches');
          return;
        } else if (url.startsWith('/profile/standalone')) {
          router.push('/demo/profile');
          return;
        } else if (url.startsWith('/onboarding/kyc_buyer')) {
          router.push('/demo/kyc_buyer');
          return;
        }
      }
      
      return originalReplaceState.apply(this, [data, title, url]);
    };

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [router]);
} 