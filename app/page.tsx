'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as apiModule from './lib/api';
import { Statistics } from './types';
import HelpTooltip from './components/HelpTooltip';

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
          className="relative h-[600px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('/nc-hero.png')"
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-6xl">
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                Protect Your Business.<br />
                <span className="text-blue-200">Build Resilience.</span><br />
                <span className="text-green-200">Access Resources.</span>
              </h2>
              <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-4 leading-relaxed font-medium text-blue-100">
                Risk intelligence platform for North Carolina farmers and small business owners
              </p>
              <p className="text-lg max-w-3xl mx-auto mb-8 leading-relaxed opacity-90">
                Assess risks, strengthen supply chains, and access government programs 
                tailored to your industry and location across all 100 NC counties.
              </p>
              
              {/* Social Proof */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>All 100 NC Counties</span>
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>5 Key Government Programs</span>
                </div>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Real-time Risk Data</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#choose-path" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-xl font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 inline-block">
                  Assess My Risk →
                </a>
                <a href="/map" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 inline-block">
                  View Risk Map
                </a>
                <a href="#how-it-works" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 inline-block">
                  How It Works
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div className="py-16 bg-gray-50">
          <div className="container-max">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Stay Resilient
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We've simplified complex government data and programs into easy-to-understand tools 
                specifically designed for North Carolina farmers and small business owners.
              </p>
            </div>

            {/* Value Proposition Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* Card 1: Know Your Risks */}
              <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Know Your Risks</h4>
                <p className="text-gray-600">Get personalized risk assessments based on your specific location and business type across all 100 NC counties.</p>
              </div>

              {/* Card 2: Find Resources */}
              <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Find Resources</h4>
                <p className="text-gray-600">Discover government assistance programs, loans, and grants you qualify for with our intelligent matching system.</p>
              </div>

              {/* Card 3: Build Resilience */}
              <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Build Resilience</h4>
                <p className="text-gray-600">Access step-by-step preparedness guidance and tools to strengthen your business against future challenges.</p>
              </div>

              {/* Card 4: Stay Connected */}
              <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8V4l8 8-8 8v-4H0l12-8z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Stay Connected</h4>
                <p className="text-gray-600">Get real-time alerts and connect with emergency resources during crisis situations when you need them most.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="py-16 bg-white">
          <div className="container-max">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in just three simple steps
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-3">Tell Us About Your Business</h4>
                <p className="text-lg text-gray-600">Share your location, business type, and key details so we can provide personalized insights.</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-3">Get Your Risk Assessment</h4>
                <p className="text-lg text-gray-600">Receive a comprehensive analysis of risks specific to your operation and location.</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-3">Access Your Resources</h4>
                <p className="text-lg text-gray-600">Discover matched programs, preparedness tools, and ongoing support for your business.</p>
              </div>
            </div>

            <div className="text-center">
              <a href="#choose-path" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-xl font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 inline-block">
                Start Your Assessment →
              </a>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="section-padding py-16 bg-gray-50">
          <div className="container-max">

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