'use client';

import AllyProfile, { AllyProfileData, AllyProfileProps } from '@/components/matches/AllyProfile';
// import { Navbar } from '@/components/layout/Navbar'; // Assuming you have a Navbar - Commented out for now
// import { Footer } from '@/components/layout/Footer'; // Assuming you have a Footer - Commented out for now

// Comprehensive dummy data for AllyProfile
const dummyAllyData: AllyProfileData & { id: string } = {
  id: 'ally-profile-dummy-123',
  region: 'Global',
  name: 'EcoConsult Pro Services', // This is the AllyProfileData.name (service name)
  serviceOffered: 'Sustainability Strategy & Implementation',
  cost: {
    type: 'Project-Based',
    range: '$5,000 - $50,000+',
  },
  useCases: [
    'Carbon footprint analysis and reduction planning',
    'Circular economy model development',
    'ESG reporting and compliance advisory',
    'Supply chain sustainability optimization',
  ],
  clientTypesServed: [
    'Startups & SMEs in Green Tech',
    'Manufacturing Companies seeking efficiency',
    'Agricultural businesses',
  ],
  climateTechExperience: {
    years: 7,
    sectors: [
      'Renewable Energy Integration',
      'Waste Management Solutions',
      'Sustainable Agriculture',
      'Green Building Materials',
    ],
  },
  certificates: [
    {
      name: 'B Corp Certification',
      image: '/images/certificates/bcorp-logo.png', // Placeholder path
      status: 'Certified 2022',
    },
    {
      name: 'ISO 14001 Environmental Management',
      image: '/images/certificates/iso-logo.png', // Placeholder path
      status: 'Certified 2021',
    },
    {
      name: 'Climate Active Neutrality',
      image: '/images/certificates/climateactive-logo.png', // Placeholder path
      status: 'Pending 2024'
    }
  ],
  preferredStageOfInnovators: 'Early-stage to Growth-stage',
  successMetrics: 'Client CO2 reduction achieved, ROI on sustainable investments, Improved ESG scores',
  availability: 'Available for new projects from Q3 2024',
  companyInfo: { // This is the AllyProfileData.companyInfo (the Ally's own company)
    logo: '/images/placeholder-logo.jpg', // Placeholder path
    name: 'EcoConsult Solutions Ltd.', // Actual company name, could be same or different from service name
    website: 'www.ecoconsultpros.com',
    location: 'Berlin, Germany',
    description: 'EcoConsult Solutions Ltd. is a leading consultancy firm dedicated to helping businesses transition to sustainable and climate-friendly operations. We provide expert advice and hands-on support to drive impactful change.',
    foundedYear: 2017,
    operatingRegions: ['Europe', 'North America', 'Asia-Pacific'], // These are company operating regions, distinct from the profile's primary `region` field.
  },
  sidebarDescription: 'Expert consultancy for sustainability strategy, carbon reduction, and ESG reporting. Driving impactful green transitions for businesses.',
};

export default function TestAllyProfilePage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="flex-1 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar here too for consistency if needed */}
        {/* Removed outer main, container, and max-w divs to make AllyProfile fill the space */}
        <AllyProfile profile={dummyAllyData} className="h-full" /> {/* Ensure AllyProfile can expand if needed */}
      </div>
      {/* <Footer /> */}
    </div>
  );
} 