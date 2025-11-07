'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SellerProfile from '@/components/matches/SellerProfile';
import { ActionBar } from '@/components/matches/ActionBar';
import { ChevronRight, ArrowRight, X, Menu } from 'lucide-react';
import Image from 'next/image';
import { Certificate, HowItWorksStep, ProfileData } from '@/lib/interfaces';

export default function MatchesPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  // Check if running in an iframe
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      // If we can't access window.top due to security restrictions,
      // we're probably in a cross-origin iframe
      setIsInIframe(true);
    }
  }, []);

  // Handle post message communication with parent if in iframe
  useEffect(() => {
    if (!isInIframe) return;

    // Function to handle messages from parent
    const handleParentMessage = (event: MessageEvent) => {
      // Check for a valid origin if needed
      // if (event.origin !== "https://your-expected-origin.com") return;

      // Process messages from the parent
      if (event.data && event.data.type === 'REQUEST_STATE') {
        // Send current state to parent
        window.parent.postMessage({ 
          type: 'STATE_UPDATE',
          loading,
          selectedProfileId: selectedProfile?.id
        }, '*');
      }
      
      // Return false to indicate we're not handling asynchronously
      return false;
    };

    // Add message listener
    window.addEventListener('message', handleParentMessage);

    // Notify parent when iframe is ready
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    // Cleanup
    return () => {
      window.removeEventListener('message', handleParentMessage);
      
      // Notify parent when component is unmounting
      if (isInIframe) {
        window.parent.postMessage({ type: 'IFRAME_UNMOUNTING' }, '*');
      }
    };
  }, [isInIframe, loading, selectedProfile]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Dummy Profile 1: FutoCarbo - Carbon Management
        const profile1 = {
          id: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d',
          name: 'FutoCarbo',
          uuid: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d',
          data: {
            companyInfo: {
              logo: '/images/logos/demo-logo.jpg',
              location: 'Mexico City, Mexico',
              website: 'https://FutoCarbo.my',
              sustainabilityScore: 78,
              description: 'FutoCarbo is a pioneering climate tech company specializing in carbon capture and management solutions. Our innovative approach combines cutting-edge technology with practical sustainability measures to help industries reduce their carbon footprint.',
              operatingRegions: ['North America', 'Central America', 'South America'],
              foundedYear: 2018,
              scoreComponents: {
                technologyReadiness: 82,
                impactPotential: 85,
                marketViability: 72,
                regularityFit: 75,
                documentationAndVerification: 80,
                platformEngagement: 78,
                innovationType: 83
              }
            },
            toolInfo: {
              name: 'CarbonCalc Pro',
              description: 'An end-to-end solution for carbon footprint calculation and reduction strategy development',
              usp: ['Real-time carbon monitoring with IoT integration'],
              category: 'Carbon Management',
              inProduction: true,
              technologies: ['IoT Sensors', 'Cloud Computing', 'Machine Learning', 'Blockchain Verification'],
              customerSupport: 'Business Hours Support',
              updateFrequency: 'Quarterly',
              coverage: ['Industrial', 'Commercial', 'Agricultural'],
              compliance: ['GHG Protocol', 'ISO 14064', 'EU ETS']
            },
            certificates: [
              {
                name: 'ISO 14001',
                status: 'Certified',
                image: '/images/certificates/iso-logo.png'
              },
              {
                name: 'GHG Protocol',
                status: 'Compliant',
                image: '/images/certificates/ghg-logo.png'
              },
              {
                name: 'CDP Accredited',
                status: 'Partner',
                image: '/images/certificates/cdp-logo.png'
              }
            ],
            companyName: 'FutoCarbo',
            howItWorks: {
              steps: [
                {
                  title: 'Data Collection',
                  description: 'Automated data collection from IoT sensors and company systems to gather carbon emission data.'
                },
                {
                  title: 'Analysis & Calculation',
                  description: 'Advanced algorithms analyze the data to calculate accurate carbon footprints across all scopes.'
                },
                {
                  title: 'Reporting & Recommendations',
                  description: 'Comprehensive reports with actionable recommendations for carbon reduction strategies.'
                }
              ]
            },
            useCases: [
              'Industrial carbon footprint calculation',
              'Supply chain emissions tracking',
              'Regulatory compliance reporting',
              'Carbon reduction strategy development',
              'Environmental impact assessment'
            ],
            sidebarDescription: 'Carbon management platform with IoT integration for real-time monitoring and reduction strategies.',
            toolDescription: {
              short: 'End-to-end carbon monitoring solution',
              long: 'CarbonCalc Pro provides comprehensive carbon monitoring and management capabilities for organizations looking to measure, report, and reduce their environmental impact. The platform combines IoT sensors, advanced analytics, and reporting tools to deliver actionable insights.'
            },
            ipStatus: ['Proprietary', 'Patents Pending']
          },
          password: 'demo123'
        };

        // Dummy Profile 2: GreenMetrics - AI Sustainability Analytics
        const profile2 = {
          id: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d-2',
          name: 'GreenMetrics',
          uuid: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d-2',
          data: {
            companyInfo: {
              logo: '/images/logos/demo-logo2.jpg',
              location: 'San Francisco, California',
              website: 'https://greenmetrics.io',
              sustainabilityScore: 92,
              description: 'GreenMetrics is at the forefront of AI-powered sustainability tracking. We leverage artificial intelligence and machine learning to transform environmental data into actionable sustainability insights for forward-thinking organizations.',
              operatingRegions: ['North America', 'Europe', 'Australia'],
              foundedYear: 2020,
              scoreComponents: {
                technologyReadiness: 95,
                impactPotential: 90,
                marketViability: 88,
                regularityFit: 87,
                documentationAndVerification: 92,
                platformEngagement: 89,
                innovationType: 94
              }
            },
            toolInfo: {
              name: 'EcoMetrics AI',
              description: 'AI-powered platform for sustainability performance tracking and predictive analytics',
              usp: ['Predictive analytics for future emissions and resource usage'],
              category: 'Sustainability Analytics',
              inProduction: true,
              technologies: ['Artificial Intelligence', 'Machine Learning', 'Big Data Analytics', 'Cloud Computing'],
              customerSupport: '24/7 Premium Support',
              updateFrequency: 'Monthly',
              coverage: ['Corporate', 'Financial', 'Supply Chain'],
              compliance: ['SASB', 'GRI', 'TCFD', 'EU CSRD']
            },
            certificates: [
              {
                name: 'B Corp',
                status: 'Certified',
                image: '/images/certificates/iso-logo.png'
              },
              {
                name: 'ISO 14001',
                status: 'Certified',
                image: '/images/certificates/iso-logo.png'
              },
              {
                name: 'Carbon Neutral',
                status: 'Verified',
                image: '/images/certificates/cdp-logo.png'
              }
            ],
            companyName: 'GreenMetrics',
            howItWorks: {
              steps: [
                {
                  title: 'Data Integration',
                  description: 'Seamless integration with existing corporate systems to collect environmental and operational data.'
                },
                {
                  title: 'AI Analysis',
                  description: 'Advanced AI algorithms analyze patterns, identify opportunities, and generate predictive models.'
                },
                {
                  title: 'Visualization & Reporting',
                  description: 'Interactive dashboards and automated reports for internal teams and external stakeholders.'
                }
              ]
            },
            useCases: [
              'Predictive emissions forecasting',
              'ESG reporting automation',
              'Resource optimization planning',
              'Sustainability investment analysis',
              'Regulatory compliance tracking'
            ],
            sidebarDescription: 'AI-powered sustainability analytics platform for predictive environmental performance management.',
            toolDescription: {
              short: 'AI sustainability analytics solution',
              long: 'EcoMetrics AI transforms how organizations approach sustainability by providing predictive analytics and actionable insights. Our platform helps companies not only track current performance but anticipate future sustainability challenges and opportunities.'
            },
            ipStatus: ['Proprietary', 'AI Algorithms Patent Protected']
          },
          password: 'demo123'
        };

        // Dummy Profile 3: SustainIQ - Environmental Intelligence
        const profile3 = {
          id: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d-3',
          name: 'SustainIQ',
          uuid: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d-3',
          data: {
            companyInfo: {
              logo: '/images/logos/demo-logo3.jpg',
              location: 'Belfast, Northern Ireland',
              website: 'https://sustainiq.com',
              sustainabilityScore: 85,
              description: 'SustainIQ provides organizations with the tools and intelligence needed to make data-driven sustainability decisions. Our platform simplifies the complex process of environmental data collection, analysis, and reporting.',
              operatingRegions: ['United Kingdom', 'Ireland', 'Europe'],
              foundedYear: 2018,
              scoreComponents: {
                technologyReadiness: 82,
                impactPotential: 85,
                marketViability: 72,
                regularityFit: 75,
                documentationAndVerification: 80,
                platformEngagement: 78,
                innovationType: 83
              }
            },
            toolInfo: {
              name: 'SustainIQ Platform',
              description: 'Comprehensive sustainability management and ESG reporting platform',
              usp: ['All-in-one solution for sustainability data management and reporting'],
              category: 'ESG Management',
              inProduction: true,
              technologies: ['Cloud Platform', 'Data Analytics', 'Visualization Tools', 'API Integration'],
              customerSupport: 'Premium Support',
              updateFrequency: 'Monthly',
              coverage: ['Corporate', 'SME', 'Public Sector'],
              compliance: ['GRI', 'SASB', 'EU CSRD', 'TCFD']
            },
            certificates: [
              {
                name: 'ISO 14001',
                status: 'Certified',
                image: '/images/certificates/iso-logo.png'
              },
              {
                name: 'B Corp',
                status: 'Certified',
                image: '/images/certificates/iso-logo.png'
              },
              {
                name: 'ISAE 3000',
                status: 'Assured',
                image: '/images/certificates/ghg-logo.png'
              }
            ],
            companyName: 'SustainIQ',
            howItWorks: {
              steps: [
                {
                  title: 'Data Collection',
                  description: 'Streamlined collection of sustainability data from across your organization through intuitive interfaces.'
                },
                {
                  title: 'Analysis',
                  description: 'Powerful analytics engine processes data to generate insights and identify improvement opportunities.'
                },
                {
                  title: 'Reporting',
                  description: 'Automated generation of customizable reports aligned with major sustainability frameworks.'
                }
              ]
            },
            useCases: [
              'ESG performance measurement',
              'Sustainability strategy development',
              'Carbon footprint tracking',
              'Supply chain sustainability assessment',
              'Regulatory compliance reporting'
            ],
            sidebarDescription: 'Comprehensive sustainability management platform for data-driven environmental decision making.',
            toolDescription: {
              short: 'All-in-one sustainability management solution',
              long: 'The SustainIQ Platform simplifies sustainability management by providing a centralized system for data collection, analysis, and reporting. Our solution helps organizations of all sizes track environmental performance, meet compliance requirements, and drive meaningful sustainability improvements.'
            },
            ipStatus: ['Proprietary Software', 'Trademark Protected']
          },
          password: 'demo123'
        };

        // Dummy Profile 4: Green Circle Solutions - Event Carbon Footprint Measurement
        const profile4 = {
          id: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d-4',
          name: 'Green Circle Solutions',
          uuid: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d-4',
          data: {
            companyInfo: {
              logo: '/images/logos/demo-logo4.jpg',
              location: 'Charlecote, Warwickshire, United Kingdom',
              website: 'greencirclesolutions.co.uk',
              sustainabilityScore: 85,
              description: 'Green Circle Solutions is a sustainability and carbon calculation company that provides expert guidance, tools, and training to help businesses integrate environmental and social responsibility. The company focuses on carbon footprint assessments for events, projects, and businesses, offering data-driven insights for sustainable decision-making.',
              operatingRegions: ['United Kingdom', 'Ireland', 'Europe'],
              foundedYear: 2020,
              scoreComponents: {
                technologyReadiness: 82,
                impactPotential: 85,
                marketViability: 72,
                regularityFit: 75,
                documentationAndVerification: 80,
                platformEngagement: 78,
                innovationType: 83
              }
            },
            toolInfo: {
              name: 'The GCS Event Calculator',
              description: 'Comprehensive sustainability management and ESG reporting platform',
              usp: [
                'Provides a comprehensive and real-time carbon footprint assessment for events.',
                'Integrates visitor, exhibitor, and organizer emissions for a full event lifecycle analysis.',
                'Developed by IEMA-certified sustainability professionals with deep industry expertise.'
              ],
              category: 'Event Carbon Footprint Measurement',
              inProduction: true,
              technologies: ['Cloud Platform', 'Data Analytics', 'Visualization Tools', 'API Integration'],
              customerSupport: 'Business Hours',
              updateFrequency: 'Quarterly',
              coverage: ['Events', 'Exhibitions', 'Conferences'],
              compliance: ['GHG Protocol', 'IEMA', 'International sustainability and emissions reporting frameworks']
            },
            certificates: [],
            companyName: 'Green Circle Solutions',
            howItWorks: {
              steps: [
                {
                  title: 'Data Collection',
                  description: 'Organizers input event details, integrating data from visitor travel and project build calculators to map emissions from energy, logistics, materials, and catering.'
                },
                {
                  title: 'Carbon Calculation',
                  description: 'The tool applies standardized emission factors to generate real-time carbon footprint calculations for all event components.'
                },
                {
                  title: 'Analysis & Reporting',
                  description: 'A comprehensive breakdown of emissions is provided, with reports highlighting key contributors and comparative insights for scenario assessment.'
                },
                {
                  title: 'Optimization & Action',
                  description: 'The platform suggests strategies for reducing emissions, setting sustainability targets, and integrating carbon offsetting options.'
                },
                {
                  title: 'Stakeholder Engagement',
                  description: 'Customizable reports and a customer-facing calculator help exhibitors, visitors, and organizers track and communicate sustainability efforts.'
                }
              ]
            },
            useCases: [
              'Corporate Conferences & Summits',
              'Trade Shows & Exhibitions',
              'Music & Entertainment Festivals',
              'Government & Public Sector Events',
              'Sustainability & Climate Conferences'
            ],
            sidebarDescription: 'A carbon footprint measurement tool designed specifically for conferences, projects, exhibitions, and events. It enables organizers to assess and manage emissions across the entire event supply chain, including visitor travel, logistics, energy use, materials, and catering.',
            toolDescription: {
              short: 'A comprehensive carbon calculator for events that provides real-time analysis and actionable insights to reduce environmental impact and promote sustainable practices.',
              long: 'The GCS Event Calculator is a specialized tool designed by qualified sustainability professionals to help event organizers accurately measure and manage their carbon footprint. The calculator integrates data from visitors, exhibitors, and organizers to provide a complete lifecycle analysis of an event\'s environmental impact. It offers data-driven insights for decision-making, supports compliance with environmental frameworks, and enables organizations to communicate their sustainability efforts effectively to stakeholders. The tool is built on industry expertise and supports businesses in embedding sustainability into their event planning and execution.'
            },
            ipStatus: ['Proprietary Software', 'Trademark Protected']
          },
          password: 'demo123'
        };

        setProfiles([profile1, profile2, profile3, profile4]);
        setSelectedProfile(profile1); // Select the first profile by default
      } catch (error) {
        console.error('Error setting up profiles:', error);
      } finally {
        setLoading(false);
        
        // Notify parent frame that loading is complete if in iframe
        if (isInIframe) {
          window.parent.postMessage({ type: 'LOADING_COMPLETE' }, '*');
        }
      }
    };

    fetchProfiles();
  }, [isInIframe]);

  const handleScheduleCall = () => {
    console.log('Schedule call with:', selectedProfile?.data?.companyName);
  };

  const handleContactSeller = () => {
    console.log('Contact seller at:', selectedProfile?.data?.companyInfo?.website);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-[100] p-2 rounded-lg bg-black text-white hover:bg-black/90 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[90]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left sidebar - Profile List */}
      <div className={`fixed lg:relative ${isSidebarCollapsed ? 'w-0' : 'w-[300px] lg:w-[320px]'} h-full overflow-y-auto bg-white shadow-lg z-[130] transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full w-full lg:w-[280px] mx-auto px-4 lg:px-0 pt-6 lg:pt-8 flex flex-col relative">
          {/* Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-8 p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>

          <div className="flex-shrink-0 mb-6 lg:mb-8">
            <div className="flex items-center space-x-3">
              <img src="/images/logos/new-iconlogo-white.png" alt="Icon Logo" className="h-8 lg:h-10 w-8 lg:w-10 rounded-full brightness-0" />
              <h1 className="text-2xl lg:text-3xl font-bold text-black">Matches</h1>
            </div>
            <p className="mt-2 text-gray-600 text-sm lg:text-base">Explore your matched profiles</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-3">
            <div className="flex flex-col space-y-3">
              {profiles.map((profile, index) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setSelectedProfile(profile);
                    setIsSidebarOpen(false);
                  }}
                  className={`group flex flex-col w-full px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                    selectedProfile?.id === profile.id
                      ? 'bg-[#53a300]/5 border border-[#53a300] shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <h2 className={`text-base lg:text-lg font-medium tracking-wide break-words mb-2 text-left ${
                    selectedProfile?.id === profile.id ? 'text-black' : 'text-gray-900'
                  }`}>
                    {profile.data?.toolInfo?.name || 'Climate Tech Solution'}
                  </h2>
                  
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="relative w-6 h-6 lg:w-8 lg:h-8 rounded-full flex-shrink-0 mr-2">
                        <Image
                          src={profile.data?.companyInfo?.logo || '/images/placeholder-logo.jpg'}
                          alt="Company Logo"
                          fill
                          className="object-contain rounded-full p-0.5 bg-white border border-gray-200"
                        />
                      </div>
                      <span className={`text-sm lg:text-base ${
                        selectedProfile?.id === profile.id ? 'text-gray-700' : 'text-gray-600'
                      } truncate`}>
                        {profile.data?.companyName || 'Company Name'}
                      </span>
                    </div>
                    
                    <ArrowRight className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ml-2 ${
                      selectedProfile?.id === profile.id ? 'text-[#53a300]' : 'text-gray-400'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Show Sidebar Button */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-r-lg hover:bg-gray-50 transition-all duration-200 z-[140] w-8 h-[120px] justify-center items-center"
        >
          <span className="text-xs font-medium text-gray-600 -rotate-90 whitespace-nowrap">
            View all matches
          </span>
        </button>
      )}

      {/* Main content - Profile Preview */}
      <div className="flex-1 flex flex-col h-screen">
        {selectedProfile ? (
          <>
            <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-104px)] overflow-y-auto">
              <SellerProfile 
                profile={selectedProfile} 
                className=""
              />
            </div>
            <div className="h-[120px] lg:h-[104px] flex-shrink-0 relative z-[120] bg-gray-50">
              <ActionBar
                onScheduleCall={handleScheduleCall}
                onContactSeller={handleContactSeller}
                companyName={selectedProfile.data?.companyName || 'Company Name'}
                companyLogo={selectedProfile.data?.companyInfo?.logo || '/images/placeholder-logo.jpg'}
                toolName={selectedProfile.data?.toolInfo?.name || 'Climate Tech Solution'}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a profile to view details</p>
          </div>
        )}
      </div>
    </div>
  );
} 