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
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingDialogProps {
  isLoading: boolean
  loadingMessage: string
  showLoginDialog: boolean
  userEmail: string | null
  onLoginClick: () => void
  onCloseLoginDialog: () => void
}

export default function OnboardingDialog({
  isLoading,
  loadingMessage,
  showLoginDialog,
  userEmail,
  onLoginClick,
  onCloseLoginDialog
}: OnboardingDialogProps) {
  return (
    <>
      {/* Loading Dialog - Non-closable */}
      <style jsx global>{`
        .loading-dialog [data-radix-dialog-close] {
          display: none;
        }
      `}</style>
      <Dialog open={isLoading} onOpenChange={() => {}} modal>
        <DialogContent 
          className="loading-dialog sm:max-w-md"
          onInteractOutside={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Setting up custom session</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingMessage}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={onCloseLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Already Exists</DialogTitle>
            <DialogDescription>
              An account with the email {userEmail} already exists. Please login to continue. If you do not know your password, please reset it from the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onLoginClick}>
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 