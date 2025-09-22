'use client';

import { useState, useEffect } from 'react';
import { County } from '../types';

interface Program {
  id: string;
  name: string;
  agency: string;
  type: 'loan' | 'grant' | 'tax_credit' | 'insurance' | 'technical_assistance' | 'emergency';
  entity_types: string[];
  description: string;
  benefits: string[];
  eligibility: string[];
  application_window: string;
  funding_range: string;
  website: string;
  contact: string;
  disaster_specific: boolean;
  priority_score: number;
}

interface ProgramMatcherProps {
  county: County;
  entityType: 'agriculture' | 'small-business';
  userProfile?: any;
  riskFactors?: string[];
  onClose: () => void;
}

export default function ProgramMatcher({ county, entityType, userProfile, riskFactors, onClose }: ProgramMatcherProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'grants' | 'loans' | 'assistance'>('all');

  useEffect(() => {
    loadPrograms();
  }, [entityType]);

  const loadPrograms = async () => {
    setLoading(true);
    
    // Simulated program database - in real implementation this would come from API
    const allPrograms: Program[] = entityType === 'agriculture' ? [
      {
        id: 'usda-eqip',
        name: 'Environmental Quality Incentives Program (EQIP)',
        agency: 'USDA NRCS',
        type: 'grant',
        entity_types: ['agriculture'],
        description: 'Financial and technical assistance for conservation practices',
        benefits: ['Up to $200,000 over 6 years', 'Cost-share payments', 'Technical assistance'],
        eligibility: ['Agricultural producers', 'Forest landowners', 'Must have eligible land'],
        application_window: 'Multiple deadlines annually',
        funding_range: '$1,500 - $200,000',
        website: 'https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives-program/eqip-application-process',
        contact: 'Local NRCS office',
        disaster_specific: false,
        priority_score: 85
      },
      {
        id: 'usda-em-loan',
        name: 'Emergency Loan Program',
        agency: 'USDA FSA',
        type: 'loan',
        entity_types: ['agriculture'],
        description: 'Low-interest loans for producers to cover losses from natural disasters',
        benefits: ['3.75% interest rate', 'Up to $500,000', 'Flexible repayment'],
        eligibility: ['Must be in disaster-declared county', 'Farming experience required', 'Cannot obtain credit elsewhere'],
        application_window: '8 months after disaster declaration',
        funding_range: 'Up to $500,000',
        website: 'https://www.farmers.gov/loans/emergency',
        contact: 'Local FSA office',
        disaster_specific: true,
        priority_score: 90
      },
      {
        id: 'crop-insurance',
        name: 'Federal Crop Insurance',
        agency: 'USDA RMA',
        type: 'insurance',
        entity_types: ['agriculture'],
        description: 'Crop insurance protection against natural disasters and market volatility',
        benefits: ['Premium subsidies up to 62%', 'Multiple coverage options', 'Prevented planting coverage'],
        eligibility: ['Must plant insurable crops', 'Comply with conservation requirements', 'Meet planting deadlines'],
        application_window: 'March 15 deadline (varies by crop)',
        funding_range: 'Varies by coverage level',
        website: 'https://www.rma.usda.gov/en/Information-Tools/Agent-Locator-Page',
        contact: 'Authorized insurance agent',
        disaster_specific: false,
        priority_score: 95
      },
      {
        id: 'sare-grants',
        name: 'Sustainable Agriculture Research & Education',
        agency: 'USDA SARE',
        type: 'grant',
        entity_types: ['agriculture'],
        description: 'Grants for sustainable farming practices and research',
        benefits: ['Producer grants up to $25,000', 'Professional development grants', 'Research support'],
        eligibility: ['Agricultural producers', 'Researchers', 'Educators'],
        application_window: 'Fall deadline annually',
        funding_range: '$500 - $25,000',
        website: 'https://www.sare.org/',
        contact: 'Regional SARE office',
        disaster_specific: false,
        priority_score: 70
      },
      {
        id: 'nc-agdf',
        name: 'NC Agricultural Development Fund',
        agency: 'NC Department of Agriculture',
        type: 'grant',
        entity_types: ['agriculture'],
        description: 'State grants for agricultural development and marketing',
        benefits: ['Marketing assistance', 'Infrastructure development', 'Technology adoption'],
        eligibility: ['NC agricultural producers', 'Agricultural businesses', 'Cooperatives'],
        application_window: 'Quarterly deadlines',
        funding_range: '$5,000 - $100,000',
        website: 'https://www.ncagr.gov/',
        contact: 'NC Dept of Agriculture',
        disaster_specific: false,
        priority_score: 75
      }
    ] : [
      {
        id: 'sba-disaster-loan',
        name: 'SBA Disaster Loans',
        agency: 'Small Business Administration',
        type: 'loan',
        entity_types: ['small-business'],
        description: 'Low-interest loans for businesses affected by declared disasters',
        benefits: ['Up to $2 million for businesses', '4% interest rate or less', 'Up to 30-year terms'],
        eligibility: ['Located in disaster area', 'Suffered substantial economic injury', 'Unable to obtain credit elsewhere'],
        application_window: 'Apply within deadline after disaster declaration',
        funding_range: 'Up to $2,000,000',
        website: 'https://disasterloanassistance.sba.gov/ela/s/application-information',
        contact: 'SBA Disaster Assistance',
        disaster_specific: true,
        priority_score: 95
      },
      {
        id: 'sba-7a-loan',
        name: 'SBA 7(a) Loan Program',
        agency: 'Small Business Administration',
        type: 'loan',
        entity_types: ['small-business'],
        description: 'General purpose loans for small business operations',
        benefits: ['Up to $5 million', 'Lower down payments', 'Competitive rates'],
        eligibility: ['Must meet SBA size standards', 'For-profit business', 'Good credit history'],
        application_window: 'Year-round',
        funding_range: '$500 - $5,000,000',
        website: 'https://www.sba.gov/partners/lenders/7a-loan-program/types-7a-loans',
        contact: 'SBA preferred lender',
        disaster_specific: false,
        priority_score: 80
      },
      {
        id: 'score-mentoring',
        name: 'SCORE Business Mentoring',
        agency: 'SBA Partner',
        type: 'technical_assistance',
        entity_types: ['small-business'],
        description: 'Free business mentoring and workshops',
        benefits: ['One-on-one mentoring', 'Workshops and webinars', 'Resource library'],
        eligibility: ['Any small business owner', 'Entrepreneurs', 'Prospective business owners'],
        application_window: 'Year-round',
        funding_range: 'Free',
        website: 'https://www.score.org/find-mentor',
        contact: 'Local SCORE chapter',
        disaster_specific: false,
        priority_score: 85
      },
      {
        id: 'nc-rural-grants',
        name: 'NC Rural Economic Development',
        agency: 'NC Rural Center',
        type: 'grant',
        entity_types: ['small-business'],
        description: 'Grants for rural business development',
        benefits: ['Business development grants', 'Infrastructure support', 'Technical assistance'],
        eligibility: ['Located in rural NC county', 'Create jobs', 'Economic impact'],
        application_window: 'Quarterly deadlines',
        funding_range: '$10,000 - $500,000',
        website: 'https://www.ncruralcenter.org/',
        contact: 'NC Rural Center',
        disaster_specific: false,
        priority_score: 70
      },
      {
        id: 'eidl-loan',
        name: 'Economic Injury Disaster Loan',
        agency: 'Small Business Administration',
        type: 'loan',
        entity_types: ['small-business'],
        description: 'Working capital loans for economic injury from disasters',
        benefits: ['Up to $2 million', 'Low interest rates', 'Long-term repayment'],
        eligibility: ['Economic injury from disaster', 'Unable to obtain credit elsewhere', 'Located in disaster area'],
        application_window: 'Varies by disaster declaration',
        funding_range: 'Up to $2,000,000',
        website: 'https://disasterloanassistance.sba.gov/ela/s/economic-injury-disaster-loan',
        contact: 'SBA Disaster Assistance',
        disaster_specific: true,
        priority_score: 90
      }
    ];

    // Score and filter programs based on user profile and risk factors
    const scoredPrograms = allPrograms.map(program => ({
      ...program,
      priority_score: calculatePriorityScore(program, userProfile, riskFactors)
    })).sort((a, b) => b.priority_score - a.priority_score);

    setPrograms(scoredPrograms);
    setFilteredPrograms(scoredPrograms);
    setLoading(false);
  };

  const calculatePriorityScore = (program: Program, profile: any, risks: string[] = []): number => {
    let score = program.priority_score;

    // Boost disaster-specific programs if relevant risks are present
    if (program.disaster_specific && risks.some(risk => 
      risk.includes('disaster') || risk.includes('weather') || risk.includes('emergency')
    )) {
      score += 15;
    }

    // Boost based on user profile
    if (profile) {
      // Revenue-based scoring
      const revenue = profile.revenue_range;
      if (revenue === 'Under $50,000' && program.funding_range.includes('$25,000')) {
        score += 10;
      }
      
      // Risk-based scoring
      const selectedRisks = profile.key_risks || [];
      if (selectedRisks.includes('Market price volatility') && program.type === 'insurance') {
        score += 10;
      }
      if (selectedRisks.includes('Equipment failures') && program.name.includes('Emergency')) {
        score += 10;
      }
    }

    return Math.min(100, score);
  };

  const filterPrograms = (type: string) => {
    if (type === 'all') {
      setFilteredPrograms(programs);
    } else {
      const typeMapping: Record<string, string[]> = {
        'grants': ['grant'],
        'loans': ['loan'],
        'assistance': ['technical_assistance', 'insurance']
      };
      
      const filtered = programs.filter(p => typeMapping[type]?.includes(p.type));
      setFilteredPrograms(filtered);
    }
    setActiveTab(type as any);
  };

  const getProgramTypeIcon = (type: string) => {
    switch (type) {
      case 'grant': return 'GRANT';
      case 'loan': return 'LOAN';
      case 'insurance': return 'INSURANCE';
      case 'technical_assistance': return 'ASSISTANCE';
      case 'emergency': return 'EMERGENCY';
      case 'tax_credit': return 'TAX CREDIT';
      default: return 'PROGRAM';
    }
  };

  const getProgramTypeColor = (type: string) => {
    switch (type) {
      case 'grant': return 'bg-green-100 text-green-800';
      case 'loan': return 'bg-blue-100 text-blue-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      case 'technical_assistance': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'tax_credit': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding relevant programs for your {entityType}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Government Program Matching</h2>
              <p className="text-gray-600 mt-1">
                {county.name} County • {entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Programs
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'all', label: `All Programs (${programs.length})` },
                { id: 'grants', label: 'Grants & Funding' },
                { id: 'loans', label: 'Loans & Credit' },
                { id: 'assistance', label: 'Technical Assistance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => filterPrograms(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Programs List */}
        <div className="p-6">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No programs found for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPrograms.map((program) => (
                <div key={program.id} className="card border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getProgramTypeColor(program.type)}`}>
                          {getProgramTypeIcon(program.type)}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
                        {program.priority_score >= 85 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            HIGH MATCH
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{program.description}</p>
                      <div className="text-sm text-gray-500 mb-3">
                        <span className="font-medium">{program.agency}</span> • 
                        <span className="ml-1">{program.funding_range}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{program.priority_score}%</div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {program.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {program.eligibility.map((req, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Application Window:</span> {program.application_window}
                    </div>
                    <div className="flex space-x-3">
                      <a 
                        href={program.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Learn More →
                      </a>
                      <a 
                        href={program.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm"
                      >
                        Start Application
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Need help with applications? Contact your local Small Business Development Center or Extension Office.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="btn-secondary text-sm">
                Save Program List
              </button>
              <button className="btn-secondary text-sm">
                Schedule Consultation
              </button>
              <button onClick={onClose} className="btn-primary text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}