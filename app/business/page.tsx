'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { County, CountyDetails, Rankings } from '../types';
import { api } from '../lib/api';
import CountySelector from '../components/CountySelector';
import RiskScoreCard from '../components/RiskScoreCard';
import HazardsList from '../components/HazardsList';
import RiskWizard from '../components/RiskWizard';
import WizardResults from '../components/WizardResults';
import ProgramMatcher from '../components/ProgramMatcher';
import CrisisMode from '../components/CrisisMode';
import CrisisActivator from '../components/CrisisActivator';
import ImpactDashboard from '../components/ImpactDashboard';
import HelpTooltip from '../components/HelpTooltip';
import ExplanationPanel from '../components/ExplanationPanel';
import InsuranceClaimHelper from '../components/InsuranceClaimHelper';
import DamageAssessmentForm from '../components/DamageAssessmentForm';

export default function BusinessPage() {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [countyDetails, setCountyDetails] = useState<CountyDetails | null>(null);
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardResults, setWizardResults] = useState<any>(null);
  const [showPrograms, setShowPrograms] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showInsuranceHelper, setShowInsuranceHelper] = useState(false);
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);

  // Load rankings on component mount
  useEffect(() => {
    async function loadRankings() {
      try {
        const data = await api.getRankings('small-business', 5);
        setRankings(data);
      } catch (error) {
        console.error('Failed to load rankings:', error);
      }
    }
    loadRankings();
  }, []);

  // Load county details when county is selected
  useEffect(() => {
    if (!selectedCounty) {
      setCountyDetails(null);
      return;
    }

    async function loadCountyDetails() {
      setLoading(true);
      setError(null);
      try {
        const details = await api.getCountyDetails(selectedCounty!.fips_code);
        setCountyDetails(details);
      } catch (error: any) {
        setError(error.message || 'Failed to load county details');
      } finally {
        setLoading(false);
      }
    }

    loadCountyDetails();
  }, [selectedCounty]);

  const businessScore = countyDetails?.resilienceScores.find(s => s.entity_type === 'small-business');

  return (
    <div className="min-h-screen bg-gradient-to-br from-business-50 to-purple-100">
      {/* Header */}
      <header className="section-padding py-6 bg-white border-b border-business-200">
        <div className="container-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-business-600 hover:text-business-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-business-800">Small Business Resilience Platform</h1>
                <p className="text-business-600">North Carolina Business Risk Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="btn-secondary text-sm">
                Analytics →
              </Link>
              <Link href="/map" className="btn-secondary text-sm">
                View Map →
              </Link>
              <Link href="/agriculture" className="btn-secondary text-sm">
                Switch to Agriculture →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-padding py-8">
        <div className="container-max">
          {/* Welcome Guide */}
          <ExplanationPanel 
            title="How to Use the Small Business Resilience Platform - Step by Step Guide"
            defaultOpen={!selectedCounty}
            importance="high"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                Welcome! This platform helps small business owners in North Carolina understand and prepare for risks that could affect your business operations.
              </p>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Here's how it works in 3 simple steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-purple-800">
                  <li><strong>Step 1:</strong> Select your county from the dropdown below to see local business conditions</li>
                  <li><strong>Step 2:</strong> Review your county's resilience scores and disaster risks that could impact your business</li>
                  <li><strong>Step 3:</strong> Use the Business Assessment Wizard to get personalized recommendations and find SBA programs that can help</li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Don't worry about complex business terms!</strong> We explain everything in simple language and provide help throughout the platform.
              </p>
            </div>
          </ExplanationPanel>

          {/* County Selection */}
          <div className="mb-8">
            <div className="max-w-md">
              <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Step 1: Select Your County
                </label>
                <HelpTooltip
                  title="County Selection"
                  description="Choose the county where your business is located. This helps us show you the most accurate risk information and available business support programs for your specific area."
                  detailed="Different counties in North Carolina face different types of risks (like coastal hurricane damage vs. inland flooding). Business conditions also vary by county. Selecting your county ensures you get location-specific information that's relevant to your business."
                />
              </div>
              <CountySelector
                selectedCounty={selectedCounty}
                onCountySelect={setSelectedCounty}
                entityType="small-business"
              />
              {!selectedCounty && (
                <p className="text-sm text-gray-600 mt-2">
                  Start by typing your county name in the box above. For example, type "Mecklenburg" to find Mecklenburg County.
                </p>
              )}
            </div>
          </div>

          {/* Content Based on Selection */}
          {!selectedCounty ? (
            /* Welcome State */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Getting Started */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <h2 className="text-2xl font-bold text-business-800">
                    What This Platform Does for Your Business
                  </h2>
                  <HelpTooltip
                    title="Platform Purpose"
                    description="This free platform analyzes risks that could affect your business and helps you prepare for them. It's designed specifically for small businesses in North Carolina."
                    detailed="We combine government data on disasters, economic conditions, market trends, and more to give you a complete picture of business risks in your area. Then we help you find SBA programs and resources to protect and grow your business."
                  />
                </div>
                <p className="text-gray-600 mb-6">
                  This free platform analyzes various risks that could impact your business and provides specific steps to help you prepare and recover. Everything is explained in simple business terms.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-business-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-business-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Business Continuity Planning</h3>
                      <p className="text-sm text-gray-600">Step-by-step guides to help your business prepare for and recover from disasters like hurricanes, floods, or economic downturns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-business-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-business-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Government Program Finder</h3>
                      <p className="text-sm text-gray-600">Automatically finds SBA loans, grants, disaster assistance, and other government programs you might qualify for - saving you time searching</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-business-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-business-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Supply Chain Risk Assessment</h3>
                      <p className="text-sm text-gray-600">Analyzes how reliable your suppliers and customers are, and helps you plan backup options if key relationships are disrupted</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-business-50 rounded-lg">
                  <p className="text-sm text-business-700">
                    <strong>Start by selecting your county above</strong> to get personalized 
                    risk assessments and business resilience recommendations.
                  </p>
                </div>
              </div>

              {/* Top Performing Counties */}
              {rankings && (
                <div className="card">
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Counties with the Strongest Business Environment
                    </h2>
                    <HelpTooltip
                      title="Business Resilience Rankings"
                      description="These counties have the lowest risk scores for small businesses, meaning they offer better conditions for business survival and growth during challenging times."
                      detailed="A resilience score combines factors like: access to credit and loans, disaster preparedness, economic diversity, and availability of business support programs. Higher scores (closer to 100) mean better conditions for businesses to thrive and recover from setbacks."
                    />
                  </div>
                  <div className="space-y-3">
                    {rankings.most_resilient.map((score, index) => (
                      <div key={score.county_fips} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-business-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">County {score.county_fips}</div>
                            <div className="text-sm text-gray-500">Small business resilience</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-business-600">{score.overall_score}</div>
                          <div className="text-sm text-gray-500">out of 100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button className="text-business-600 hover:text-business-700 text-sm font-medium">
                      View Full Rankings →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="card text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load County Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                className="btn-primary"
                onClick={() => setSelectedCounty(null)}
              >
                Try Another County
              </button>
            </div>
          ) : countyDetails && businessScore ? (
            /* County Data Display */
            <div className="space-y-8">
              {/* County Header */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {countyDetails.county.name} County Business Assessment
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Population: {countyDetails.county.population ? parseInt(countyDetails.county.population).toLocaleString() : 'N/A'} • 
                      Area: {countyDetails.county.area_sq_miles ? Math.round(parseFloat(countyDetails.county.area_sq_miles)).toLocaleString() : 'N/A'} sq mi
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 mr-4">
                      <button 
                        onClick={() => setShowInsuranceHelper(true)} 
                        className="btn-secondary text-xs py-2"
                      >
                        Business Insurance Claims
                      </button>
                      <button 
                        onClick={() => setShowDamageAssessment(true)} 
                        className="btn-secondary text-xs py-2"
                      >
                        Property Damage Assessment
                      </button>
                    </div>
                    <HelpTooltip
                      title="Business Assessment Wizard"
                      description="This guided questionnaire asks about your specific business to provide personalized risk analysis and recommendations."
                      detailed="The wizard takes 5-10 minutes and asks about your industry, business size, current preparations, and specific concerns. Based on your answers, it creates a custom action plan and finds SBA programs you might qualify for."
                    />
                    <button 
                      className="btn-primary bg-business-600 hover:bg-business-700"
                      onClick={() => setShowWizard(true)}
                    >
                      Start Personal Business Assessment
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Guidance */}
              <ExplanationPanel 
                title="Understanding Your County's Business Risk Information"
                defaultOpen={false}
                importance="medium"
              >
                <div className="space-y-4">
                  <p>Below you'll see three main sections that help you understand business conditions in {countyDetails.county.name} County:</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Resilience Score (Left Side)</h4>
                      <p className="text-sm text-blue-800">
                        Shows how prepared your county is for business challenges. Think of it like a report card - higher scores (closer to 100) mean better business conditions.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Disaster Risks (Right Side)</h4>
                      <p className="text-sm text-green-800">
                        Lists specific disasters that could disrupt business operations in your area, helping you prioritize your emergency planning.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Government Programs (Bottom)</h4>
                      <p className="text-sm text-purple-800">
                        Shows examples of SBA and other government programs available to businesses in your county.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    <strong>Next Steps:</strong> Review all sections, then click "Start Personal Business Assessment" above to get recommendations specific to your business.
                  </p>
                </div>
              </ExplanationPanel>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Resilience Score */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Step 2: Review Your County's Business Resilience Score</h3>
                    <HelpTooltip
                      title="Business Resilience Score Explanation"
                      description="This score (0-100) shows how well-prepared your county is for business challenges. Higher scores mean better conditions for businesses to survive and thrive during difficult times."
                      detailed="The score combines 4 factors: Credit Risk (how easy it is for businesses to get loans), Disaster Risk (likelihood of disruptive events), Supply Chain Risk (reliability of vendors and transportation), and SBA Access (availability of government business assistance). Each factor is explained in detail on the score card."
                    />
                  </div>
                  <RiskScoreCard 
                    score={businessScore} 
                    entityType="small-business"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowDashboard(true)}
                      className="w-full btn-secondary text-sm"
                    >
                      View Community Business Impact Data
                    </button>
                    <HelpTooltip
                      title="Impact Dashboard"
                      description="Shows how this platform is helping small businesses in your area and tracks improvements in business resilience over time."
                      detailed="The dashboard displays aggregated data about platform usage, business outcomes, and regional economic trends. This helps demonstrate the platform's effectiveness to government officials and potential funders."
                    />
                  </div>
                </div>

                {/* Natural Disaster Risks */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Step 3: Check Disaster Risks That Could Affect Your Business</h3>
                    <HelpTooltip
                      title="Business Disaster Risks"
                      description="This list shows the most likely disasters that could disrupt business operations in your county, ranked by probability and potential business impact."
                      detailed="Data comes from FEMA's National Risk Index and historical disaster records. Each risk shows the likelihood of occurrence and typical impact on businesses (power outages, supply chain disruptions, customer access issues, etc.). Use this information to prioritize your business continuity planning."
                    />
                  </div>
                  <HazardsList risks={countyDetails.disasterRisks} />
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Step 4: General Business Preparedness Recommendations</h3>
                  <HelpTooltip
                    title="Business Preparedness Recommendations"
                    description="These are general best practices for businesses in your county based on the local risk profile. For personalized recommendations, use the Business Assessment Wizard above."
                    detailed="These recommendations are based on the most common risks in your county and proven strategies that have helped other small businesses. They're starting points - the Business Assessment Wizard will give you specific recommendations based on your exact business type and situation."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-business-700">Disaster Preparedness</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-business-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Develop business continuity and disaster recovery plans</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-business-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Consider backup locations or remote work capabilities</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-business-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Review and update commercial insurance coverage</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-business-700">Financial Resilience</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-business-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Maintain emergency cash reserves for operations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-business-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Diversify customer base and revenue streams</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-business-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Build relationships with alternative suppliers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Government Programs */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Step 5: Examples of Government Programs Available to Your Business</h3>
                  <HelpTooltip
                    title="Government Business Assistance Programs"
                    description="These are examples of SBA and other government programs available to small businesses in North Carolina. The Business Assessment Wizard will find specific programs you might qualify for."
                    detailed="The Small Business Administration (SBA) and other agencies offer various types of assistance: disaster recovery loans, general business loans, mentoring programs, training, and grants. Eligibility varies by program, business size, industry, and specific circumstances."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">SBA Disaster Loans</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Low-interest loans for businesses affected by declared disasters.
                    </p>
                    <button 
                      onClick={() => setShowPrograms(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Check Eligibility →
                    </button>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">SCORE Mentoring</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Free business mentoring and resilience planning assistance.
                    </p>
                    <button 
                      onClick={() => setShowPrograms(true)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Find Local Mentor →
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPrograms(true)}
                    className="btn-primary bg-business-600 hover:bg-business-700"
                  >
                    View All Available Government Programs
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    See complete list of SBA loans, grants, and assistance programs available in {selectedCounty?.name} County
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* No Data State */
            <div className="card text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Data Available</h3>
              <p className="text-gray-600">
                Small business resilience data is not available for {selectedCounty?.name} County.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Risk Assessment Wizard */}
      {showWizard && selectedCounty && (
        <RiskWizard
          county={selectedCounty}
          entityType="small-business"
          onComplete={(assessment) => {
            setWizardResults(assessment);
            setShowWizard(false);
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {/* Wizard Results */}
      {wizardResults && selectedCounty && (
        <WizardResults
          assessment={wizardResults}
          county={selectedCounty}
          onClose={() => setWizardResults(null)}
          onStartOver={() => {
            setWizardResults(null);
            setShowWizard(true);
          }}
          onViewPrograms={() => {
            setWizardResults(null);
            setShowPrograms(true);
          }}
        />
      )}

      {/* Program Matcher */}
      {showPrograms && selectedCounty && (
        <ProgramMatcher
          county={selectedCounty}
          entityType="small-business"
          userProfile={wizardResults?.responses}
          riskFactors={wizardResults?.risk_factors}
          onClose={() => setShowPrograms(false)}
        />
      )}

      {/* Crisis Mode */}
      {crisisMode && selectedCounty && (
        <CrisisMode
          county={selectedCounty}
          entityType="small-business"
          onExitCrisisMode={() => setCrisisMode(false)}
        />
      )}

      {/* Impact Dashboard */}
      {showDashboard && selectedCounty && (
        <ImpactDashboard
          county={selectedCounty}
          entityType="small-business"
          onClose={() => setShowDashboard(false)}
        />
      )}

      {/* Crisis Activator */}
      {!crisisMode && (
        <CrisisActivator
          onActivateCrisis={() => setCrisisMode(true)}
          county={selectedCounty?.name}
        />
      )}

      {/* Insurance Claim Helper */}
      {showInsuranceHelper && selectedCounty && (
        <InsuranceClaimHelper
          county={selectedCounty}
          entityType="small-business"
          onClose={() => setShowInsuranceHelper(false)}
        />
      )}

      {/* Damage Assessment Form */}
      {showDamageAssessment && selectedCounty && (
        <DamageAssessmentForm
          county={selectedCounty}
          entityType="small-business"
          disasterType="hurricane"
          onComplete={(assessment) => {
            console.log('Damage assessment completed:', assessment);
            setShowDamageAssessment(false);
          }}
          onCancel={() => setShowDamageAssessment(false)}
        />
      )}

      {/* Business Hero Section */}
      <section className="relative h-[500px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('/businesspage.png')"
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-5xl font-bold mb-6">Building Thriving Business Communities</h2>
            <p className="text-xl leading-relaxed mb-8">
              Empowering North Carolina small businesses with the insights, resources, and support needed to grow and prosper through any challenge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analytics" className="btn-primary bg-business-600 hover:bg-business-700 text-white px-8 py-3 rounded-lg font-semibold">
                View Business Analytics
              </Link>
              <Link href="/map" className="btn-secondary bg-white text-business-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
                Explore Risk Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}