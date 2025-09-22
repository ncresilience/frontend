'use client';

import { useState } from 'react';
import Link from 'next/link';
import { County } from '../types';
import InteractiveMap from '../components/InteractiveMap';
import CountySelector from '../components/CountySelector';
import HelpTooltip from '../components/HelpTooltip';
import ExplanationPanel from '../components/ExplanationPanel';
import InsuranceClaimHelper from '../components/InsuranceClaimHelper';
import DamageAssessmentForm from '../components/DamageAssessmentForm';

export default function MapPage() {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [entityType, setEntityType] = useState<'agriculture' | 'small-business'>('agriculture');
  const [showInsuranceHelper, setShowInsuranceHelper] = useState(false);
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="section-padding py-6 bg-white border-b border-gray-200">
        <div className="container-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">NC Resilience Risk Map</h1>
                <p className="text-gray-600">See Risk Levels Across North Carolina Counties</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="btn-secondary text-sm">
                Analytics →
              </Link>
              <Link href="/agriculture" className="btn-secondary text-sm">
                Agriculture Dashboard →
              </Link>
              <Link href="/business" className="btn-secondary text-sm">
                Business Dashboard →
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
            title="How to Use the Interactive Risk Map - Simple Guide"
            defaultOpen={true}
            importance="high"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                This map shows you which counties in North Carolina are better or worse prepared for risks that could affect farms and businesses. We analyze real government data to help you understand your local conditions and make informed decisions.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Here's how to read the map:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li><strong>Bright Green areas (scores 67+):</strong> Highest resilience - well-prepared counties with strong infrastructure and support systems</li>
                  <li><strong>Bright Blue areas (scores 64-66):</strong> Good resilience - moderate preparation with some areas for improvement</li>
                  <li><strong>Orange areas (scores 61-63):</strong> Moderate resilience - significant preparation needed in multiple areas</li>
                  <li><strong>Red areas (scores 55-60):</strong> Lower resilience - substantial challenges requiring focused attention and resources</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">What you can do with this map:</h4>
                <ul className="list-decimal list-inside space-y-1 text-green-800">
                  <li>Choose whether you want to see agricultural risks or small business risks using the buttons above</li>
                  <li>Move your mouse over any county to see its exact resilience score and detailed breakdown</li>
                  <li>Click on a county to select it and access detailed assessments and government programs</li>
                  <li>Use the search box to quickly find and highlight your specific county</li>
                  <li>Review the charts below the map to understand statewide trends and patterns</li>
                  <li>Compare your county to others to understand relative strengths and challenges</li>
                </ul>
              </div>
            </div>
          </ExplanationPanel>

          {/* Data Sources and Methodology */}
          <ExplanationPanel 
            title="Understanding the Data Behind the Map - What Makes This Reliable"
            defaultOpen={false}
            importance="medium"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                Our resilience scores are based on comprehensive analysis of official government data sources. We don't use guesswork - every score is calculated from real, verified information that affects your county's ability to withstand and recover from challenges.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Data Sources We Use:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><strong>FEMA National Risk Index:</strong> Official disaster risk assessments for every county</li>
                    <li><strong>USASpending.gov SBA Data:</strong> Real-time government loan and grant data for business support availability</li>
                    <li><strong>US Bankruptcy Courts:</strong> Financial distress indicators and economic stability</li>
                    <li><strong>Census Bureau CBP API:</strong> Real-time economic diversity data and business establishment patterns</li>
                    <li><strong>USDA Agricultural Data:</strong> Farm-specific risk factors and agricultural conditions</li>
                    <li><strong>NC Ports Authority:</strong> Supply chain reliability and transportation infrastructure</li>
                    <li><strong>NOAA Climate Data:</strong> Historical weather patterns and future projections</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">How We Calculate Scores:</h4>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div>
                      <strong>Credit Risk Component (25%):</strong> How easily local businesses and farms can access loans and credit during normal times and emergencies
                    </div>
                    <div>
                      <strong>Disaster Risk Component (30%):</strong> Likelihood and severity of natural disasters like hurricanes, floods, droughts, and their historical impact
                    </div>
                    <div>
                      <strong>Supply Chain Risk Component (35%):</strong> Reliability of transportation, suppliers, and market access - critical for both farms and businesses
                    </div>
                    <div>
                      <strong>Government Support Component (10%):</strong> Availability and accessibility of SBA, USDA, and other assistance programs
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Why These Factors Matter:</h4>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  <strong>For Farmers:</strong> Credit access helps you invest in equipment and survive bad seasons. Disaster risk affects crop yields and livestock. Supply chains determine if you can get seeds/feed and sell your products. Government programs provide emergency assistance and conservation support.
                </p>
                <p className="text-sm text-yellow-800 leading-relaxed mt-2">
                  <strong>For Small Businesses:</strong> Credit access enables growth and emergency funding. Disaster risk affects operations and customer access. Supply chains determine inventory reliability and shipping costs. Government programs offer loans, technical assistance, and disaster recovery support.
                </p>
              </div>
            </div>
          </ExplanationPanel>
          {/* Controls */}
          <div className="mb-8 grid lg:grid-cols-2 gap-6">
            {/* Entity Type Selector */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Step 1: Choose What Type of Risk Information to Show:</h3>
                <HelpTooltip
                  title="Risk Data Types"
                  description="You can view the map from two different perspectives - either focusing on agricultural risks (for farmers) or small business risks (for business owners)."
                  detailed="Agricultural view shows risks like drought, crop diseases, and farm-specific economic factors. Small business view shows risks like supply chain disruptions, local market conditions, and business-specific disaster impacts. The same county might have different risk levels for farms versus businesses."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    entityType === 'agriculture'
                      ? 'border-agriculture-500 bg-agriculture-50 text-agriculture-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-agriculture-300'
                  }`}
                  onClick={() => setEntityType('agriculture')}
                >
                  <div className="text-center">
                    <div className="font-medium">Agriculture</div>
                    <div className="text-sm opacity-75">Farm & crop resilience</div>
                  </div>
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    entityType === 'small-business'
                      ? 'border-business-500 bg-business-50 text-business-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-business-300'
                  }`}
                  onClick={() => setEntityType('small-business')}
                >
                  <div className="text-center">
                    <div className="font-medium">Small Business</div>
                    <div className="text-sm opacity-75">Business continuity</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick County Search */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Step 2: Search for Your County (Optional):</h3>
                <HelpTooltip
                  title="County Search"
                  description="Type your county name to quickly find and highlight it on the map. This makes it easier to spot your area among all 100 North Carolina counties."
                  detailed="Once you select a county, it will be highlighted on the map and you'll see a link to get detailed information about that county's risks and available programs."
                />
              </div>
              <CountySelector
                selectedCounty={selectedCounty}
                onCountySelect={setSelectedCounty}
              />
              {selectedCounty && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-blue-800">
                      <strong>{selectedCounty.name} County</strong> is highlighted on the map.
                    </div>
                    <button
                      onClick={() => setSelectedCounty(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <Link 
                      href={entityType === 'agriculture' ? '/agriculture' : '/business'}
                      className="btn-secondary text-xs py-2 text-center"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => setShowInsuranceHelper(true)}
                      className="btn-primary text-xs py-2"
                    >
                      Insurance Claims
                    </button>
                    <button
                      onClick={() => setShowDamageAssessment(true)}
                      className="btn-primary bg-red-600 hover:bg-red-700 text-xs py-2"
                    >
                      Damage Assessment
                    </button>
                  </div>
                  
                  <div className="text-xs text-blue-600">
                    County-specific tools for {selectedCounty.name} County
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Instructions */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Step 3: Explore the Interactive Map</h3>
              <HelpTooltip
                title="Using the Interactive Map"
                description="Move your mouse over counties to see their risk scores. Click on any county to select it and get more information. The colors show which areas are better or worse prepared for challenges."
                detailed="The map uses a color scale where green represents lower risk/better prepared counties, yellow and orange represent medium risk, and red represents higher risk counties. The exact risk score (0-100) appears when you hover over each county."
              />
            </div>
          </div>

          {/* Interactive Map */}
          <InteractiveMap
            entityType={entityType}
            selectedCounty={selectedCounty}
            onCountySelect={setSelectedCounty}
            className="mb-8"
          />

          {/* Detailed Usage Instructions */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 4: Understanding What the Map Shows You</h3>
              <HelpTooltip
                title="Map Data Explanation"
                description="The map combines multiple types of data to create an overall 'resilience score' for each county. This helps you understand which areas are better prepared for challenges."
                detailed="The resilience score (0-100) combines: Credit Risk (how easy it is to get loans), Disaster Risk (likelihood of natural disasters), Supply Chain Risk (reliability of transportation and suppliers), and SBA Access (availability of government assistance programs). Higher scores mean better conditions."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-green-800">🟢 Green Counties (Good Conditions)</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Lower disaster risk from hurricanes, floods, etc.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Better access to loans and credit</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>More reliable supply chains and transportation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>More government assistance programs available</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-800">🟡 Yellow/Orange Counties (Medium Risk)</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Moderate disaster risk - some preparation needed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Average access to credit and financial services</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Some supply chain vulnerabilities</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Standard level of government support</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-red-800">🔴 Red Counties (Higher Risk)</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Higher disaster risk - more preparation needed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>More limited access to credit and loans</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>More vulnerable supply chains</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Fewer government programs currently available</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Remember:</strong> Even if your county shows higher risk, there are still many things you can do to prepare and protect your farm or business. Click on your county and visit the detailed assessment pages to get specific recommendations and find available assistance programs.
              </p>
            </div>
          </div>

          {/* How to Interpret Your County's Score */}
          <ExplanationPanel 
            title="How to Interpret Your County's Score - What It Means for You"
            defaultOpen={false}
            importance="medium"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                Your county's resilience score tells a story about local conditions and opportunities. Here's how to understand what your score means and what you can do about it.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">High Scores (67-73): Build on Your Strengths</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Your county has strong resilience infrastructure</li>
                      <li>• Focus on maintaining and expanding successful programs</li>
                      <li>• Consider helping neighboring counties improve</li>
                      <li>• Use your advantages to attract new businesses or expand operations</li>
                      <li>• Stay prepared - even strong areas can face unexpected challenges</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Moderate Scores (61-66): Target Specific Improvements</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Identify which components are weakest (credit, disaster, supply chain, or government support)</li>
                      <li>• Work with local officials to address specific vulnerabilities</li>
                      <li>• Take advantage of available government programs</li>
                      <li>• Build networks with businesses/farms in higher-scoring areas</li>
                      <li>• Develop contingency plans for your identified risk areas</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Lower Scores (55-60): Take Proactive Action</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Don't panic - many successful businesses and farms operate in challenging areas</li>
                      <li>• Prioritize emergency preparedness and backup plans</li>
                      <li>• Actively seek out available government assistance programs</li>
                      <li>• Consider diversifying your operations or markets</li>
                      <li>• Build strong relationships with suppliers and customers outside your immediate area</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">No Matter Your Score: Universal Actions</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Create or update your emergency response plan</li>
                      <li>• Build financial reserves for unexpected challenges</li>
                      <li>• Develop relationships with multiple suppliers/customers</li>
                      <li>• Stay informed about available assistance programs</li>
                      <li>• Connect with local agricultural extension or small business development centers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ExplanationPanel>

          {/* Regional Patterns and Insights */}
          <ExplanationPanel 
            title="Regional Patterns Across North Carolina - What the Statewide Data Shows"
            defaultOpen={false}
            importance="low"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                Looking at the map as a whole reveals important patterns about resilience across North Carolina. Understanding these trends can help you make informed decisions about your location, expansion plans, or preparation strategies.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Coastal vs. Inland Patterns</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Coastal counties</strong> often show higher disaster risk due to hurricanes and flooding, but may have better supply chain access through ports.
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Inland counties</strong> typically have lower disaster risk but may face supply chain challenges or limited access to credit.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">Urban vs. Rural Differences</h4>
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Urban counties</strong> generally have better access to credit and government programs, but higher competition and costs.
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Rural counties</strong> may have lower costs and specialized agricultural advantages, but potentially limited access to services.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">Economic Corridor Effects</h4>
                  <p className="text-sm text-purple-800 mb-2">
                    Counties along major highways (I-95, I-85, I-40) often have better supply chain scores due to transportation access.
                  </p>
                  <p className="text-sm text-purple-800">
                    Research Triangle and Charlotte metro areas typically show higher resilience due to economic diversity and resources.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Using This Information Strategically:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Location Planning:</strong> Consider these patterns when choosing where to start or expand your operation</li>
                  <li>• <strong>Partnership Opportunities:</strong> Look for complementary strengths in neighboring counties</li>
                  <li>• <strong>Market Expansion:</strong> Understand regional advantages when planning to serve new areas</li>
                  <li>• <strong>Risk Mitigation:</strong> Use knowledge of regional patterns to diversify your exposure</li>
                  <li>• <strong>Advocacy:</strong> Work with others in similar situations to advocate for targeted improvements</li>
                </ul>
              </div>
            </div>
          </ExplanationPanel>

          {/* Next Steps Guide */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What to Do Next - Your Action Plan</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Immediate Actions (This Week):</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Select your county on the map above and review your detailed resilience score</li>
                  <li>Visit either the <Link href="/agriculture" className="text-agriculture-600 hover:text-agriculture-700 underline">Agriculture Dashboard</Link> or <Link href="/business" className="text-business-600 hover:text-business-700 underline">Business Dashboard</Link> for your area</li>
                  <li>Complete the assessment wizard to get personalized recommendations</li>
                  <li>Review available government programs and bookmark relevant ones</li>
                  <li>Identify your county's lowest-scoring risk component and research solutions</li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Medium-Term Planning (This Month):</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Contact your local extension office or small business development center</li>
                  <li>Apply for relevant government assistance programs</li>
                  <li>Develop or update your emergency preparedness plan</li>
                  <li>Research and contact potential backup suppliers or alternative markets</li>
                  <li>Connect with other farmers/business owners in higher-resilience counties</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Remember:</strong> Resilience is not just about surviving challenges - it's about thriving despite them. This map gives you the information you need to make your operation stronger, more adaptable, and more successful over the long term.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Map Hero Section */}
      <section className="relative h-[500px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('/mappage2.png')"
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-5xl font-bold mb-6">Navigate Your Path to Resilience</h2>
            <p className="text-xl leading-relaxed mb-8">
              Discover North Carolina's risk landscape and find the insights you need to build a more resilient future for your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agriculture" className="btn-primary bg-agriculture-600 hover:bg-agriculture-700 text-white px-8 py-3 rounded-lg font-semibold">
                Agriculture Dashboard
              </Link>
              <Link href="/business" className="btn-secondary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
                Business Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Components */}
      {showInsuranceHelper && selectedCounty && (
        <InsuranceClaimHelper
          county={selectedCounty}
          entityType={entityType}
          onClose={() => setShowInsuranceHelper(false)}
        />
      )}

      {showDamageAssessment && selectedCounty && (
        <DamageAssessmentForm
          county={selectedCounty}
          entityType={entityType}
          disasterType="hurricane"
          onComplete={(assessment) => {
            console.log('Damage assessment completed:', assessment);
            setShowDamageAssessment(false);
          }}
          onCancel={() => setShowDamageAssessment(false)}
        />
      )}
    </div>
  );
}