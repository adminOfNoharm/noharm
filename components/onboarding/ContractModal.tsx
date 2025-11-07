'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
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
import { AlertCircle, Loader2, RefreshCw, CalendarIcon, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

// Dynamically import the PDF viewer component
const PDFViewerComponent = dynamic(() => import('./PDFViewerComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
    </div>
  ),
})

interface ContractModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  userRole: string
}

export default function ContractModal({
  isOpen,
  onClose,
  onAccept,
  userRole
}: ContractModalProps) {
  const [contractUrl, setContractUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [showNameEntry, setShowNameEntry] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState(false)
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }))
  
  const fetchContract = useCallback(async () => {
    if (!isOpen) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Get the appropriate contract file based on user role
      const fileName = userRole === 'ally' 
        ? 'ally.pdf' 
        : userRole === 'seller'
          ? 'seller.pdf'
          : 'buyer.pdf';
      
      // Use our API route to get the contract file
      const timestamp = new Date().getTime()
      const contractApiUrl = `/api/contracts/${fileName}?t=${timestamp}`
      
      // Test API endpoint availability
      try {
        const response = await fetch(contractApiUrl, { method: 'HEAD' })
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }
      } catch (err) {
        throw new Error('Failed to connect to the contract server')
      }
      
      // Set the contract URL
      setContractUrl(contractApiUrl)
    } catch (error) {
      console.error('Error setting up contract URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to load contract. Please try again.')
      toast.error('Failed to load contract. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [isOpen, userRole])
  
  useEffect(() => {
    if (isOpen) {
      fetchContract()
      setNameInput('')
      setShowNameEntry(false)
      setNameError(false)
    }
  }, [isOpen, userRole, fetchContract])
  
  const handleAccept = async () => {
    // Show name entry form when user clicks "Accept Terms"
    if (!showNameEntry) {
      setShowNameEntry(true);
      return;
    }
    
    // Validate name is not empty
    if (nameInput.trim() === '') {
      setNameError(true);
      toast.error("Please enter your full name");
      return;
    }
    
    setNameError(false);
    setConfirming(true);
    
    try {
      // Log the signature information in the database
      console.log('🔄 Inserting contract signature into contract_signatures table...')
      const { error } = await supabase
        .from('contract_signatures')
        .insert({
          user_uuid: (await supabase.auth.getUser()).data.user?.id,
          full_name: nameInput.trim(),
          contract_type: userRole,
          ip_address: null, // For privacy reasons, we don't collect IP on client side
          user_agent: navigator.userAgent
        });
        
      if (error) {
        console.error('❌ Error logging signature to contract_signatures:', error);
        toast.error("Error logging signature, but proceeding with acceptance");
        // Continue with acceptance even if logging fails
      } else {
        console.log('✅ Contract signature successfully saved to contract_signatures table')
      }
      
      // Track contract acceptance with additional metadata
      await trackEvent('terms_accepted', {
        stage_name: 'contract_sign',
        url: window.location.href,
        source: `${nameInput} on ${currentDate}`
      });
      
      setConfirming(false);
      setShowNameEntry(false);
      
      // Call the original onAccept function to proceed with the workflow
      onAccept();
    } catch (err) {
      console.error('Error in contract acceptance process:', err);
      setConfirming(false);
      toast.error("Error in contract process, but proceeding with acceptance");
      // Continue with acceptance even if there's an error
      onAccept();
    }
  };
  
  const handleCancel = () => {
    // If we're in the name entry screen, go back to contract view
    if (showNameEntry) {
      setShowNameEntry(false);
      setNameError(false);
    } else {
      // If we're in the contract view, close the modal
      onClose();
    }
  }
  
  return (
    <>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .rpv-core__viewer {
          height: 100% !important;
          width: 100% !important;
        }
        
        .rpv-core__inner-pages {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .rpv-core__inner-page {
          touch-action: pan-y pan-x pinch-zoom !important;
        }
        
        @media (max-width: 640px) {
          .rpv-core__inner-pages::-webkit-scrollbar {
            width: 4px;
          }
          .rpv-core__inner-pages::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 2px;
          }
        }
      `}</style>
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b">
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                Contract Terms
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Please review our contract terms before proceeding.
              </DialogDescription>
            </DialogHeader>
            
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {!showNameEntry ? (
                <div className="h-full p-4 sm:p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="flex items-center text-red-500 mb-4">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <p>{error}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={fetchContract} 
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    contractUrl && (
                      <div className="w-full h-full border rounded-md overflow-hidden">
                        <PDFViewerComponent fileUrl={contractUrl} />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-4 sm:p-6">
                  <div className="bg-blue-50 p-6 sm:p-8 rounded-xl max-w-lg w-full border border-blue-100">
                    <div className="text-center mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <h3 className="text-xl font-semibold text-gray-900">Confirm Acceptance</h3>
                      <div className="flex items-center justify-center text-gray-600 mt-2">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">{currentDate}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6 text-center">
                      To confirm that you have read and accept the terms of this contract, please type your full name below:
                    </p>
                    
                    <div className={`relative mb-6 ${nameError ? 'animate-shake' : ''}`}>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value)
                          if (nameError) setNameError(false)
                        }}
                        placeholder="Your Full Name"
                        className={`border ${nameError ? 'border-red-500' : 'border-gray-300'} p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center`}
                        autoFocus
                      />
                      {nameError && (
                        <p className="text-red-500 text-sm mt-1 text-center">
                          Please enter your full name
                        </p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By entering your name and clicking "I Accept", you acknowledge that you have read, understood, and agree to be bound by all terms and conditions outlined in this contract.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info Banner */}
            {!showNameEntry && (
              <div className="flex-shrink-0 bg-gray-50 p-4 mx-4 sm:mx-6 rounded-md">
                <p className="text-sm text-gray-700">
                  By clicking "Accept Terms", you acknowledge that you have read and agree to the contract terms outlined {userRole === 'buyer' ? 'that will be sent to you' : 'above'}.
                </p>
              </div>
            )}
            
            {/* Footer with Buttons - ALWAYS VISIBLE */}
            <div className="flex-shrink-0 bg-white border-t p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={confirming}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3 text-base font-medium order-2 sm:order-1"
                >
                  {showNameEntry ? "Back" : "Close"}
                </Button>
                <Button 
                  onClick={handleAccept} 
                  disabled={confirming || (!showNameEntry && userRole !== 'buyer' && (loading || !!error || !contractUrl))}
                  className={`w-full sm:w-auto min-h-[48px] px-6 py-3 text-base font-medium order-1 sm:order-2 ${
                    showNameEntry ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {confirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : showNameEntry ? (
                    "I Accept"
                  ) : (
                    "Accept Terms"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 