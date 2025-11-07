'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import PreviewSidebar from '@/components/layout/PreviewSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import dummyData from '@/lib/data/profile-dummy-data.json';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileEdit, Globe, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface ProfileData {
  uuid: string;
  data: Record<string, any>;
  status: string;
  role: string;
  email?: string;
}

interface ToolInfo {
  name: string;
  description: string;
  usp: string;
  category: string;
  inProduction: boolean;
  technologies: string[];
  customerSupport: string;
  updateFrequency: string;
  coverage: string[];
  compliance: string[];
}

interface CompanyInfo {
  logo: string;
  location: string;
  website: string;
  sustainabilityScore: number;
  description: string;
  operatingRegions: string[];
  foundedYear: number;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

// Type assertion for dummy data to ensure it matches our interfaces
const typedDummyData = dummyData as {
  toolInfo: ToolInfo;
  certificates: Certificate[];
};

// Add this new component for the gradient background
const GradientBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 opacity-90" />
    <div className="absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 bg-green-50 opacity-20 blur-3xl" />
  </div>
);

export default function PreviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [toolInfo, setToolInfo] = useState<ToolInfo | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('seller_compound_data')
          .select('*')
          .eq('uuid', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfileData(profile);

        // Extract company information from profile data
        const companyData = {
          logo: profile.data?.companyLogo || '/images/placeholder-logo.jpg',
          location: profile.data?.detailForm?.companyLocation || 'Not specified',
          website: profile.data?.detailForm?.companyWebsite || 'https://noharm.tech/profile/preview',
          sustainabilityScore: profile.data?.sustainabilityScore || 75,
          description: profile.data?.detailForm?.companyDescription || 'A pioneering climate tech company dedicated to developing innovative solutions for environmental challenges.',
          operatingRegions: profile.data?.detailForm?.operatingRegions || ['Europe', 'North America', 'Asia Pacific'],
          foundedYear: profile.data?.detailForm?.foundedYear || 2020
        };
        setCompanyInfo(companyData);

        // Set tool information, prioritizing database values
        const toolData = {
          name: profile.data?.toolInfo?.name || typedDummyData.toolInfo.name,
          description: profile.data?.toolInfo?.description || typedDummyData.toolInfo.description,
          usp: profile.data?.toolInfo?.usp || typedDummyData.toolInfo.usp,
          category: profile.data?.toolInfo?.category || typedDummyData.toolInfo.category,
          inProduction: profile.data?.toolInfo?.inProduction ?? typedDummyData.toolInfo.inProduction,
          technologies: profile.data?.toolInfo?.technologies || ['AI/ML', 'Cloud Computing', 'IoT', 'Blockchain'],
          customerSupport: profile.data?.toolInfo?.customerSupport || '24/7 Email and Chat Support',
          updateFrequency: profile.data?.toolInfo?.updateFrequency || 'Monthly',
          coverage: profile.data?.toolInfo?.coverage || ['Carbon Emissions', 'Energy Usage', 'Waste Management'],
          compliance: profile.data?.toolInfo?.compliance || ['ISO 14001', 'GHG Protocol', 'EU Green Deal']
        };
        setToolInfo(toolData);

        // Set certificates, combining database and dummy data if needed
        const certificatesData = profile.data?.certificates || typedDummyData.certificates;
        setCertificates(certificatesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const getSustainabilityScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleRequestEdit = () => {
    router.push('/profile/request-edit');
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left sidebar */}
      <div className="fixed inset-y-0 left-0">
        <PreviewSidebar userEmail={profileData?.email || ''} userRole={profileData?.role || ''} />
      </div>

      {/* Main content */}
      <div className="flex-1 ml-[240px] mr-[320px]">
        <GradientBackground />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Collapsible Header */}
          <div 
            className={`fixed top-0 left-[240px] right-[320px] bg-white/80 backdrop-blur-sm z-10 transition-all duration-300 border-b border-gray-200
              ${isHeaderCollapsed ? '-translate-y-full' : 'translate-y-0'}`}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">Profile Preview</h1>
                    <p className="text-sm text-gray-500">View and manage your company profile information</p>
                  </div>
                  <Button onClick={handleRequestEdit} variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                    <FileEdit className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                  className="text-gray-500"
                >
                  {isHeaderCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Expand button when header is collapsed */}
          <div 
            className={`fixed top-0 left-[240px] right-[320px] z-10 transition-all duration-300
              ${isHeaderCollapsed ? 'translate-y-0' : '-translate-y-full'}`}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHeaderCollapsed(false)}
                className="text-gray-500"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content with padding to account for fixed header */}
          <div className={`transition-all duration-300 ${isHeaderCollapsed ? 'pt-12' : 'pt-32'}`}>
            {/* Tool Information */}
            <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100 bg-white/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{toolInfo?.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">NoHarm Score</span>
                    <div className={`flex items-center px-2 py-1 rounded-md ${
                      (companyInfo?.sustainabilityScore || 0) >= 80 ? 'bg-green-100 text-green-700' :
                      (companyInfo?.sustainabilityScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className="text-lg font-semibold">{companyInfo?.sustainabilityScore || 0}</span>
                      <span className="text-xs ml-1 opacity-75">/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Badge 
                    variant="secondary" 
                    className={`px-3 py-0.5 text-xs ${
                      toolInfo?.inProduction ? 'bg-emerald-100 text-emerald-800' : ''
                    }`}
                  >
                    {toolInfo?.inProduction ? 'In Production' : 'In Development'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{toolInfo?.description}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* USP Section - Highlighted */}
                  <div className="bg-emerald-50 rounded-xl p-6 border-l-4 border-emerald-500">
                    <p className="text-emerald-700 text-sm font-semibold mb-2">Unique Selling Point</p>
                    <p className="text-base text-gray-900 font-medium leading-relaxed">{toolInfo?.usp}</p>
                  </div>

                  {/* Tool Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Technologies</p>
                      <div className="flex flex-wrap gap-2">
                        {toolInfo?.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Customer Support</p>
                      <p className="text-sm text-gray-900 font-medium">{toolInfo?.customerSupport}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Update Frequency</p>
                      <p className="text-sm text-gray-900 font-medium">{toolInfo?.updateFrequency}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Coverage</p>
                      <div className="flex flex-wrap gap-2">
                        {toolInfo?.coverage.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 col-span-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Compliance</p>
                      <div className="flex flex-wrap gap-2">
                        {toolInfo?.compliance.map((standard, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {standard}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100 bg-white/50">
                <CardTitle className="text-lg font-semibold">Climate Tech Certificates</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div 
                      key={cert.id} 
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">{cert.name}</h4>
                          <Badge variant={
                            cert.status === 'active' ? "secondary" :
                            cert.status === 'pending' ? "default" :
                            cert.status === 'expired' ? "destructive" :
                            "outline"
                          } className={`px-2 py-0.5 text-xs ${
                            cert.status === 'active' ? 'bg-green-100 text-green-800' :
                            cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            ''
                          }`}>
                            {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Issued by {cert.issuer}</p>
                        <div className="text-xs text-gray-500">
                          Valid from {new Date(cert.dateIssued).toLocaleDateString()} to {new Date(cert.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right sidebar - Company Information */}
      <div className="fixed inset-y-0 right-0 w-[320px] bg-white border-l border-gray-200 overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={companyInfo?.logo || '/images/placeholder-logo.png'}
                alt="Company Logo"
                fill
                className="object-contain rounded-lg border border-gray-200 bg-white p-1"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profileData?.data?.detailForm?.companyName || 'Company Name'}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
            <div className="flex items-center text-sm text-gray-900">
              <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
              {companyInfo?.location}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Website</p>
            <div className="flex items-center text-sm">
              <Globe className="w-4 h-4 mr-1.5 text-gray-400" />
              <a 
                href={companyInfo?.website.startsWith('http') ? companyInfo?.website : `https://${companyInfo?.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {companyInfo?.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">About</p>
            <p className="text-sm text-gray-900">{companyInfo?.description}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Operating Regions</p>
            <div className="flex flex-wrap gap-1.5">
              {companyInfo?.operatingRegions.map((region, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Founded</p>
            <p className="text-sm font-medium text-gray-900">{companyInfo?.foundedYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 