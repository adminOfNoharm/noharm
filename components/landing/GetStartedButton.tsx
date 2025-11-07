'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import Link from 'next/link'

interface GetStartedButtonProps {
  className?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function GetStartedButton({ className, variant, size }: GetStartedButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleAccept = () => {
    setShowModal(false)
    router.push('/onboarding/dashboard')
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={className}
        variant={variant}
        size={size}
      >
        Get Started
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Your Onboarding Journey</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                You are about to start the onboarding process. By continuing, you agree to our <Link href="/onboarding-terms" className="text-[#00792b] hover:text-[#1105ff] underline">terms and conditions</Link>.
              </p>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Important Note:</strong> If you have been logged out, you will need to reset your password from the login page using your current email address to maintain access and continue onboarding.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccept}>
              Accept & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 