'use client';

import { useState } from 'react';
import { County } from '../types';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: 'selection' | 'checklist' | 'slider' | 'input';
  options?: string[];
  required?: boolean;
}

interface RiskWizardProps {
  county: County;
  entityType: 'agriculture' | 'small-business';
  onComplete: (assessment: WizardAssessment) => void;
  onCancel: () => void;
}

interface WizardAssessment {
  county_fips: string;
  entity_type: string;
  responses: Record<string, any>;
  risk_factors: string[];
  recommendations: string[];
  score_modifiers: Record<string, number>;
}

export default function RiskWizard({ county, entityType, onComplete, onCancel }: RiskWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const getSteps = (): WizardStep[] => {
    const baseSteps: WizardStep[] = [
      {
        id: 'organization_size',
        title: 'Organization Size',
        description: 'Help us understand the scale of your operation',
        type: 'selection',
        options: entityType === 'agriculture' 
          ? ['Small family farm (< 50 acres)', 'Medium farm (50-500 acres)', 'Large farm (500+ acres)', 'Agricultural cooperative', 'Processing facility']
          : ['Solo entrepreneur', 'Small business (2-10 employees)', 'Medium business (11-50 employees)', 'Large local business (50+ employees)', 'Multi-location business'],
        required: true
      },
      {
        id: 'revenue_range',
        title: 'Annual Revenue',
        description: 'This helps us recommend appropriate assistance programs',
        type: 'selection',
        options: ['Under $50,000', '$50,000 - $250,000', '$250,000 - $1,000,000', '$1,000,000 - $5,000,000', 'Over $5,000,000'],
        required: true
      },
      {
        id: 'key_risks',
        title: 'Primary Concerns',
        description: 'Select the risks that concern you most (check all that apply)',
        type: 'checklist',
        options: entityType === 'agriculture'
          ? ['Severe weather events', 'Drought conditions', 'Crop diseases/pests', 'Market price volatility', 'Supply chain disruptions', 'Equipment failures', 'Labor shortages', 'Regulatory changes']
          : ['Natural disasters', 'Economic downturns', 'Supply chain issues', 'Cyber security threats', 'Key employee loss', 'Customer concentration', 'Rent/lease issues', 'Competition'],
        required: true
      },
      {
        id: 'preparedness_level',
        title: 'Current Preparedness',
        description: 'How prepared do you feel for major disruptions?',
        type: 'slider',
        required: true
      },
      {
        id: 'insurance_coverage',
        title: 'Insurance & Financial Protection',
        description: 'What protection do you currently have?',
        type: 'checklist',
        options: entityType === 'agriculture'
          ? ['Crop insurance', 'Livestock insurance', 'Equipment insurance', 'Business interruption insurance', 'Emergency fund (3+ months expenses)', 'Line of credit', 'Diversified income streams']
          : ['General liability insurance', 'Property insurance', 'Business interruption insurance', 'Cyber liability insurance', 'Emergency fund (3+ months expenses)', 'Line of credit', 'Key person insurance'],
        required: false
      },
      {
        id: 'recovery_timeline',
        title: 'Recovery Expectations',
        description: 'How long could your operation survive a major disruption?',
        type: 'selection',
        options: ['Less than 1 week', '1-2 weeks', '1 month', '2-3 months', '6 months', 'More than 6 months'],
        required: true
      }
    ];

    return baseSteps;
  };

  const steps = getSteps();
  const currentStepData = steps[currentStep];

  const handleStepResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentStepData.id]: value
    }));
  };

  const canProceed = () => {
    if (!currentStepData.required) return true;
    const response = responses[currentStepData.id];
    
    if (currentStepData.type === 'checklist') {
      return Array.isArray(response) && response.length > 0;
    }
    
    return response !== undefined && response !== '';
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeAssessment();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeAssessment = () => {
    const assessment: WizardAssessment = {
      county_fips: county.fips_code,
      entity_type: entityType,
      responses,
      risk_factors: generateRiskFactors(),
      recommendations: generateRecommendations(),
      score_modifiers: calculateScoreModifiers()
    };
    
    onComplete(assessment);
  };

  const generateRiskFactors = (): string[] => {
    const factors: string[] = [];
    
    // Analyze responses to identify risk factors
    const selectedRisks = responses.key_risks || [];
    const preparedness = responses.preparedness_level || 0;
    const insurance = responses.insurance_coverage || [];
    const recoveryTime = responses.recovery_timeline;
    
    if (preparedness < 30) factors.push('Low disaster preparedness');
    if (insurance.length < 3) factors.push('Insufficient insurance coverage');
    if (recoveryTime && ['Less than 1 week', '1-2 weeks'].includes(recoveryTime)) {
      factors.push('Limited financial reserves');
    }
    if (selectedRisks.length > 5) factors.push('Multiple high-priority risks');
    
    return factors;
  };

  const generateRecommendations = (): string[] => {
    const recommendations: string[] = [];
    const preparedness = responses.preparedness_level || 0;
    const insurance = responses.insurance_coverage || [];
    const risks = responses.key_risks || [];
    
    if (preparedness < 50) {
      recommendations.push('Develop a comprehensive emergency response plan');
    }
    
    if (insurance.length < 3) {
      recommendations.push('Review and expand insurance coverage options');
    }
    
    if (risks.includes('Supply chain disruptions') || risks.includes('Supply chain issues')) {
      recommendations.push('Identify alternative suppliers and backup vendors');
    }
    
    if (entityType === 'agriculture' && risks.includes('Severe weather events')) {
      recommendations.push('Consider climate-adaptive farming practices');
    }
    
    if (entityType === 'small-business' && risks.includes('Cyber security threats')) {
      recommendations.push('Implement cybersecurity training and data backup systems');
    }
    
    return recommendations;
  };

  const calculateScoreModifiers = (): Record<string, number> => {
    const modifiers: Record<string, number> = {};
    const preparedness = responses.preparedness_level || 0;
    const insurance = responses.insurance_coverage || [];
    
    // Preparedness modifier
    modifiers.preparedness = Math.round((preparedness - 50) / 10);
    
    // Insurance modifier
    modifiers.insurance = Math.min(insurance.length * 2, 10);
    
    return modifiers;
  };

  const renderStepContent = () => {
    const currentResponse = responses[currentStepData.id];

    switch (currentStepData.type) {
      case 'selection':
        return (
          <div className="space-y-3">
            {currentStepData.options?.map((option) => (
              <button
                key={option}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  currentResponse === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }`}
                onClick={() => handleStepResponse(option)}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-3">
            {currentStepData.options?.map((option) => {
              const isSelected = Array.isArray(currentResponse) && currentResponse.includes(option);
              return (
                <button
                  key={option}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    const current = Array.isArray(currentResponse) ? currentResponse : [];
                    const updated = isSelected
                      ? current.filter(item => item !== option)
                      : [...current, option];
                    handleStepResponse(updated);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-6">
            <div className="px-4">
              <input
                type="range"
                min="0"
                max="100"
                value={currentResponse || 50}
                onChange={(e) => handleStepResponse(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Not prepared</span>
                <span>Moderately prepared</span>
                <span>Very prepared</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{currentResponse || 50}/100</div>
              <div className="text-sm text-gray-600">Preparedness Level</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Risk Assessment
              </h2>
              <p className="text-gray-600 mt-1">
                {county.name} County - Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}