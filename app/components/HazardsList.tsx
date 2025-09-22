'use client';

import { DisasterRisk, HAZARD_TYPES } from '../types';

interface HazardsListProps {
  risks: DisasterRisk[];
  className?: string;
}

export default function HazardsList({ risks, className = '' }: HazardsListProps) {
  const sortedRisks = risks.sort((a, b) => b.risk_score - a.risk_score);
  const topRisks = sortedRisks.slice(0, 6);

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getHazardIcon = (hazardType: string) => {
    switch (hazardType) {
      case 'HRCN':
        return 'H';
      case 'DRGT':
        return 'D';
      case 'RFLD':
      case 'CFLD':
        return 'F';
      case 'WFIR':
        return 'W';
      case 'TRND':
        return 'T';
      case 'ERQK':
        return 'E';
      case 'HAIL':
        return 'HA';
      case 'LTNG':
        return 'L';
      case 'SWND':
        return 'SW';
      case 'ISTM':
      case 'WNTW':
        return 'WW';
      case 'HWAV':
        return 'HW';
      case 'CWAV':
        return 'CW';
      default:
        return '!';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (risks.length === 0) {
    return (
      <div className={`card ${className}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Natural Disaster Risks</h3>
        <div className="text-center py-8 text-gray-500">
          No disaster risk data available for this county.
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Natural Disaster Risks</h3>
        <span className="text-sm text-gray-500">{risks.length} hazards assessed</span>
      </div>

      <div className="space-y-3">
        {topRisks.map((risk, index) => (
          <div
            key={risk.hazard_type}
            className={`flex items-center justify-between p-4 rounded-lg border ${getRiskColor(risk.risk_score)}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {getHazardIcon(risk.hazard_type)}
              </div>
              <div>
                <div className="font-medium">
                  {HAZARD_TYPES[risk.hazard_type as keyof typeof HAZARD_TYPES] || risk.hazard_type}
                </div>
                <div className="text-sm opacity-75">
                  Risk Rating: {risk.risk_rating}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold">
                {Math.round(risk.risk_score)}
              </div>
              <div className="text-sm opacity-75">
                {formatCurrency(risk.annual_loss_expected)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {risks.length > 6 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all {risks.length} hazards →
          </button>
        </div>
      )}

      <div className="mt-6 p-3 bg-gray-100 rounded-lg">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">About Risk Scores</div>
          <div>
            Risk scores range from 0-100, where higher scores indicate greater risk.
            Annual loss estimates represent expected economic impact per year.
          </div>
        </div>
      </div>
    </div>
  );
}