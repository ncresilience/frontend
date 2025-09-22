'use client';

import { useState, useEffect } from 'react';
import { County } from '../types';
import { generatePDF } from '../lib/pdfGenerator';

interface ClaimDocument {
  id: string;
  type: 'crop_loss' | 'property_damage' | 'business_interruption' | 'livestock_loss' | 'equipment_damage';
  title: string;
  description: string;
  required_fields: string[];
  supporting_documents: string[];
  typical_timeline: string;
  tips: string[];
}

interface InsuranceProvider {
  id: string;
  name: string;
  type: 'crop' | 'property' | 'liability' | 'business';
  contact: {
    phone: string;
    website: string;
    claim_phone: string;
  };
  coverage_areas: string[];
  claim_process: string[];
}

interface ClaimFormData {
  claim_type: string;
  incident_date: string;
  incident_description: string;
  estimated_loss: number;
  policy_number: string;
  contact_info: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  damage_details: {
    affected_acres?: number;
    crop_type?: string;
    growth_stage?: string;
    cause_of_loss: string;
    weather_conditions: string;
  };
  documentation: {
    photos: boolean;
    receipts: boolean;
    yield_records: boolean;
    weather_reports: boolean;
  };
}

interface InsuranceClaimHelperProps {
  county: County;
  entityType: 'agriculture' | 'small-business';
  onClose: () => void;
}

export default function InsuranceClaimHelper({ county, entityType, onClose }: InsuranceClaimHelperProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'form' | 'providers' | 'resources'>('templates');
  const [selectedClaimType, setSelectedClaimType] = useState<string>('');
  const [formData, setFormData] = useState<ClaimFormData>({
    claim_type: '',
    incident_date: '',
    incident_description: '',
    estimated_loss: 0,
    policy_number: '',
    contact_info: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    damage_details: {
      cause_of_loss: '',
      weather_conditions: ''
    },
    documentation: {
      photos: false,
      receipts: false,
      yield_records: false,
      weather_reports: false
    }
  });

  const claimTemplates: ClaimDocument[] = [
    {
      id: 'crop-hail',
      type: 'crop_loss',
      title: 'Crop Hail Damage Claim',
      description: 'Document hail damage to growing crops for insurance claims',
      required_fields: [
        'Date and time of hail event',
        'Affected acreage',
        'Crop type and growth stage',
        'Estimated percentage loss',
        'Weather service verification'
      ],
      supporting_documents: [
        'Photos of damaged crops (multiple angles)',
        'Weather service reports',
        'Soil/plant samples if requested',
        'Yield history (3-5 years)',
        'Planting records and receipts'
      ],
      typical_timeline: '72 hours to report, 30 days for documentation',
      tips: [
        'Take photos immediately after damage',
        'Do not destroy damaged crops until adjuster visit',
        'Get weather verification from local NWS office',
        'Document pre-loss crop condition if possible'
      ]
    },
    {
      id: 'crop-drought',
      type: 'crop_loss',
      title: 'Drought/Prevented Planting Claim',
      description: 'Document drought losses or inability to plant due to conditions',
      required_fields: [
        'Intended planting dates',
        'Actual soil conditions',
        'Weather data/precipitation records',
        'Affected acreage by field',
        'Alternative actions taken'
      ],
      supporting_documents: [
        'Soil moisture readings',
        'Weather station data',
        'Photos of field conditions',
        'Input purchase receipts',
        'Historical planting records'
      ],
      typical_timeline: 'Report by final planting date + 10 days',
      tips: [
        'Document attempts to plant or continue farming',
        'Keep detailed weather records',
        'Photo document soil conditions regularly',
        'Maintain communication with insurance agent'
      ]
    },
    {
      id: 'equipment-damage',
      type: 'equipment_damage',
      title: 'Farm Equipment Damage Claim',
      description: 'Document damage to farm machinery and equipment',
      required_fields: [
        'Equipment description and serial numbers',
        'Date of loss',
        'Cause of damage',
        'Estimated repair/replacement cost',
        'Current condition assessment'
      ],
      supporting_documents: [
        'Photos of damaged equipment',
        'Repair estimates (2-3 quotes)',
        'Purchase receipts/maintenance records',
        'Police report (if applicable)',
        'Towing/recovery receipts'
      ],
      typical_timeline: 'Report immediately, complete claim within 60 days',
      tips: [
        'Don\'t move damaged equipment until photos taken',
        'Get multiple repair estimates',
        'Keep all damaged parts for adjuster inspection',
        'Document any emergency repairs made'
      ]
    },
    {
      id: 'business-interruption',
      type: 'business_interruption',
      title: 'Business Interruption Claim',
      description: 'Document lost income due to covered perils',
      required_fields: [
        'Period of interruption',
        'Normal business operations',
        'Financial records (pre-loss)',
        'Extra expenses incurred',
        'Mitigation efforts made'
      ],
      supporting_documents: [
        'Financial statements (2-3 years)',
        'Tax returns',
        'Bank statements',
        'Payroll records',
        'Invoices for extra expenses',
        'Communication records with customers/suppliers'
      ],
      typical_timeline: 'Report within 30 days, ongoing documentation required',
      tips: [
        'Keep detailed records of all expenses',
        'Document efforts to resume operations',
        'Maintain customer communication records',
        'Track lost sales and contracts'
      ]
    }
  ];

  const insuranceProviders: InsuranceProvider[] = [
    {
      id: 'rma-crop',
      name: 'USDA Risk Management Agency',
      type: 'crop',
      contact: {
        phone: '1-888-327-4662',
        website: 'https://www.rma.usda.gov',
        claim_phone: '1-888-327-4662'
      },
      coverage_areas: ['All NC Counties'],
      claim_process: [
        'Contact approved insurance provider within 72 hours',
        'Provide notice of damage or loss',
        'Complete and submit claim forms',
        'Adjuster inspection of damaged crops',
        'Provide required documentation',
        'Claim settlement and payment'
      ]
    },
    {
      id: 'farm-bureau',
      name: 'NC Farm Bureau Insurance',
      type: 'property',
      contact: {
        phone: '1-800-662-3276',
        website: 'https://www.ncfb.org',
        claim_phone: '1-800-662-3276'
      },
      coverage_areas: ['Statewide'],
      claim_process: [
        'Report claim immediately',
        'Complete claim forms',
        'Document damage with photos',
        'Meet with adjuster',
        'Obtain repair estimates',
        'Claim resolution'
      ]
    },
    {
      id: 'nationwide-agri',
      name: 'Nationwide Agribusiness',
      type: 'crop',
      contact: {
        phone: '1-800-421-3535',
        website: 'https://www.nationwide.com/agriculture',
        claim_phone: '1-800-421-3535'
      },
      coverage_areas: ['Major agricultural counties'],
      claim_process: [
        'Report loss within required timeframe',
        'Complete acreage and production reports',
        'Provide loss documentation',
        'Field inspection by adjuster',
        'Submit final claim documentation',
        'Claim payment processing'
      ]
    }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate claim documentation package
    const claimPackage = {
      claim_summary: {
        type: formData.claim_type,
        date: formData.incident_date,
        location: `${county.name}, NC`,
        estimated_loss: formData.estimated_loss
      },
      contact_information: formData.contact_info,
      incident_details: {
        description: formData.incident_description,
        damage_details: formData.damage_details
      },
      documentation_checklist: formData.documentation,
      next_steps: getNextSteps(formData.claim_type),
      emergency_contacts: getEmergencyContacts()
    };

    try {
      // Generate PDF claim package
      await generatePDF({
        title: `Insurance Claim Documentation - ${county.name} County`,
        content: claimPackage,
        filename: `insurance_claim_${county.name}_${new Date().toISOString().split('T')[0]}.pdf`
      });

      alert('Claim documentation package generated successfully!');
    } catch (error) {
      console.error('Failed to generate claim package:', error);
      alert('Failed to generate documentation. Please try again.');
    }
  };

  const getNextSteps = (claimType: string): string[] => {
    const baseSteps = [
      'Contact your insurance provider immediately',
      'Document all damage with photos',
      'Gather required supporting documents',
      'Complete all claim forms accurately',
      'Cooperate with adjuster inspection',
      'Keep records of all communications'
    ];

    if (claimType === 'crop_loss') {
      return [
        'Report loss within 72 hours',
        ...baseSteps,
        'Preserve damaged crops for inspection',
        'Obtain weather verification',
        'Review policy coverage details'
      ];
    }

    return baseSteps;
  };

  const getEmergencyContacts = () => {
    return [
      {
        name: 'County Emergency Management',
        phone: `Contact ${county.name} County EM`,
        purpose: 'Disaster declaration and emergency assistance'
      },
      {
        name: 'County Extension Office',
        phone: `Contact ${county.name} Cooperative Extension`,
        purpose: 'Agricultural damage assessment and guidance'
      },
      {
        name: 'USDA Farm Service Agency',
        phone: 'Contact local FSA office',
        purpose: 'Disaster loan programs and assistance'
      }
    ];
  };

  const renderTemplateTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {claimTemplates
          .filter(template => 
            entityType === 'agriculture' ? 
            ['crop_loss', 'equipment_damage'].includes(template.type) :
            ['business_interruption', 'property_damage'].includes(template.type)
          )
          .map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                <p className="text-gray-600 mt-1">{template.description}</p>
                <div className="mt-2 text-sm text-blue-600">
                  Timeline: {template.typical_timeline}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedClaimType(template.id);
                  setActiveTab('form');
                }}
                className="btn-primary text-sm"
              >
                Use Template
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Required Information:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {template.required_fields.map((field, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Supporting Documents:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {template.supporting_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <h4 className="font-medium text-yellow-800 mb-2">Important Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {template.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormTab = () => (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Claim Documentation Helper</h3>
          <p className="text-blue-800 text-sm">
            Complete this form to generate a comprehensive claim documentation package with all required information organized for your insurance provider.
          </p>
        </div>

        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim Type *
              </label>
              <select
                value={formData.claim_type}
                onChange={(e) => setFormData(prev => ({ ...prev, claim_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select claim type</option>
                <option value="crop_loss">Crop Loss</option>
                <option value="equipment_damage">Equipment Damage</option>
                <option value="property_damage">Property Damage</option>
                <option value="business_interruption">Business Interruption</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Incident *
              </label>
              <input
                type="date"
                value={formData.incident_date}
                onChange={(e) => setFormData(prev => ({ ...prev, incident_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number
              </label>
              <input
                type="text"
                value={formData.policy_number}
                onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter policy number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Loss ($)
              </label>
              <input
                type="number"
                value={formData.estimated_loss}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_loss: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incident Description *
            </label>
            <textarea
              value={formData.incident_description}
              onChange={(e) => setFormData(prev => ({ ...prev, incident_description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={4}
              placeholder="Describe what happened, when, and the extent of damage..."
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.contact_info.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact_info: { ...prev.contact_info, name: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.contact_info.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact_info: { ...prev.contact_info, phone: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.contact_info.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact_info: { ...prev.contact_info, email: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
              <input
                type="text"
                value={formData.contact_info.address}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact_info: { ...prev.contact_info, address: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Address of damaged property"
              />
            </div>
          </div>
        </div>

        {/* Documentation Checklist */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation Checklist</h3>
          <p className="text-gray-600 mb-4">Check off the documentation you have gathered:</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(formData.documentation).map(([key, checked]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documentation: {
                      ...prev.documentation,
                      [key]: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Generate Claim Package
          </button>
        </div>
      </form>
    </div>
  );

  const renderProvidersTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Insurance Providers in {county.name} County</h3>
        <p className="text-blue-800 text-sm">
          Contact information for major insurance providers serving your area. Always report claims as soon as possible.
        </p>
      </div>

      <div className="grid gap-6">
        {insuranceProviders.map((provider) => (
          <div key={provider.id} className="card border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  Type: <span className="capitalize">{provider.type} Insurance</span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium text-red-600">Claims: {provider.contact.claim_phone}</div>
                <div className="text-gray-600">General: {provider.contact.phone}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Coverage Areas:</h4>
                <ul className="text-sm text-gray-600">
                  {provider.coverage_areas.map((area, idx) => (
                    <li key={idx}>• {area}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Claim Process:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  {provider.claim_process.map((step, idx) => (
                    <li key={idx}>{idx + 1}. {step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={provider.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Visit Website →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Government Resources</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800">USDA Disaster Assistance</h4>
              <p className="text-sm text-gray-600 mb-2">Emergency loans and assistance for agricultural losses</p>
              <a href="https://www.farmers.gov/recover" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-700 text-sm underline">
                Visit farmers.gov/recover →
              </a>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">SBA Disaster Loans</h4>
              <p className="text-sm text-gray-600 mb-2">Low-interest loans for businesses affected by disasters</p>
              <a href="https://www.sba.gov/funding-programs/disaster-assistance" target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:text-blue-700 text-sm underline">
                Visit SBA Disaster Assistance →
              </a>
            </div>

            <div>
              <h4 className="font-medium text-gray-800">NC Emergency Management</h4>
              <p className="text-sm text-gray-600 mb-2">State-level disaster assistance and resources</p>
              <a href="https://www.ncdps.gov/emergency-management" target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:text-blue-700 text-sm underline">
                Visit NCEM →
              </a>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation Tips</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800">Immediate Actions:</h4>
              <ul className="mt-1 space-y-1">
                <li>• Take photos before cleaning up</li>
                <li>• Contact insurance within 24-72 hours</li>
                <li>• Secure property from further damage</li>
                <li>• Keep receipts for emergency repairs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">Photo Guidelines:</h4>
              <ul className="mt-1 space-y-1">
                <li>• Take wide shots and close-ups</li>
                <li>• Include reference objects for scale</li>
                <li>• Date stamp if possible</li>
                <li>• Don't clean up before photos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800">Record Keeping:</h4>
              <ul className="mt-1 space-y-1">
                <li>• Maintain communication log</li>
                <li>• Save all correspondence</li>
                <li>• Track expenses and time</li>
                <li>• Keep claim numbers handy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Insurance Claim Documentation Helper</h2>
              <p className="text-blue-100 mt-1">
                {county.name} County • {entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Claims
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'templates', label: 'Claim Templates', desc: 'Pre-built forms' },
              { id: 'form', label: 'Documentation Helper', desc: 'Generate claim package' },
              { id: 'providers', label: 'Insurance Providers', desc: 'Contact information' },
              { id: 'resources', label: 'Resources & Tips', desc: 'Additional help' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400 mt-1">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'templates' && renderTemplateTab()}
          {activeTab === 'form' && renderFormTab()}
          {activeTab === 'providers' && renderProvidersTab()}
          {activeTab === 'resources' && renderResourcesTab()}
        </div>
      </div>
    </div>
  );
}