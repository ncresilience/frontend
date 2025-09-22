'use client';

import { useState, useEffect } from 'react';
import { County } from '../types';
import { generatePDF } from '../lib/pdfGenerator';

interface DamageAssessment {
  assessment_id: string;
  assessment_date: string;
  county_fips: string;
  county_name: string;
  disaster_type: string;
  entity_type: 'agriculture' | 'small-business';
  assessor_info: {
    name: string;
    organization: string;
    contact: string;
    certification?: string;
  };
  property_info: {
    property_address: string;
    property_type: string;
    year_built?: number;
    total_square_footage?: number;
    total_acreage?: number;
  };
  damage_details: {
    damage_category: 'minor' | 'major' | 'severe' | 'destroyed';
    affected_percentage: number;
    primary_damage_cause: string;
    secondary_damage_causes: string[];
    damage_description: string;
    habitability_status?: 'habitable' | 'uninhabitable' | 'restricted';
    accessibility_status: 'accessible' | 'limited' | 'inaccessible';
  };
  financial_impact: {
    estimated_damage_cost: number;
    estimated_debris_removal_cost: number;
    lost_income_estimate?: number;
    insurance_coverage: {
      has_insurance: boolean;
      insurance_type: string[];
      claim_filed: boolean;
      coverage_adequate: boolean;
    };
  };
  specific_damages: Array<{
    item_category: string;
    item_description: string;
    damage_level: 'none' | 'minor' | 'major' | 'destroyed';
    replacement_cost: number;
    repair_cost?: number;
  }>;
  utilities_infrastructure: {
    electricity: 'working' | 'damaged' | 'destroyed';
    water: 'working' | 'damaged' | 'destroyed';
    sewer: 'working' | 'damaged' | 'destroyed';
    gas: 'working' | 'damaged' | 'destroyed' | 'not_applicable';
    communications: 'working' | 'damaged' | 'destroyed';
    roads_access: 'clear' | 'limited' | 'blocked';
  };
  agricultural_specific?: {
    crops_affected: Array<{
      crop_type: string;
      acres_affected: number;
      damage_percentage: number;
      growth_stage: string;
      expected_loss: number;
    }>;
    livestock_affected: Array<{
      animal_type: string;
      number_affected: number;
      fatalities: number;
      injuries: number;
      shelter_damage: boolean;
    }>;
    equipment_damage: Array<{
      equipment_type: string;
      damage_level: 'minor' | 'major' | 'destroyed';
      replacement_cost: number;
    }>;
    storage_facilities: Array<{
      facility_type: string;
      capacity: number;
      damage_percentage: number;
      contents_lost: boolean;
    }>;
  };
  photos_documentation: {
    photo_count: number;
    gps_coordinates?: string;
    photo_types: string[];
    additional_documentation: string[];
  };
  immediate_needs: {
    emergency_shelter_needed: boolean;
    medical_attention_needed: boolean;
    food_water_needed: boolean;
    temporary_power_needed: boolean;
    debris_removal_urgent: boolean;
    road_access_repair_needed: boolean;
  };
  next_steps: {
    fema_assistance_recommended: boolean;
    sba_disaster_loan_recommended: boolean;
    insurance_claim_priority: 'immediate' | 'standard' | 'low';
    contractor_estimates_needed: boolean;
    permits_required: string[];
  };
}

interface DamageAssessmentFormProps {
  county: County;
  entityType: 'agriculture' | 'small-business';
  disasterType?: string;
  onComplete: (assessment: DamageAssessment) => void;
  onCancel: () => void;
}

export default function DamageAssessmentForm({ 
  county, 
  entityType, 
  disasterType = 'hurricane',
  onComplete, 
  onCancel 
}: DamageAssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<Partial<DamageAssessment>>({
    assessment_id: `DA-${Date.now()}`,
    assessment_date: new Date().toISOString().split('T')[0],
    county_fips: county.fips_code,
    county_name: county.name,
    disaster_type: disasterType,
    entity_type: entityType,
    assessor_info: {
      name: '',
      organization: '',
      contact: ''
    },
    property_info: {
      property_address: '',
      property_type: entityType === 'agriculture' ? 'farm' : 'commercial'
    },
    damage_details: {
      damage_category: 'minor',
      affected_percentage: 0,
      primary_damage_cause: '',
      secondary_damage_causes: [],
      damage_description: '',
      accessibility_status: 'accessible'
    },
    financial_impact: {
      estimated_damage_cost: 0,
      estimated_debris_removal_cost: 0,
      insurance_coverage: {
        has_insurance: false,
        insurance_type: [],
        claim_filed: false,
        coverage_adequate: false
      }
    },
    specific_damages: [],
    utilities_infrastructure: {
      electricity: 'working',
      water: 'working',
      sewer: 'working',
      gas: 'not_applicable',
      communications: 'working',
      roads_access: 'clear'
    },
    photos_documentation: {
      photo_count: 0,
      photo_types: [],
      additional_documentation: []
    },
    immediate_needs: {
      emergency_shelter_needed: false,
      medical_attention_needed: false,
      food_water_needed: false,
      temporary_power_needed: false,
      debris_removal_urgent: false,
      road_access_repair_needed: false
    },
    next_steps: {
      fema_assistance_recommended: false,
      sba_disaster_loan_recommended: false,
      insurance_claim_priority: 'standard',
      contractor_estimates_needed: false,
      permits_required: []
    }
  });

  const steps = [
    { id: 'assessor', title: 'Assessor Information', description: 'Who is conducting this assessment' },
    { id: 'property', title: 'Property Information', description: 'Basic property details' },
    { id: 'damage', title: 'Damage Overview', description: 'General damage assessment' },
    { id: 'specific', title: 'Specific Damages', description: 'Detailed damage inventory' },
    { id: 'utilities', title: 'Utilities & Infrastructure', description: 'Service availability' },
    { id: 'financial', title: 'Financial Impact', description: 'Cost estimates and insurance' },
    { id: 'agriculture', title: 'Agricultural Details', description: 'Crops, livestock, equipment' },
    { id: 'documentation', title: 'Documentation', description: 'Photos and supporting materials' },
    { id: 'needs', title: 'Immediate Needs', description: 'Urgent assistance required' },
    { id: 'review', title: 'Review & Submit', description: 'Final review of assessment' }
  ].filter(step => {
    if (step.id === 'agriculture' && entityType !== 'agriculture') return false;
    return true;
  });

  const updateAssessment = (field: string, value: any) => {
    setAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (section: string, field: string, value: any) => {
    setAssessment(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const addSpecificDamage = () => {
    const newDamage = {
      item_category: '',
      item_description: '',
      damage_level: 'none' as const,
      replacement_cost: 0
    };
    
    setAssessment(prev => ({
      ...prev,
      specific_damages: [...(prev.specific_damages || []), newDamage]
    }));
  };

  const updateSpecificDamage = (index: number, field: string, value: any) => {
    setAssessment(prev => ({
      ...prev,
      specific_damages: prev.specific_damages?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const handleSubmit = async () => {
    try {
      // Generate assessment report
      const reportData = {
        ...assessment,
        completion_date: new Date().toISOString(),
        report_type: 'Preliminary Damage Assessment',
        fema_compliant: true
      };

      // Generate PDF report
      await generatePDF({
        title: `Damage Assessment Report - ${county.name} County`,
        content: reportData,
        filename: `damage_assessment_${county.name}_${assessment.assessment_id}.pdf`
      });

      // Call completion handler
      onComplete(assessment as DamageAssessment);
      
    } catch (error) {
      console.error('Failed to generate assessment report:', error);
      alert('Failed to generate assessment report. Please try again.');
    }
  };

  const renderAssessorStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessor Name *
          </label>
          <input
            type="text"
            value={assessment.assessor_info?.name || ''}
            onChange={(e) => updateNestedField('assessor_info', 'name', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization *
          </label>
          <input
            type="text"
            value={assessment.assessor_info?.organization || ''}
            onChange={(e) => updateNestedField('assessor_info', 'organization', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="e.g., County Emergency Management"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Information *
          </label>
          <input
            type="text"
            value={assessment.assessor_info?.contact || ''}
            onChange={(e) => updateNestedField('assessor_info', 'contact', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Phone or email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certification (Optional)
          </label>
          <input
            type="text"
            value={assessment.assessor_info?.certification || ''}
            onChange={(e) => updateNestedField('assessor_info', 'certification', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="e.g., FEMA certified assessor"
          />
        </div>
      </div>
    </div>
  );

  const renderPropertyStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Address *
        </label>
        <input
          type="text"
          value={assessment.property_info?.property_address || ''}
          onChange={(e) => updateNestedField('property_info', 'property_address', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Full address of damaged property"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            value={assessment.property_info?.property_type || ''}
            onChange={(e) => updateNestedField('property_info', 'property_type', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {entityType === 'agriculture' ? (
              <>
                <option value="farm">Farm</option>
                <option value="ranch">Ranch</option>
                <option value="dairy">Dairy Operation</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="processing">Processing Facility</option>
              </>
            ) : (
              <>
                <option value="commercial">Commercial Building</option>
                <option value="retail">Retail Store</option>
                <option value="office">Office Building</option>
                <option value="warehouse">Warehouse</option>
                <option value="manufacturing">Manufacturing Facility</option>
              </>
            )}
          </select>
        </div>

        {entityType === 'agriculture' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Acreage
            </label>
            <input
              type="number"
              value={assessment.property_info?.total_acreage || ''}
              onChange={(e) => updateNestedField('property_info', 'total_acreage', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Acres"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Square Footage
            </label>
            <input
              type="number"
              value={assessment.property_info?.total_square_footage || ''}
              onChange={(e) => updateNestedField('property_info', 'total_square_footage', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Square feet"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Year Built (if known)
        </label>
        <input
          type="number"
          value={assessment.property_info?.year_built || ''}
          onChange={(e) => updateNestedField('property_info', 'year_built', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="YYYY"
          min="1800"
          max={new Date().getFullYear()}
        />
      </div>
    </div>
  );

  const renderDamageStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Damage Category *
          </label>
          <select
            value={assessment.damage_details?.damage_category || 'minor'}
            onChange={(e) => updateNestedField('damage_details', 'damage_category', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="minor">Minor (&lt; 25% damage)</option>
            <option value="major">Major (25-50% damage)</option>
            <option value="severe">Severe (50-75% damage)</option>
            <option value="destroyed">Destroyed (&gt; 75% damage)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Affected Percentage
          </label>
          <input
            type="number"
            value={assessment.damage_details?.affected_percentage || 0}
            onChange={(e) => updateNestedField('damage_details', 'affected_percentage', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            max="100"
            placeholder="0-100%"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Damage Cause *
        </label>
        <select
          value={assessment.damage_details?.primary_damage_cause || ''}
          onChange={(e) => updateNestedField('damage_details', 'primary_damage_cause', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Select primary cause</option>
          <option value="wind">Wind Damage</option>
          <option value="flood">Flood/Water Damage</option>
          <option value="hail">Hail Damage</option>
          <option value="fire">Fire Damage</option>
          <option value="tornado">Tornado</option>
          <option value="debris">Debris Impact</option>
          <option value="structural">Structural Failure</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Accessibility
        </label>
        <select
          value={assessment.damage_details?.accessibility_status || 'accessible'}
          onChange={(e) => updateNestedField('damage_details', 'accessibility_status', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="accessible">Fully Accessible</option>
          <option value="limited">Limited Access</option>
          <option value="inaccessible">Inaccessible</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Damage Description
        </label>
        <textarea
          value={assessment.damage_details?.damage_description || ''}
          onChange={(e) => updateNestedField('damage_details', 'damage_description', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows={4}
          placeholder="Detailed description of damage observed..."
        />
      </div>
    </div>
  );

  const renderFinancialStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Damage Cost ($)
          </label>
          <input
            type="number"
            value={assessment.financial_impact?.estimated_damage_cost || 0}
            onChange={(e) => updateNestedField('financial_impact', 'estimated_damage_cost', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            placeholder="Total estimated repair/replacement cost"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Debris Removal Cost ($)
          </label>
          <input
            type="number"
            value={assessment.financial_impact?.estimated_debris_removal_cost || 0}
            onChange={(e) => updateNestedField('financial_impact', 'estimated_debris_removal_cost', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            placeholder="Estimated debris cleanup cost"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lost Income Estimate ($)
        </label>
        <input
          type="number"
          value={assessment.financial_impact?.lost_income_estimate || 0}
          onChange={(e) => updateNestedField('financial_impact', 'lost_income_estimate', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          min="0"
          placeholder="Business interruption or lost production"
        />
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Insurance Coverage</h4>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={assessment.financial_impact?.insurance_coverage.has_insurance || false}
              onChange={(e) => updateNestedField('financial_impact', 'insurance_coverage', {
                ...assessment.financial_impact?.insurance_coverage,
                has_insurance: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Has Insurance Coverage</span>
          </label>

          {assessment.financial_impact?.insurance_coverage.has_insurance && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Types (check all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Property', 'Crop', 'Business Interruption', 'Flood', 'Wind/Hail', 'Liability'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={assessment.financial_impact?.insurance_coverage.insurance_type?.includes(type) || false}
                        onChange={(e) => {
                          const currentTypes = assessment.financial_impact?.insurance_coverage.insurance_type || [];
                          const newTypes = e.target.checked 
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          updateNestedField('financial_impact', 'insurance_coverage', {
                            ...assessment.financial_impact?.insurance_coverage,
                            insurance_type: newTypes
                          });
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessment.financial_impact?.insurance_coverage.claim_filed || false}
                  onChange={(e) => updateNestedField('financial_impact', 'insurance_coverage', {
                    ...assessment.financial_impact?.insurance_coverage,
                    claim_filed: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Insurance Claim Filed</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assessment.financial_impact?.insurance_coverage.coverage_adequate || false}
                  onChange={(e) => updateNestedField('financial_impact', 'insurance_coverage', {
                    ...assessment.financial_impact?.insurance_coverage,
                    coverage_adequate: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Coverage Appears Adequate</span>
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Assessment Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Property:</strong> {assessment.property_info?.property_address}
          </div>
          <div>
            <strong>Damage Level:</strong> {assessment.damage_details?.damage_category}
          </div>
          <div>
            <strong>Primary Cause:</strong> {assessment.damage_details?.primary_damage_cause}
          </div>
          <div>
            <strong>Estimated Cost:</strong> ${assessment.financial_impact?.estimated_damage_cost?.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">Before Submitting:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>✓ All required fields completed</li>
          <li>✓ Photos and documentation collected</li>
          <li>✓ GPS coordinates recorded if available</li>
          <li>✓ Contact information verified</li>
          <li>✓ Damage estimates reasonable and documented</li>
        </ul>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Generated Documents</h4>
        <p className="text-sm text-gray-600 mb-4">
          This assessment will generate a FEMA-compliant Preliminary Damage Assessment report 
          that can be submitted to emergency management officials.
        </p>
        
        <button
          onClick={handleSubmit}
          className="btn-primary w-full"
        >
          Generate Assessment Report
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    const currentStepId = steps[currentStep]?.id;
    
    switch (currentStepId) {
      case 'assessor': return renderAssessorStep();
      case 'property': return renderPropertyStep();
      case 'damage': return renderDamageStep();
      case 'financial': return renderFinancialStep();
      case 'review': return renderReviewStep();
      default: 
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Step "{currentStepId}" is under development.</p>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn-primary mt-4"
            >
              Continue to Next Step
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">FEMA Damage Assessment Form</h2>
              <p className="text-red-100 mt-1">
                {county.name} County • {disasterType} • {entityType}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-red-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-gray-900">{steps[currentStep]?.title}</h3>
            <p className="text-sm text-gray-600">{steps[currentStep]?.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Save Draft
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                Complete Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}