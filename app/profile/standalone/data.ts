// Profile data types
export interface Certificate {
  name: string;
  status: string;
  image?: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface ProfileData {
  uuid: string;
  data: {
    companyInfo: {
      logo: string;
      location: string;
      website: string;
      sustainabilityScore: number;
      description: string;
      operatingRegions: string[];
      foundedYear: number;
      scoreComponents: {
        technologyReadiness: number;
        impactPotential: number;
        marketViability: number;
        regularityFit: number;
        documentationAndVerification: number;
        platformEngagement: number;
        innovationType: number;
      };
    };
    toolInfo: {
      name: string;
      description: string;
      usp: string[];
      category: string;
      inProduction: boolean;
      technologies: string[];
      customerSupport: string;
      updateFrequency: string;
      coverage: string[];
      compliance: string[];
    };
    certificates: Certificate[];
    companyName: string;
    howItWorks: {
      steps: HowItWorksStep[];
    };
    useCases: string[];
    sidebarDescription: string;
    toolDescription: {
      short: string;
      long: string;
    };
    ipStatus: string[];
  };
  status: string;
  role: string;
  email?: string;
}

// EcoSense Technologies profile data
export const ecosenseProfile: ProfileData = {
  uuid: 'd6f3fbb0-63bb-41be-bab5-6378b703bb6d',
  data: {
    companyInfo: {
      logo: '/images/logos/demo-logo.jpg',
      location: 'Stockholm, Sweden',
      website: 'https://ecosense.tech',
      sustainabilityScore: 92,
      description: 'EcoSense Technologies is a leading climate tech innovator with a mission to transform how organizations measure, manage, and reduce their environmental impact. Founded by environmental scientists and technology experts, our company leverages advanced analytics, IoT systems, and AI-powered insights to provide comprehensive carbon management solutions for industries worldwide. We work with multinational corporations, governmental agencies, and educational institutions to deliver measurable sustainability outcomes that benefit both business operations and our planet.',
      operatingRegions: ['Europe', 'North America', 'Asia-Pacific', 'Middle East'],
      foundedYear: 2016,
      scoreComponents: {
        technologyReadiness: 95,
        impactPotential: 94,
        marketViability: 88,
        regularityFit: 90,
        documentationAndVerification: 90,
        platformEngagement: 88,
        innovationType: 90
      },
    },
    toolInfo: {
      name: 'EcoMetrics Platform',
      description: 'A comprehensive enterprise-grade carbon accounting and sustainability management platform that combines real-time monitoring, advanced analytics, and actionable insights to help organizations achieve their sustainability goals',
      usp: [
        'Real-time carbon monitoring with distributed IoT sensor network and cloud integration',
        'AI-powered predictive analytics for emissions forecasting and reduction strategy optimization',
        'Automated ESG reporting aligned with all major sustainability frameworks and regulations',
        'Digital twin technology for scenario planning and sustainability investment analysis'
      ],
      category: 'Integrated Sustainability Management',
      inProduction: true,
      technologies: ['Advanced IoT Sensors', 'Artificial Intelligence', 'Machine Learning', 'Cloud Computing', 'Distributed Ledger Technology', 'Digital Twin Modeling'],
      customerSupport: '24/7 Premium Technical Support',
      updateFrequency: 'Monthly feature updates with quarterly major releases',
      coverage: ['Corporate', 'Industrial', 'Supply Chain', 'Energy', 'Transportation', 'Buildings'],
      compliance: ['GHG Protocol', 'ISO 14064', 'EU CSRD', 'TCFD', 'SASB', 'CDP', 'GRI', 'SBTi']
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
        image: '/images/certificates/b-corp-logo.png'
      },
      {
        name: 'CDP Accredited Solution Provider',
        status: 'Gold Status',
        image: '/images/certificates/cdp-logo.png'
      },
      {
        name: 'GHG Protocol',
        status: 'Verified',
        image: '/images/certificates/ghg-logo.png'
      }
    ],
    companyName: 'EcoSense Technologies',
    howItWorks: {
      steps: [
        {
          title: 'Data Collection & Integration',
          description: 'Our platform collects sustainability data from IoT sensors, enterprise systems, and supply chain partners. This ensures comprehensive coverage across all emission scopes.'
        },
        {
          title: 'Advanced Analytics & Processing',
          description: 'Using machine learning models, the platform processes data through our carbon accounting engine, with automated categorization and validation to ensure accuracy of sustainability metrics.'
        },
        {
          title: 'Insight Generation & Visualization',
          description: 'Interactive dashboards transform data into actionable insights. Our digital twin modeling enables scenario analysis to identify optimal sustainability strategies.'
        },
        {
          title: 'Strategy & Implementation',
          description: 'The platform generates tailored recommendations for emissions reduction and sustainability initiatives, with tools to track implementation progress and measure outcomes.'
        }
      ]
    },
    useCases: [
      'Enterprise-wide carbon footprint measurement and management',
      'Science-based targets setting and progress tracking',
      'ESG reporting and regulatory compliance automation',
      'Supply chain sustainability optimization',
      'Climate risk assessment and mitigation planning',
      'Sustainability ROI analysis and resource allocation optimization',
      'Net-zero transition strategy development and implementation'
    ],
    sidebarDescription: 'A comprehensive sustainability intelligence platform that integrates IoT sensor networks, advanced analytics, and AI-powered recommendations to help organizations measure, manage, and reduce their environmental impact across operations and supply chains.',
    toolDescription: {
      short: 'EcoMetrics Platform is an enterprise-grade sustainability management solution that provides end-to-end capabilities for carbon accounting, ESG reporting, and environmental performance optimization.',
      long: 'The EcoMetrics Platform redefines how organizations approach sustainability by providing a comprehensive suite of tools for measuring, reporting, and improving environmental performance. Through our proprietary combination of hardware sensors, cloud infrastructure, and AI analytics, we deliver unprecedented accuracy in carbon accounting across Scope 1, 2, and 3 emissions. The platform includes automated data collection, real-time monitoring, predictive analytics, regulatory reporting, and strategic planning capabilities—all within a unified ecosystem designed for cross-functional collaboration. Our solution helps sustainability leaders, executives, and operational teams transform environmental commitments into measurable outcomes while driving business value through increased efficiency, risk mitigation, and stakeholder trust.'
    },
    ipStatus: ['Proprietary Technology', 'Multiple Patents (Granted & Pending)', 'Registered Trademarks']
  },
  status: 'active',
  role: 'seller',
  email: 'partnerships@ecosense.tech'
}; 