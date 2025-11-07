import { ProfileData } from './interfaces';

export const profiles: ProfileData[] = [
  {
    id: 'dcarbonize-1',
    name: 'D-Carbonize',
    data: {
      companyInfo: {
        logo: '/images/profiles/d-carbonize-logo.png',
        location: 'Brussels',
        website: 'https://d-carbonize.eu/',
        sustainabilityScore: 88,
        description: 'D-Carbonize helps organizations measure, plan, reduce, and report their carbon emissions using internationally recognized standards, driving sustainability and compliance with carbon reduction initiatives.',
        operatingRegions: ['Global'],
        foundedYear: 2021,
        scoreComponents: {
          technologyReadiness: 88,
          impactPotential: 90,
          marketViability: 85,
          regularityFit: 84,
          documentationAndVerification: 84,
          platformEngagement: 84,
          innovationType: 84
        }
      },
      toolInfo: {
        name: 'Carbon Cockpit Expert',
        description: 'Carbon Cockpit Expert is a comprehensive carbon accounting software designed to help businesses measure, plan, reduce, and report their carbon footprint. It provides tools for setting Science Based Targets (SBTi)-aligned goals, tracking progress, and implementing industry-specific carbon reduction actions. With an intuitive dashboard, users can assign tasks, monitor impact, and generate reports, making decarbonization strategic and actionable.',
        usp: [
          'Provides a comprehensive and real-time carbon footprint assessment for events',
          'Integrates visitor, exhibitor, and organizer emissions for a full event lifecycle analysis',
          'Developed by IEMA-certified sustainability professionals with deep industry expertise'
        ],
        category: 'Carbon Management',
        inProduction: true,
        technologies: [
          'Cloud Platform: Enables real-time data processing, remote accessibility, and seamless collaboration',
          'Data Analytics: Uses emission factor databases and sustainability metrics',
          'Visualization Tools: Generates interactive dashboards and reports',
          'API Integration: Connects with external travel, logistics, and carbon offsetting platforms'
        ],
        customerSupport: 'Business Hours Support',
        updateFrequency: 'Monthly',
        coverage: ['Corporate', 'SME', 'Supply Chain'],
        compliance: [
          'GHG Protocol',
          'SBTi',
          'ISO 14064',
          'PAS 2050'
        ]
      },
      companyName: 'D-Carbonize',
      howItWorks: {
        steps: [
          {
            title: 'Data Collection & Integration',
            description: 'The tool automatically collects emissions data from energy usage, transportation, and supply chain activities, integrating seamlessly with IoT devices, ERP, and CRM systems to ensure accurate and efficient data management while adhering to GHG Protocol and ISO 14064 standards.'
          },
          {
            title: 'Carbon Footprint Analysis & Target Setting',
            description: 'By analyzing Scope 1, 2, and 3 emissions, the platform provides a clear overview of an organization\'s carbon footprint, enables businesses to set Science-Based Targets (SBTi-aligned), and offers scenario modeling to evaluate different reduction strategies and create actionable decarbonization plans.'
          },
          {
            title: 'Actionable Reduction Strategies',
            description: 'The software suggests industry-specific carbon reduction actions, allows users to assign tasks, track progress, and monitor real-time impact, and provides automated alerts and interactive dashboards to ensure businesses stay on course to meet their sustainability goals.'
          },
          {
            title: 'Compliance & Reporting',
            description: 'With built-in compliance support, the tool generates automated reports aligned with CSRD, CDP, and TCFD regulations, offers custom dashboards for real-time emissions tracking, and enables businesses to easily export and share reports with stakeholders, investors, and regulators to demonstrate their carbon reduction progress.'
          }
        ]
      },
      useCases: [
        'Maintenance & Mobility',
        'Traffic Solutions & Emissions Management',
        'Office Furniture & Sustainability'
      ],
      sidebarDescription: 'Comprehensive carbon accounting software for measuring, planning, and reducing carbon emissions with Science Based Targets alignment.',
      toolDescription: {
        short: 'Carbon accounting software designed to measure, plan, and reduce carbon emissions in alignment with Science Based Targets.',
        long: 'Carbon Cockpit Expert is a comprehensive carbon accounting software designed to help businesses measure, plan, reduce, and report their carbon footprint. It provides tools for setting Science Based Targets (SBTi)-aligned goals, tracking progress, and implementing industry-specific carbon reduction actions. With an intuitive dashboard, users can assign tasks, monitor impact, and generate reports, making decarbonization strategic and actionable.'
      },
      ipStatus: ['Proprietary Technology', 'Trademark Protected'],
      certificates: [
        {
          name: 'B Corp Certification',
          status: 'Certified',
          image: '/images/certificates/b-corp-logo.png'
        },
        {
          name: 'ADEME\'s Bilan Carbone® Certification',
          status: 'Certified',
          image: ''
        },
        {
          name: 'Solar Impulse Efficient Solution Label',
          status: 'Certified',
          image: ''
        }
      ]
    },
    password: 'password123'
  },
  {
    id: 'greencircle-1',
    name: 'Green Circle Solutions',
    data: {
      companyInfo: {
        logo: '/images/profiles/green-circle-solutions-logo.png',
        location: 'Charlecote, Warwickshire, United Kingdom',
        website: 'greencirclesolutions.co.uk',
        sustainabilityScore: 85,
        description: 'Green Circle Solutions is a sustainability and carbon calculation company that provides expert guidance, tools, and training to help businesses integrate environmental and social responsibility. The company focuses on carbon footprint assessments for events, projects, and businesses, offering data-driven insights for sustainable decision-making.',
        operatingRegions: ['United Kingdom', 'Ireland', 'Europe'],
        foundedYear: 2020,
        scoreComponents: {
          technologyReadiness: 88,
          impactPotential: 90,
          marketViability: 82,
          regularityFit: 84,
          documentationAndVerification: 84,
          platformEngagement: 84,
          innovationType: 84
        }
      },
      toolInfo: {
        name: 'The GCS Event Calculator',
        description: 'Comprehensive sustainability management and ESG reporting platform',
        usp: [
          'Provides a comprehensive and real-time carbon footprint assessment for events',
          'Integrates visitor, exhibitor, and organizer emissions for a full event lifecycle analysis',
          'Developed by IEMA-certified sustainability professionals with deep industry expertise'
        ],
        category: 'Event Carbon Footprint Measurement',
        inProduction: true,
        technologies: ['Cloud Platform', 'Data Analytics', 'Visualization Tools', 'API Integration'],
        customerSupport: 'Business Hours',
        updateFrequency: 'Quarterly',
        coverage: ['Events', 'Exhibitions', 'Conferences'],
        compliance: ['GHG Protocol', 'IEMA', 'International sustainability and emissions reporting frameworks']
      },
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
      ipStatus: ['Proprietary Software', 'Trademark Protected'],
      certificates: [
        {
          name: 'Greenhouse Gas (GHG) Protocol',
          status: 'Compliant',
          image: '/images/certificates/ghg-logo.png'
        },
        {
          name: 'Streamlined Energy and Carbon Reporting (SECR)',
          status: 'Compliant',
          image: '/images/certificates/ukgov-logo.png'
        },
        {
          name: 'Science Based Targets initiative (SBTi)',
          status: 'Compliant',
          image: '/images/certificates/sbti-logo.jpg'
        },
        {
          name: 'DESNZ | DEFRA Conversion Factors',
          status: 'Compliant',
          image: '/images/certificates/ukgov-logo.png'
        },
        {
          name: 'Circular Ecology & Bath University Inventory of Carbon and Energy (ICE)',
          status: 'Compliant',
          image: ''
        }
      ]
    },
    password: 'password456'
  },
  {
    id: 'corsair-1',
    name: 'Corsair Group International',
    data: {
      companyInfo: {
        logo: '/images/profiles/corsair-logo.png',
        location: 'Bangkok, Thailand (Global HQ); Amsterdam, Netherlands (European HQ)',
        website: 'https://corsairgroup.com',
        sustainabilityScore: 85,
        description: 'Corsair is a chemical recycling company that converts plastic waste into pyrolysis oil, which can be used as a sustainable raw material for plastic manufacturing and the petrochemical industry. The company focuses on plastic waste reduction, CO2 emissions reduction, and circular economy solutions.',
        operatingRegions: [
          'Asia (Thailand, Indonesia, Cambodia, Philippines, Vietnam, Malaysia)',
          'Europe (Finland, Netherlands, Belgium, UK, France, Ireland, Serbia)',
          'North America (USA – Idaho, Colorado, Utah, Wyoming, Nevada)',
          'Latin America (Colombia, Brazil, Argentina, Uruguay)'
        ],
        foundedYear: 2020,
        scoreComponents: {
          technologyReadiness: 88,
          impactPotential: 90,
          marketViability: 82,
          regularityFit: 84,
          documentationAndVerification: 84,
          platformEngagement: 84,
          innovationType: 84
        }
      },
      toolInfo: {
        name: 'Corsair Pyrolysis System',
        description: 'Corsair employs pyrolysis technology to transform household plastic waste into pyrolysis oil. This oil can be refined into various fuels or used as a feedstock for creating new plastic products.',
        usp: [
          'Provides a comprehensive and real-time carbon footprint assessment for events',
          'Integrates visitor, exhibitor, and organizer emissions for a full event lifecycle analysis',
          'Developed by IEMA-certified sustainability professionals with deep industry expertise'
        ],
        category: 'Plastic Waste Recycling / Chemical Recycling',
        inProduction: true,
        technologies: [
          'Pyrolysis',
          'Catalytic Plastic Pyrolysis'
        ],
        customerSupport: 'Business Hours Support',
        updateFrequency: 'Quarterly',
        coverage: ['Plastic Manufacturing', 'Petrochemical Industry', 'Municipal Waste Management'],
        compliance: [
          'International Sustainability and Carbon Certification (ISCC)',
          'ISO 9001:2015',
          'ISO 14001'
        ]
      },
      companyName: 'Corsair Group International',
      howItWorks: {
        steps: [
          {
            title: 'Plastic Waste Collection',
            description: 'Gather household plastic waste, including used plastic bags, wrapping materials, and packaging products from municipal and industrial waste streams.'
          },
          {
            title: 'Sorting & Preparation',
            description: 'Clean and shred the collected plastic waste to prepare it for processing.'
          },
          {
            title: 'Pyrolysis',
            description: 'Heat the prepared plastic waste in the absence of oxygen, breaking it down into pyrolysis oil and other by-products.'
          },
          {
            title: 'Refining',
            description: 'Process the pyrolysis oil to produce fuels such as diesel, gasoline, and kerosene, or use it as a feedstock for new plastic products.'
          },
          {
            title: 'Distribution',
            description: 'Supply the refined products to partners, like Shell, for manufacturing circular chemicals used in various everyday products.'
          }
        ]
      },
      useCases: [
        'Plastic Manufacturing',
        'Petrochemical Industry',
        'Alternative Fuel Production',
        'Municipal Waste Management',
        'Corporate Sustainability Initiatives'
      ],
      sidebarDescription: 'Chemical recycling company transforming plastic waste into pyrolysis oil for sustainable manufacturing.',
      toolDescription: {
        short: 'Pyrolysis technology for transforming plastic waste into valuable resources.',
        long: 'Corsair employs pyrolysis technology to transform household plastic waste into pyrolysis oil. This oil can be refined into various fuels or used as a feedstock for creating new plastic products.'
      },
      ipStatus: ['Proprietary Technology', 'Trademark Protected'],
      certificates: [
        {
          name: 'International Sustainability and Carbon Certification (ISCC)',
          status: 'Certified',
          image: ''
        },
        {
          name: 'ISO 9001:2015',
          status: 'Certified',
          image: '/images/certificates/iso-logo.png'
        },
        {
          name: 'ISO 14001',
          status: 'Certified',
          image: '/images/certificates/iso-logo.png'
        }
      ]
    },
    password: 'password789'
  },
  {
    id: 'calor-e-1',
    name: 'Calor-e Oy',
    data: {
      companyInfo: {
        logo: '/images/profiles/calor-e-logo.png',
        location: 'Finland',
        website: 'www.calor-e.com',
        sustainabilityScore: 88,
        description: 'Calor-e is a brand developed by Unda Engineering Inc., specializing in thermal energy storage solutions for industrial, residential, and agricultural applications. The company focuses on carbon-neutral heating technologies, utilizing innovative thermal battery systems to store and release heat efficiently.',
        operatingRegions: ['Europe'],
        foundedYear: 2021,
        scoreComponents: {
          technologyReadiness: 88,
          impactPotential: 90,
          marketViability: 85,
          regularityFit: 84,
          documentationAndVerification: 84,
          platformEngagement: 84,
          innovationType: 84
        }
      },
      toolInfo: {
        name: 'Calor-e Thermal Energy Storage System',
        description: 'Calor-e is a thermal battery that efficiently converts excess electrical energy into heat, ensuring rapid and on-demand utilization. It is engineered to replace conventional coal and natural gas burners, offering a sustainable and eco-friendly alternative for heat generation in various applications.',
        usp: [
          'Fast Response Capacity: Capable of multiple charge and discharge cycles throughout the day',
          'Low Parasitic Loads and Energy Loss: Ensures efficient energy utilization with minimal waste',
          'Long Lifespan: Designed for a 25-year operational life',
          'Environmental Benefits: Reduces CO₂ emissions by approximately 3,500 tons per 1 MWe unit over its lifetime',
          'Sustainability: Constructed from 100% recyclable materials with a low environmental footprint'
        ],
        category: 'Thermal Energy Storage Systems',
        inProduction: true,
        technologies: [
          'Thermal Energy Storage: Stores excess electrical energy as heat for later use',
          'Modular and Scalable Design: Allows customization to meet specific energy requirements'
        ],
        customerSupport: 'Business Hours Support',
        updateFrequency: 'Quarterly',
        coverage: ['Industrial', 'Residential', 'Agricultural'],
        compliance: []
      },
      companyName: 'Calor-e Oy',
      howItWorks: {
        steps: [
          {
            title: 'Energy Conversion',
            description: 'Excess electrical energy, particularly from renewable sources, is converted into thermal energy.'
          },
          {
            title: 'Heat Storage',
            description: 'The generated thermal energy is stored within the Calor-e system\'s thermal batteries.'
          },
          {
            title: 'On-Demand Heat Release',
            description: 'When heating is required, the stored thermal energy is rapidly released to provide heat for industrial processes or other applications.'
          },
          {
            title: 'Recharge Cycle',
            description: 'The system can undergo multiple charge and discharge cycles daily, maintaining efficient energy storage and release.'
          }
        ]
      },
      useCases: [
        'Industrial Process Heating',
        'District Heating',
        'Renewable Energy Integration',
        'Commercial and Institutional Heating',
        'Remote and Off-Grid Energy Solutions'
      ],
      sidebarDescription: 'Thermal energy storage system for carbon-neutral heating solutions in industrial, residential, and agricultural applications.',
      toolDescription: {
        short: 'Thermal battery system for efficient energy storage and heat generation.',
        long: 'Calor-e is a thermal battery that efficiently converts excess electrical energy into heat, ensuring rapid and on-demand utilization. It is engineered to replace conventional coal and natural gas burners, offering a sustainable and eco-friendly alternative for heat generation in various applications.'
      },
      ipStatus: [],
      certificates: []
    },
    password: 'passwordabc'
  }
]; 