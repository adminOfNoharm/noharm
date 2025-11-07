'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/utils/analytics'
import Link from 'next/link'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  stageName: string
}

export default function TermsModal({
  isOpen,
  onClose,
  onAccept,
  stageName
}: TermsModalProps) {
  
  const handleAccept = async () => {
    // Track terms acceptance
    await trackEvent('terms_accepted', {
      stage_name: stageName,
      url: window.location.href
    });
    
    onAccept();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
          <DialogDescription>
            Before proceeding with the onboarding process, please review and accept our terms and conditions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 bg-gray-50 rounded-md text-sm text-gray-700">
          <p>
            By continuing, you agree to our <Link href="/onboarding-terms" target="_blank" className="text-blue-600 hover:underline font-medium">Terms of Service</Link> and <Link href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="sm:mr-2">
            Cancel
          </Button>
          <Button onClick={handleAccept}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 