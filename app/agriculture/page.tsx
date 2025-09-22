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

export default function AgriculturePage() {
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
        const data = await api.getRankings('agriculture', 5);
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

  const agricultureScore = countyDetails?.resilienceScores.find(s => s.entity_type === 'agriculture');

  return (
    <div className="min-h-screen bg-gradient-to-br from-agriculture-50 to-green-100">
      {/* Header */}
      <header className="section-padding py-6 bg-white border-b border-agriculture-200">
        <div className="container-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-agriculture-600 hover:text-agriculture-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-agriculture-800">Agriculture Resilience Platform</h1>
                <p className="text-agriculture-600">North Carolina Farm Risk Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="btn-secondary text-sm">
                Analytics →
              </Link>
              <Link href="/map" className="btn-secondary text-sm">
                View Map →
              </Link>
              <Link href="/business" className="btn-secondary text-sm">
                Switch to Business →
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
            title="How to Use the Agriculture Resilience Platform - Step by Step Guide"
            defaultOpen={!selectedCounty}
            importance="high"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                Welcome! This platform helps farmers and agricultural operations in North Carolina understand and prepare for risks that could affect your farm.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Here's how it works in 3 simple steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li><strong>Step 1:</strong> Select your county from the dropdown below to see local risk information</li>
                  <li><strong>Step 2:</strong> Review your county's risk scores and hazards that could affect your farm</li>
                  <li><strong>Step 3:</strong> Use the Risk Assessment Wizard to get personalized recommendations and find government programs that can help</li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Don't worry about technical terms!</strong> We explain everything in plain language and provide help buttons throughout the platform.
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
                  description="Choose the county where your farm or agricultural operation is located. This helps us show you the most accurate risk information and available programs for your specific area."
                  detailed="Different counties in North Carolina face different types of risks (like hurricanes on the coast vs. drought inland). Selecting your county ensures you get location-specific information that's relevant to your farming operation."
                />
              </div>
              <CountySelector
                selectedCounty={selectedCounty}
                onCountySelect={setSelectedCounty}
                entityType="agriculture"
              />
              {!selectedCounty && (
                <p className="text-sm text-gray-600 mt-2">
                  Start by typing your county name in the box above. For example, type "Wake" to find Wake County.
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
                  <h2 className="text-2xl font-bold text-agriculture-800">
                    What This Platform Does for Your Farm
                  </h2>
                  <HelpTooltip
                    title="Platform Purpose"
                    description="This free platform analyzes risks that could affect your farm and helps you prepare for them. It's designed specifically for North Carolina farmers and agricultural businesses."
                    detailed="We combine government data on weather, disasters, financial conditions, and more to give you a complete picture of risks in your area. Then we help you find government programs and resources to protect your operation."
                  />
                </div>
                <p className="text-gray-600 mb-6">
                  This free platform analyzes various risks that could impact your farm and provides specific steps to help you prepare and recover. Everything is explained in simple terms.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-agriculture-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-agriculture-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Weather & Climate Risk Assessment</h3>
                      <p className="text-sm text-gray-600">Shows how likely your area is to experience drought, hurricanes, flooding, or extreme temperatures that could damage crops or livestock</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-agriculture-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-agriculture-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Government Program Finder</h3>
                      <p className="text-sm text-gray-600">Automatically finds USDA programs, grants, loans, and disaster assistance you might qualify for - no need to search through confusing government websites</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-agriculture-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-agriculture-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Financial Health Check</h3>
                      <p className="text-sm text-gray-600">Analyzes local economic conditions, credit availability, and market trends that could affect your farm's financial stability</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-agriculture-50 rounded-lg">
                  <p className="text-sm text-agriculture-700">
                    <strong>Start by selecting your county above</strong> to get personalized 
                    risk assessments and preparedness recommendations.
                  </p>
                </div>
              </div>

              {/* Top Performing Counties */}
              {rankings && (
                <div className="card">
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Counties with the Strongest Agricultural Resilience
                    </h2>
                    <HelpTooltip
                      title="Resilience Rankings"
                      description="These counties have the lowest risk scores, meaning they're better prepared for disasters, have stronger financial conditions, and more resources available to farmers."
                      detailed="A resilience score combines weather risks, financial health, disaster preparedness, and access to support programs. Higher scores (closer to 100) mean better conditions for farming operations to survive and recover from challenges."
                    />
                  </div>
                  <div className="space-y-3">
                    {rankings.most_resilient.map((score, index) => (
                      <div key={score.county_fips} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-agriculture-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">County {score.county_fips}</div>
                            <div className="text-sm text-gray-500">Agricultural resilience</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-agriculture-600">{score.overall_score}</div>
                          <div className="text-sm text-gray-500">out of 100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button className="text-agriculture-600 hover:text-agriculture-700 text-sm font-medium">
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
          ) : countyDetails && agricultureScore ? (
            /* County Data Display */
            <div className="space-y-8">
              {/* County Header */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {countyDetails.county.name} County Agricultural Assessment
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Population: {countyDetails.county.population ? parseInt(countyDetails.county.population).toLocaleString() : 'N/A'} • 
                      Area: {countyDetails.county.area_sq_miles ? Math.round(parseFloat(countyDetails.county.area_sq_miles)).toLocaleString() : 'N/A'} sq mi
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <HelpTooltip
                      title="Farm Assessment Tools"
                      description="Access specialized tools for agricultural risk assessment, insurance claims, and damage documentation."
                      detailed="These tools help you assess risks specific to your farm, file insurance claims after disasters, and complete official damage assessments required for government assistance."
                    />
                    <button 
                      className="btn-primary bg-agriculture-600 hover:bg-agriculture-700 text-sm px-4 py-2"
                      onClick={() => setShowWizard(true)}
                    >
                      Risk Assessment
                    </button>
                    <button 
                      className="btn-secondary text-sm px-4 py-2"
                      onClick={() => setShowInsuranceHelper(true)}
                    >
                      Insurance Claims
                    </button>
                    <button 
                      className="btn-primary bg-red-600 hover:bg-red-700 text-sm px-4 py-2"
                      onClick={() => setShowDamageAssessment(true)}
                    >
                      Damage Assessment
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Guidance */}
              <ExplanationPanel 
                title="Understanding Your County's Agricultural Risk Information"
                defaultOpen={false}
                importance="medium"
              >
                <div className="space-y-4">
                  <p>Below you'll see two main sections that help you understand risks in {countyDetails.county.name} County:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📊 Resilience Score (Left Side)</h4>
                      <p className="text-sm text-blue-800">
                        Shows how prepared your county is for various risks. Think of it like a report card - higher scores (closer to 100) are better.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">⚠️ Natural Disaster Risks (Right Side)</h4>
                      <p className="text-sm text-green-800">
                        Lists specific weather and natural disasters that are most likely to affect farms in your area.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    <strong>Next Steps:</strong> Review both sections, then click "Start Personal Risk Assessment" above to get recommendations specific to your farm.
                  </p>
                </div>
              </ExplanationPanel>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Resilience Score */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Step 2: Review Your County's Overall Resilience Score</h3>
                    <HelpTooltip
                      title="Resilience Score Explanation"
                      description="This score (0-100) shows how well-prepared your county is for various risks. Higher scores mean better conditions for farms to survive and recover from challenges."
                      detailed="The score combines 4 factors: Credit Risk (how easy it is to get loans), Disaster Risk (likelihood of natural disasters), Supply Chain Risk (reliability of getting supplies and selling products), and SBA Access (availability of government assistance programs). Each factor is explained in detail on the score card."
                    />
                  </div>
                  <RiskScoreCard 
                    score={agricultureScore} 
                    entityType="agriculture"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowDashboard(true)}
                      className="w-full btn-secondary text-sm"
                    >
                      View Community Impact Data
                    </button>
                    <HelpTooltip
                      title="Impact Dashboard"
                      description="Shows how this platform is helping farmers in your area and tracks improvements in agricultural resilience over time."
                      detailed="The dashboard displays aggregated data about platform usage, farmer outcomes, and regional trends. This helps demonstrate the platform's effectiveness to government officials and potential funders."
                    />
                  </div>
                </div>

                {/* Natural Disaster Risks */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Step 3: Check Natural Disaster Risks in Your Area</h3>
                    <HelpTooltip
                      title="Natural Disaster Risks"
                      description="This list shows the most likely natural disasters that could affect farms in your county, ranked by probability and potential impact."
                      detailed="Data comes from FEMA's National Risk Index and historical disaster records. Each risk shows the likelihood of occurrence and typical impact on agricultural operations. Use this information to prioritize your emergency preparedness efforts."
                    />
                  </div>
                  <HazardsList risks={countyDetails.disasterRisks} />
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Step 4: General Preparedness Recommendations for Your County</h3>
                  <HelpTooltip
                    title="Preparedness Recommendations"
                    description="These are general best practices for farms in your county based on the local risk profile. For personalized recommendations, use the Risk Assessment Wizard above."
                    detailed="These recommendations are based on the most common risks in your county and proven strategies that have helped other farmers. They're starting points - the Risk Assessment Wizard will give you specific recommendations based on your exact farm operation."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-agriculture-700">Weather Preparedness</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Monitor weather forecasts and early warning systems</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Develop drought contingency plans for irrigation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Consider crop insurance options through USDA RMA</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-agriculture-700">Financial Resilience</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Maintain emergency operating funds</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Diversify crop varieties and markets</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Explore value-added processing opportunities</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Government Programs */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Step 5: Examples of Government Programs Available to Your Farm</h3>
                  <HelpTooltip
                    title="Government Agricultural Assistance Programs"
                    description="These are examples of USDA and other government programs available to farmers in North Carolina. The Farm Assessment Wizard will find specific programs you might qualify for."
                    detailed="The USDA and other agencies offer various types of assistance: emergency loans for disaster recovery, conservation cost-share programs, crop insurance, grants for sustainable practices, and technical assistance. Eligibility varies by program, farm size, crops, and specific circumstances."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">USDA Emergency Farm Loans</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Low-interest loans for farmers affected by natural disasters and emergencies.
                    </p>
                    <button 
                      onClick={() => setShowPrograms(true)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Check Eligibility →
                    </button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">USDA Conservation Programs</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Cost-share payments for implementing conservation practices on your farm.
                    </p>
                    <button 
                      onClick={() => setShowPrograms(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Programs →
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPrograms(true)}
                    className="btn-primary bg-agriculture-600 hover:bg-agriculture-700"
                  >
                    View All Available USDA Programs
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    See complete list of USDA loans, grants, and conservation programs available in {selectedCounty?.name} County
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* No Data State */
            <div className="card text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Agricultural Data Available</h3>
              <p className="text-gray-600">
                Agricultural resilience data is not available for {selectedCounty?.name} County.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Risk Assessment Wizard */}
      {showWizard && selectedCounty && (
        <RiskWizard
          county={selectedCounty}
          entityType="agriculture"
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
          entityType="agriculture"
          userProfile={wizardResults?.responses}
          riskFactors={wizardResults?.risk_factors}
          onClose={() => setShowPrograms(false)}
        />
      )}

      {/* Crisis Mode */}
      {crisisMode && selectedCounty && (
        <CrisisMode
          county={selectedCounty}
          entityType="agriculture"
          onExitCrisisMode={() => setCrisisMode(false)}
        />
      )}

      {/* Impact Dashboard */}
      {showDashboard && selectedCounty && (
        <ImpactDashboard
          county={selectedCounty}
          entityType="agriculture"
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

      {/* New Components */}
      {showInsuranceHelper && selectedCounty && (
        <InsuranceClaimHelper
          county={selectedCounty}
          entityType="agriculture"
          onClose={() => setShowInsuranceHelper(false)}
        />
      )}

      {showDamageAssessment && selectedCounty && (
        <DamageAssessmentForm
          county={selectedCounty}
          entityType="agriculture"
          disasterType="hurricane"
          onComplete={(assessment) => {
            console.log('Damage assessment completed:', assessment);
            setShowDamageAssessment(false);
          }}
          onCancel={() => setShowDamageAssessment(false)}
        />
      )}

      {/* Agriculture Hero Section */}
      <section className="relative h-[500px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('/agricpage.png')"
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-5xl font-bold mb-6">Building Resilient Agricultural Communities</h2>
            <p className="text-xl leading-relaxed mb-8">
              Empowering North Carolina farmers with the knowledge, tools, and resources needed to thrive through any challenge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/about" className="btn-primary bg-agriculture-600 hover:bg-agriculture-700 px-8 py-3 text-lg font-semibold">
                Learn About Our Foundation
              </Link>
              <Link href="/map" className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-semibold">
                Explore Risk Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}