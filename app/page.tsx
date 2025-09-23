'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as apiModule from './lib/api';
import { Statistics } from './types';
import HelpTooltip from './components/HelpTooltip';
import ExplanationPanel from './components/ExplanationPanel';

function HomePage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        if (typeof window !== 'undefined') {
          const statistics = await apiModule.api.getStatistics();
          setStats(statistics);
        }
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="section-padding py-6">
        <div className="container-max">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-gray-900 cursor-default"
              onClickCapture={(e) => {
                if (e.detail === 3 && typeof window !== 'undefined') { // Triple click triggers admin access
                  const event = new CustomEvent('adminAccess');
                  window.dispatchEvent(event);
                }
              }}
            >
              NC Resilience Platform
            </h1>
            <div className="flex items-center space-x-4">
              {!loading && stats && (
                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {stats.total_counties} Counties
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Hero Background Image */}
        <div 
          className="relative h-[500px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('/nc-hero.png')"
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-5xl">
              <h2 className="text-6xl font-extrabold mb-6 leading-tight">
                Build Resilience for Your{' '}
                <span className="text-blue-200">North Carolina</span>{' '}
                Operation
              </h2>
              <p className="text-xl max-w-4xl mx-auto mb-8 leading-relaxed">
                Get personalized risk intelligence and preparedness guidance 
                tailored to your industry and location across all 100 North Carolina counties.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#choose-path" className="btn-primary bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold">
                  Get Started →
                </a>
                <a href="/map" className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-semibold">
                  View Risk Map
                </a>
                <a href="/about" className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-semibold">
                  About Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="section-padding py-16 bg-white">
          <div className="container-max">
            {/* Welcome Explanation */}
            <div className="max-w-4xl mx-auto mb-12">
              <ExplanationPanel 
                title="Welcome to the NC Resilience Platform - Your Guide to Staying Safe and Prepared"
                defaultOpen={true}
                importance="high"
              >
                <div className="space-y-4">
                  <p className="text-lg">
                    <strong>This platform helps North Carolina farmers and small business owners assess risk, build resilience, and strengthen supply chains to navigate economic challenges and natural events like hurricanes and droughts.</strong>
                  </p>
                  <p>
                    We've simplified complex government data and programs into easy-to-understand information specifically for people like you.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">What this platform does for you:</h4>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1">
                      <li>Shows your specific risks based on your location and business type</li>
                      <li>Finds government assistance programs you qualify for</li>
                      <li>Provides step-by-step emergency preparedness guidance</li>
                      <li>Connects you with resources during crisis situations</li>
                    </ul>
                  </div>
                </div>
              </ExplanationPanel>
            </div>

            {/* Statistics Cards */}
            {!loading && stats && (
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Coverage Across North Carolina</h3>
                  <p className="text-gray-600 max-w-3xl mx-auto">
                    Here's what our platform covers to help keep you informed and prepared. 
                    Click the "?" next to each number to learn what it means for you.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                  <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-primary-600">{stats.total_counties}</div>
                      <HelpTooltip 
                        title="Counties Covered" 
                        description="This means we have detailed risk information for all 100 counties in North Carolina - including yours. No matter where your farm or business is located, we have specific data for your area."
                        detailed="Each county has different risks like hurricanes on the coast, drought in the west, or flooding near rivers. We analyze your specific county's unique challenges."
                      />
                    </div>
                    <div className="text-sm text-gray-600">Counties Covered</div>
                    <div className="text-xs text-gray-500 mt-1">All of North Carolina included</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-primary-600">{stats.coverage.hazard_types}</div>
                      <HelpTooltip 
                        title="Types of Risks We Track" 
                        description="We monitor different types of disasters and challenges that could affect your farm or business - like hurricanes, floods, droughts, economic downturns, and supply chain problems."
                        detailed="Examples include: Hurricane damage to buildings/crops, drought affecting water supply, flooding of facilities, economic recession reducing customers, supply chain delays affecting materials you need."
                      />
                    </div>
                    <div className="text-sm text-gray-600">Hazard Types</div>
                    <div className="text-xs text-gray-500 mt-1">Weather, economic & supply risks</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-primary-600">{stats.total_resilience_scores}</div>
                      <HelpTooltip 
                        title="Risk Assessments Available" 
                        description="These are personalized reports we can create for your specific farm or business. Each assessment looks at your unique situation and gives you a score from 0-100, where higher scores mean you're better prepared."
                        detailed="Your assessment considers your location, business type, size, and local risks. It gives you specific recommendations for improving your preparedness and finding assistance programs."
                      />
                    </div>
                    <div className="text-sm text-gray-600">Risk Assessments</div>
                    <div className="text-xs text-gray-500 mt-1">Personalized for your situation</div>
                  </div>
                </div>
              </div>
            )}

          {/* Dual Path Selection */}
          <div id="choose-path" className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Choose Your Path
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Agriculture Path */}
              <Link href="/agriculture" className="group">
                <div className="card hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-transparent group-hover:border-agriculture-500">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-agriculture-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-agriculture-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Agriculture</h4>
                    <p className="text-gray-600 mb-6">
                      Specialized risk intelligence for farms, agricultural operations, 
                      and rural businesses. Get weather, market, and supply chain insights.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <div>• Crop and livestock risk assessment</div>
                      <div>• Weather and climate preparedness</div>
                      <div>• USDA program matching</div>
                      <div>• Market volatility planning</div>
                    </div>
                    {!loading && stats && (
                      <div className="bg-agriculture-50 rounded-lg p-3 mb-6">
                        <div className="text-sm text-agriculture-700">
                          Average Resilience Score: <span className="font-semibold">{stats.average_scores.agriculture}/100</span>
                        </div>
                      </div>
                    )}
                    <div className="btn-primary bg-agriculture-600 hover:bg-agriculture-700 w-full text-center block">
                      Enter Agriculture Platform
                    </div>
                  </div>
                </div>
              </Link>

              {/* Small Business Path */}
              <Link href="/business" className="group">
                <div className="card hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-transparent group-hover:border-business-500">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-business-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-business-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Small Business</h4>
                    <p className="text-gray-600 mb-6">
                      Comprehensive resilience planning for local businesses, 
                      retailers, and service providers across North Carolina.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <div>• Business continuity planning</div>
                      <div>• Disaster recovery strategies</div>
                      <div>• SBA program navigation</div>
                      <div>• Supply chain diversification</div>
                    </div>
                    {!loading && stats && (
                      <div className="bg-business-50 rounded-lg p-3 mb-6">
                        <div className="text-sm text-business-700">
                          Average Resilience Score: <span className="font-semibold">{stats.average_scores.business}/100</span>
                        </div>
                      </div>
                    )}
                    <div className="btn-primary bg-business-600 hover:bg-business-700 w-full text-center block">
                      Enter Business Platform
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Interactive Tools */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Interactive Risk Map
                </h3>
                <p className="text-gray-600 mb-4">
                  Visualize resilience scores across all 100 North Carolina counties. 
                  Compare risks and identify patterns.
                </p>
                <Link href="/map" className="btn-primary bg-blue-600 hover:bg-blue-700 inline-block">
                  View Interactive Map →
                </Link>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive data visualizations, trends analysis, and 
                  detailed statistical insights.
                </p>
                <Link href="/analytics" className="btn-primary bg-purple-600 hover:bg-purple-700 inline-block">
                  View Analytics →
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Platform Features
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Risk Intelligence</h4>
                <p className="text-gray-600">
                  Data-driven risk assessments combining credit, disaster, and supply chain factors.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Government Programs</h4>
                <p className="text-gray-600">
                  Automated matching to federal and state assistance programs with application guidance.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Crisis Response</h4>
                <p className="text-gray-600">
                  Real-time emergency guidance and recovery resources when disasters strike.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="section-padding py-12 bg-white border-t">
        <div className="container-max">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              NC Resilience Platform - A Foundation Initiative Building Stronger Communities
            </p>
            <p className="text-sm">
              Open source project • Data from FEMA, USDA, SBA, and other federal agencies • © 2024 NC Resilience Foundation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;