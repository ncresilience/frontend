'use client';

import { ResilienceScore } from '../types';

interface RiskScoreCardProps {
  score: ResilienceScore;
  entityType: 'agriculture' | 'small-business';
  className?: string;
}

export default function RiskScoreCard({ score, entityType, className = '' }: RiskScoreCardProps) {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return 'text-green-600 bg-green-100';
    if (scoreValue >= 60) return 'text-yellow-600 bg-yellow-100';
    if (scoreValue >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (scoreValue: number) => {
    if (scoreValue >= 80) return 'High Resilience';
    if (scoreValue >= 60) return 'Moderate Resilience';
    if (scoreValue >= 40) return 'Low Resilience';
    return 'Very Low Resilience';
  };

  const getRiskColor = (riskValue: number) => {
    if (riskValue <= 20) return 'text-green-600 bg-green-100';
    if (riskValue <= 40) return 'text-yellow-600 bg-yellow-100';
    if (riskValue <= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLabel = (riskValue: number) => {
    if (riskValue <= 20) return 'Very Low Risk';
    if (riskValue <= 40) return 'Low Risk';
    if (riskValue <= 60) return 'Moderate Risk';
    if (riskValue <= 80) return 'High Risk';
    return 'Very High Risk';
  };

  const isAgriculture = entityType === 'agriculture';

  return (
    <div className={`card ${className}`}>
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${isAgriculture ? 'text-agriculture-700' : 'text-business-700'}`}>
          {isAgriculture ? 'Agricultural' : 'Small Business'} Resilience Score
        </h3>
        
        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="stroke-gray-200"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${isAgriculture ? 'stroke-agriculture-600' : 'stroke-business-600'}`}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${score.overall_score}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{score.overall_score}</div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
        </div>

        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score.overall_score)}`}>
          {getScoreLabel(score.overall_score)}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Risk Breakdown</h4>
        
        {/* Credit Risk */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Credit Risk</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{score.credit_risk_component}/100</div>
              <div className={`text-xs px-2 py-1 rounded ${getRiskColor(score.credit_risk_component)}`}>
                {getRiskLabel(score.credit_risk_component)}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span>Data Source: </span>
            <a href="https://www.uscourts.gov/statistics-reports/bankruptcy-filings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              US Bankruptcy Courts
            </a>
          </div>
        </div>

        {/* Disaster Risk */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Disaster Risk</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{score.disaster_risk_component}/100</div>
              <div className={`text-xs px-2 py-1 rounded ${getRiskColor(score.disaster_risk_component)}`}>
                {getRiskLabel(score.disaster_risk_component)}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span>Data Source: </span>
            <a href="https://www.fema.gov/flood-maps/products-tools/national-risk-index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              FEMA National Risk Index
            </a>
          </div>
        </div>

        {/* Supply Chain Risk */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Supply Chain Risk</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{score.supply_chain_risk_component}/100</div>
              <div className={`text-xs px-2 py-1 rounded ${getRiskColor(score.supply_chain_risk_component)}`}>
                {getRiskLabel(score.supply_chain_risk_component)}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span>Data Source: </span>
            <a href="https://www.census.gov/programs-surveys/county-business-patterns.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              Census County Business Patterns
            </a>
          </div>
        </div>

        {/* SBA Access Risk - temporarily disabled until SBA processing is working
        {score.sba_access_component !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Gov't Program Access</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{score.sba_access_component}/100</div>
                <div className={`text-xs px-2 py-1 rounded ${getRiskColor(score.sba_access_component)}`}>
                  {getRiskLabel(score.sba_access_component)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span>Data Source: </span>
              <a href="https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/open-data-sources" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                SBA Loan Records
              </a>
            </div>
          </div>
        )}
        */}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">Confidence Interval</div>
          <div>{score.confidence_lower} - {score.confidence_upper} points</div>
          <div className="text-xs text-blue-600 mt-1">
            Last updated: {new Date(score.calculation_date).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}