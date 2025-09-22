'use client';

import { useState } from 'react';
import { County } from '../types';

interface WizardAssessment {
  county_fips: string;
  entity_type: string;
  responses: Record<string, any>;
  risk_factors: string[];
  recommendations: string[];
  score_modifiers: Record<string, number>;
}

interface WizardResultsProps {
  assessment: WizardAssessment;
  county: County;
  onClose: () => void;
  onStartOver: () => void;
  onViewPrograms?: () => void;
}

export default function WizardResults({ assessment, county, onClose, onStartOver, onViewPrograms }: WizardResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'recommendations' | 'actions'>('overview');

  const calculateAdjustedScore = (baseScore: number = 65): number => {
    let adjusted = baseScore;
    
    // Apply modifiers
    Object.values(assessment.score_modifiers).forEach(modifier => {
      adjusted += modifier;
    });
    
    return Math.max(0, Math.min(100, Math.round(adjusted)));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Resilience';
    if (score >= 60) return 'Moderate Resilience';
    if (score >= 40) return 'Low Resilience';
    return 'Very Low Resilience';
  };

  const adjustedScore = calculateAdjustedScore();
  const preparednessLevel = assessment.responses.preparedness_level || 50;
  const insuranceCoverage = assessment.responses.insurance_coverage || [];
  const keyRisks = assessment.responses.key_risks || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-gray-200"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="stroke-blue-600"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${adjustedScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{adjustedScore}</div>
                    <div className="text-sm text-gray-500">out of 100</div>
                  </div>
                </div>
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(adjustedScore)}`}>
                {getScoreLabel(adjustedScore)}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{keyRisks.length}</div>
                <div className="text-sm text-gray-600">Priority Risks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{preparednessLevel}%</div>
                <div className="text-sm text-gray-600">Preparedness</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{insuranceCoverage.length}</div>
                <div className="text-sm text-gray-600">Protections</div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Key Insights</h4>
              <div className="space-y-3">
                {assessment.risk_factors.map((factor, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-5 h-5 text-orange-600 mt-0.5">⚠️</div>
                    <div className="text-sm text-orange-800">{factor}</div>
                  </div>
                ))}
                {assessment.risk_factors.length === 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-5 h-5 text-green-600 mt-0.5">✅</div>
                    <div className="text-sm text-green-800">No major risk factors identified from your responses.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Your Priority Risks</h4>
              <div className="space-y-3">
                {keyRisks.map((risk: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{risk}</span>
                    <span className="text-sm text-red-600 font-medium">High Priority</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Risk Assessment Details</h4>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">Preparedness Level</span>
                    <span className="text-lg font-bold text-blue-600">{preparednessLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${preparednessLevel}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Insurance Coverage</div>
                  <div className="text-sm text-gray-600 mb-2">
                    {insuranceCoverage.length} of 7 recommended protections in place
                  </div>
                  <div className="space-y-1">
                    {insuranceCoverage.map((coverage: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span className="text-gray-700">{coverage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Personalized Recommendations</h4>
              <div className="space-y-4">
                {assessment.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-blue-800 font-medium">{rec}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-2">Next Steps</h5>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>• Schedule a consultation with a local resilience advisor</div>
                <div>• Review your current insurance policies with an agent</div>
                <div>• Create or update your emergency response plan</div>
                <div>• Join your county's emergency notification system</div>
              </div>
            </div>
          </div>
        );

      case 'actions':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Immediate Actions</h4>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Create Emergency Plan</span>
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">High Priority</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Develop a comprehensive plan for various emergency scenarios
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Download Template →
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Review Insurance Coverage</span>
                    <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Medium Priority</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Assess current coverage and identify gaps
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Find Local Agents →
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Build Emergency Fund</span>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Ongoing</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Establish reserves for 3-6 months of operating expenses
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Financial Planning Resources →
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-800 mb-2">Free Resources</h5>
              <div className="text-sm text-green-700 space-y-1">
                <div>• SCORE small business mentoring</div>
                <div>• SBA disaster preparedness training</div>
                <div>• Extension office agricultural programs</div>
                <div>• FEMA Ready.gov planning guides</div>
              </div>
            </div>

            {onViewPrograms && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Government Assistance Programs</h5>
                <p className="text-sm text-blue-700 mb-3">
                  Based on your assessment, we've identified relevant federal and state programs that may help your operation.
                </p>
                <button 
                  onClick={onViewPrograms}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  View Matching Programs →
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Risk Assessment Results</h2>
              <p className="text-gray-600 mt-1">
                {county.name} County • {assessment.entity_type === 'agriculture' ? 'Agricultural' : 'Small Business'} Assessment
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'risks', label: 'Risk Analysis' },
                { id: 'recommendations', label: 'Recommendations' },
                { id: 'actions', label: 'Action Plan' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onStartOver}
            className="btn-secondary"
          >
            Start Over
          </button>
          
          <div className="space-x-3">
            <button className="btn-secondary">
              Save Results
            </button>
            <button className="btn-primary">
              Get Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}