'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Upload, Trash2, FileText, ArrowLeft, Menu, X, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendStageCompletionEmail } from '@/lib/utils/email-templates';
import { progressToNextStage } from '@/lib/utils/stage-progression';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  created_at: string;
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/x-png': '.png',  // Some systems use this MIME type for PNGs
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/html': '.html',
  'application/html': '.html',  // Some systems use this MIME type for HTML
  'video/mp4': '.mp4',
};

const sanitizeFileName = (fileName: string): string => {
  // Remove special characters and spaces, keep extension
  const extension = fileName.split('.').pop();
  const baseName = fileName.split('.').slice(0, -1).join('.');
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
  
  return `${sanitized}.${extension}`;
};

// Wrapper component that doesn't use useSearchParams
export default function DocumentUploadPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <DocumentUploadContent />
    </Suspense>
  );
}

// Inner component that safely uses useSearchParams inside Suspense
function DocumentUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams?.get('isEditing') === 'true';
  
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(!isEditing);
  type TabType = 'usage' | 'types' | 'recommended';
  const [activeTab, setActiveTab] = useState<TabType>('usage');

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.storage
        .from('docs')
        .list(user.id);

      if (error) throw error;

      const filesWithMetadata = data.map((file) => ({
        name: file.name,
        size: file.metadata.size,
        type: file.metadata.mimetype,
        created_at: file.created_at,
      }));

      setUploadedFiles(filesWithMetadata);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load your documents. Please refresh the page to try again.');
      toast.error('Failed to fetch uploaded files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let hasErrors = false;
      for (const file of Array.from(files)) {
        // Debug log
        console.log('Attempting to upload file:', {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // Check file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const isAllowedMimeType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
        const isAllowedExtension = Object.values(ALLOWED_FILE_TYPES).some(ext => 
          ext.toLowerCase() === `.${fileExtension}`
        );

        if (!isAllowedMimeType && !isAllowedExtension) {
          hasErrors = true;
          toast.error(`"${file.name}" has an unsupported format. Detected type: ${file.type}`);
          console.log('File type rejected:', {
            fileName: file.name,
            mimeType: file.type,
            extension: fileExtension,
            isAllowedMimeType,
            isAllowedExtension
          });
          continue;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          hasErrors = true;
          toast.error(`"${file.name}" exceeds the 10MB size limit`);
          continue;
        }

        // Generate a unique file name
        const sanitizedName = sanitizeFileName(file.name);
        const fileName = `${Date.now()}-${sanitizedName}`;
        const filePath = `${user.id}/${fileName}`;

        console.log('Uploading with sanitized path:', filePath);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('docs')
          .upload(filePath, file);

        if (uploadError) {
          hasErrors = true;
          console.error('Upload error for file:', file.name, uploadError);
          toast.error(`Failed to upload "${file.name}": ${uploadError.message}`);
          continue;
        } else {
          console.log('Successfully uploaded file:', file.name);
          
          // Only update the status if we're not in editing mode
          if (!isEditing) {
          // Update user's status in stage 5 to "in_progress"
          const { data: currentStage, error: stageError } = await supabase
            .from('user_onboarding_progress')
            .select('*')
            .eq('uuid', user.id)
            .eq('stage_id', 5)
            .single();

          if (stageError) {
            console.error('Error checking current stage:', stageError);
          } else if (currentStage) {
            const { error: updateError } = await supabase
              .from('user_onboarding_progress')
              .update({ status: 'in_progress' })
              .eq('uuid', user.id)
              .eq('stage_id', 5);

            if (updateError) {
              console.error('Error updating stage status:', updateError);
            } else {
              console.log('Successfully updated stage 5 status to in_progress');
              }
            }
          }
        }
      }

      // Refresh the file list
      await fetchUploadedFiles();
      
      if (!hasErrors) {
        toast.success(isEditing 
          ? 'Files added to your document set successfully' 
          : 'All files uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Something went wrong while uploading your files. Please try again.');
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.storage
        .from('docs')
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;

      // If we're not in editing mode and there are no more files,
      // we might want to check if we need to update the status
      if (!isEditing) {
        // Check if there are any files left after deletion
        const { data: remainingFiles, error: listError } = await supabase.storage
          .from('docs')
          .list(user.id);
        
        if (listError) {
          console.error('Error checking remaining files:', listError);
        }
        // No need to update status here - we'll just leave it as is
        // This ensures we don't accidentally change a completed status back to not_started
      }

      await fetchUploadedFiles();
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompleteSection = async () => {
    try {
      setIsCompleting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's role
      const { data: userData, error: userError } = await supabase
        .from('seller_compound_data')
        .select('role')
        .eq('uuid', user.id)
        .single();

      if (userError) throw userError;

      // If we're in editing mode, we don't need to update the status or progress to next stage
      if (!isEditing) {
        // Update the status to completed and progress to next stage
        await progressToNextStage(user.id, userData.role, 5); // 5 is the stage_id for document upload

        // Send completion email
        await sendStageCompletionEmail(
          5, // stage_id for document upload
          user.email || '',
          user.user_metadata?.full_name
        );
      }

      toast.success(isEditing ? 'Document updates saved successfully' : 'Document submission completed successfully');
      
      // For sellers, redirect to main dashboard; for others, redirect to onboarding dashboard
      if (userData.role === 'seller' && !isEditing) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding/dashboard');
      }
    } catch (error) {
      console.error('Error completing section:', error);
      toast.error(isEditing ? 'Failed to save document updates' : 'Failed to complete document submission');
    } finally {
      setIsCompleting(false);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
          overflow-y: scroll !important;
          -webkit-overflow-scrolling: touch;
        }

        /* Ensure scrollbar is always visible */
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
          display: block;
          background-color: #f1f1f1;
          -webkit-appearance: none;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 6px;
          border: 2px solid #f1f1f1;
          min-height: 40px;
          -webkit-transition: none;
          transition: none;
        }
        
        /* Keep the same color even on hover/active states */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover,
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background-color: #c1c1c1;
        }

        /* For Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        @media (max-width: 768px) {
          .sidebar-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            position: fixed;
            inset: 0;
            z-index: 40;
          }
        }
      `}</style>

      <div className="flex min-h-screen max-h-screen relative">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white shadow-xl flex flex-col h-screen max-h-screen border-r border-gray-100
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6">
              <img src="/images/logos/new-logo-blue.png" alt="Logo" className="h-9 lg:h-9 w-auto mb-8 lg:mb-12 lg:mt-5" />
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Document upload</h3>
                <p className="text-sm text-gray-600">
                  Upload your business documents and certifications to enhance your marketplace presence and NoHarm score.
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'usage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('usage')}
                >
                  Usage
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'types'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('types')}
                >
                  File types
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'recommended'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('recommended')}
                >
                  Checklist
                </button>
              </div>
            </div>

            {/* Tab Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {activeTab === 'usage' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-900 mb-3">How we use your documents</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-blue-900">1. Marketplace profile enhancement</p>
                        <p className="text-sm text-blue-700">Your documents help build credibility and showcase your tool's capabilities, certifications, and unique selling points to potential buyers.</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">2. NoHarm score calculation</p>
                        <p className="text-sm text-blue-700">The information you provide helps us generate a more accurate NoHarm score, which reflects your tool's reliability and compliance standards.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        All documents are securely stored and can only be accessed by you and authorized NoHarm personnel.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'types' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Accepted file types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Documents</p>
                          <p className="text-xs text-gray-500">.pdf, .doc, .docx, .html</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Spreadsheets</p>
                          <p className="text-xs text-gray-500">.xls, .xlsx</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Images</p>
                          <p className="text-xs text-gray-500">.jpg, .png</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Videos</p>
                          <p className="text-xs text-gray-500">.mp4</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Maximum file size: 10MB per file</p>
                  </div>
                </div>
              )}

              {activeTab === 'recommended' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommended documents</h4>
                    <div className="space-y-2">
                      {[
                        'Business licenses & permits',
                        'Professional certifications',
                        'Tool specifications & documentation',
                        'Quality assurance certificates',
                        'Compliance documentation',
                        'Case studies & use cases',
                        'Technical architecture diagrams'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Note:</p>
                          <p>These documents are recommendations, not requirements. You can submit them now or later. The more documentation you provide, the stronger your marketplace profile will be.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 lg:p-6 border-t border-gray-100 mt-auto">
              <div className="text-xs text-gray-500">
                Need help? Contact support at
                <a href="mailto:mirza.ali@noharm.tech" className="text-blue-600 hover:text-blue-800 ml-1">
                  mirza.ali@noharm.tech
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50 lg:ml-0 ${
          isEditing ? 'border-l-4 border-blue-400' : ''
        }`}>
          {/* Header */}
          <div className="flex-shrink-0 p-4 md:p-8 lg:p-12 pb-0">
            <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold">Document upload</h1>
              {isEditing && (
                <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                  Completed
                </span>
              )}
            </div>
            {isEditing && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center text-blue-800">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">You're updating your documents. Any changes will be saved while maintaining this stage's completed status.</p>
              </div>
            )}
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:px-8 lg:px-12">
            {error && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6 md:mb-8">
              <input
                type="file"
                multiple
                accept={Object.values(ALLOWED_FILE_TYPES).join(',')}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="scale-50 origin-left -ml-3">
                      <LoadingSpinner />
                    </div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                    Upload documents
                  </>
                )}
              </label>
              <p className="mt-2 md:mt-3 text-xs md:text-sm text-gray-500">
                Accepted formats: PDF, Word, Excel, JPG, PNG, HTML, MP4 • Maximum size: 10MB per file
              </p>
            </div>

            {/* Uploaded Files List */}
            <div className="flex-1 border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="p-3 md:p-4 border-b border-gray-200">
                <h2 className="text-base md:text-lg font-medium text-gray-900">Uploaded documents</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Manage your uploaded documents here</p>
              </div>
              
              <div className="p-3 md:p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <FileText className="h-5 md:h-6 w-5 md:w-6 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm md:text-base">{file.name}</p>
                            <p className="text-xs md:text-sm text-gray-500">
                              {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDelete(file.name)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1.5 md:p-2 hover:bg-white rounded-full"
                        >
                          <Trash2 className="h-4 md:h-5 w-4 md:w-5" />
                        </button>
                      </div>
                    ))}

                    {uploadedFiles.length === 0 && (
                      <div className="text-center py-8 md:py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FileText className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-3 md:mb-4 text-gray-400" />
                        <p className="text-base md:text-lg font-medium">No documents uploaded yet</p>
                        <p className="text-xs md:text-sm mt-1">Upload your first document to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <div className="mx-auto w-full px-4 md:px-8 lg:px-12 py-3 md:py-4">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full md:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Button>
                <Button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={uploadedFiles.length === 0 || isCompleting}
                  className="w-full md:w-auto"
                >
                  {isEditing ? 'Save updates' : 'Complete section'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Welcome to document upload</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <div className="text-sm text-muted-foreground">
                  We're excited to learn more about your tool! The documents you provide here serve two important purposes:
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">1. Enhance your marketplace profile</h4>
                    <div className="text-sm text-blue-800">
                      Your documents help build trust with potential buyers by showcasing:
                    </div>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                      <li>How your tool is used in real scenarios</li>
                      <li>Your unique selling points and capabilities</li>
                      <li>Professional certifications and compliance</li>
                      <li>Success stories and use cases</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">2. Improve your NoHarm score</h4>
                    <div className="text-sm text-green-800">
                      The NoHarm score is our proprietary rating system that helps buyers assess tools. Your documentation helps us:
                    </div>
                    <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                      <li>Evaluate your tool's reliability</li>
                      <li>Verify compliance standards</li>
                      <li>Understand security measures</li>
                      <li>Calculate an accurate trust score</li>
                    </ul>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWelcomeDialog(false)}>
              Got it, let's start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Save document updates' : 'Complete document submission'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Your document updates will be saved while maintaining the "Completed" status of this stage. You can return and make more changes later if needed.'
                : 'Once you complete this submission, this stage will be marked as finished. You\'ll still be able to update your documents later if needed by using the "Update Information" button.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isCompleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSection}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <div className="mr-2">
                    <LoadingSpinner />
                  </div>
                  {isEditing ? 'Saving...' : 'Completing...'}
                </>
              ) : (
                isEditing ? 'Save Updates' : 'Complete Submission'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
