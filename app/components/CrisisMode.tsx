'use client';

import { useState, useEffect } from 'react';
import { County } from '../types';
import InsuranceClaimHelper from './InsuranceClaimHelper';
import DamageAssessmentForm from './DamageAssessmentForm';

interface EmergencyAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory' | 'emergency';
  title: string;
  description: string;
  issued: string;
  expires: string;
  source: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future';
  areas: string[];
}

interface EmergencyResource {
  id: string;
  name: string;
  type: 'shelter' | 'medical' | 'supply' | 'communication' | 'transportation';
  address: string;
  phone: string;
  hours: string;
  capacity?: string;
  services: string[];
  distance?: number;
}

interface CrisisModeProps {
  county: County;
  entityType?: 'agriculture' | 'small-business';
  onExitCrisisMode: () => void;
}

export default function CrisisMode({ county, entityType, onExitCrisisMode }: CrisisModeProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'resources' | 'contacts' | 'checklist' | 'insurance' | 'assessment'>('alerts');
  const [showInsuranceHelper, setShowInsuranceHelper] = useState(false);
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);

  useEffect(() => {
    loadEmergencyData();
    // Set up polling for real-time updates
    const interval = setInterval(loadEmergencyData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [county]);

  const loadEmergencyData = async () => {
    setLoading(true);
    
    // Simulated emergency data - in real implementation this would come from emergency APIs
    const mockAlerts: EmergencyAlert[] = [
      {
        id: 'nws-001',
        type: 'warning',
        title: 'Hurricane Warning',
        description: 'Hurricane-force winds expected within 36 hours. Take immediate action to protect life and property.',
        issued: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        source: 'National Weather Service',
        severity: 'extreme',
        urgency: 'immediate',
        areas: [county.name]
      },
      {
        id: 'ema-002',
        type: 'emergency',
        title: 'Evacuation Order - Zone A',
        description: 'Mandatory evacuation for coastal areas and mobile homes. Evacuate immediately.',
        issued: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        source: `${county.name} Emergency Management`,
        severity: 'extreme',
        urgency: 'immediate',
        areas: ['Coastal Zone A', 'Mobile Home Parks']
      }
    ];

    const mockResources: EmergencyResource[] = [
      {
        id: 'shelter-001',
        name: `${county.name} High School Emergency Shelter`,
        type: 'shelter',
        address: '123 School Street, Main City',
        phone: '(919) 555-0100',
        hours: '24/7 during emergency',
        capacity: '500 people',
        services: ['Pet-friendly', 'Medical support', 'Food service', 'Wi-Fi'],
        distance: 2.5
      },
      {
        id: 'medical-001',
        name: `${county.name} Regional Medical Center`,
        type: 'medical',
        address: '456 Hospital Drive, Main City',
        phone: '(919) 555-0200',
        hours: '24/7 Emergency Services',
        services: ['Emergency care', 'Trauma center', 'Dialysis', 'Mental health'],
        distance: 3.2
      },
      {
        id: 'supply-001',
        name: 'Red Cross Distribution Center',
        type: 'supply',
        address: '789 Relief Avenue, Main City',
        phone: '(919) 555-0300',
        hours: '8 AM - 8 PM',
        services: ['Water', 'Food', 'Hygiene supplies', 'First aid'],
        distance: 1.8
      }
    ];

    setAlerts(mockAlerts);
    setResources(mockResources);
    setLoading(false);
  };

  const getAlertColor = (alert: EmergencyAlert) => {
    switch (alert.severity) {
      case 'extreme': return 'bg-red-100 border-red-500 text-red-900';
      case 'severe': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'moderate': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default: return 'bg-blue-100 border-blue-500 text-blue-900';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '!';
      case 'watch': return 'W';
      case 'advisory': return 'i';
      case 'emergency': return 'E';
      default: return 'A';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'shelter': return 'S';
      case 'medical': return 'M';
      case 'supply': return 'P';
      case 'communication': return 'C';
      case 'transportation': return 'T';
      default: return 'R';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'alerts':
        return (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">There are currently no emergency alerts for {county.name} County.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <div className="text-sm opacity-75">
                          {alert.source} • {formatTimeAgo(alert.issued)}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-bold uppercase">
                      {alert.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-3 leading-relaxed">{alert.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div>Areas: {alert.areas.join(', ')}</div>
                    <div>Expires: {new Date(alert.expires).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.name}</h3>
                      <div className="text-sm text-gray-600">{resource.address}</div>
                    </div>
                  </div>
                  {resource.distance && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">{resource.distance} mi</div>
                      <div className="text-xs text-gray-500">away</div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">Contact</div>
                    <div className="text-sm text-gray-600">{resource.phone}</div>
                    <div className="text-sm text-gray-600">{resource.hours}</div>
                  </div>
                  
                  {resource.capacity && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Capacity</div>
                      <div className="text-sm text-gray-600">{resource.capacity}</div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">Services Available</div>
                  <div className="flex flex-wrap gap-2">
                    {resource.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="btn-primary text-sm">
                    Get Directions
                  </button>
                  <button className="btn-secondary text-sm">
                    Call Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card bg-red-50 border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-4">Emergency Services</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Emergency (All)</span>
                    <a href="tel:911" className="text-red-600 font-bold">911</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Poison Control</span>
                    <a href="tel:1-800-222-1222" className="text-red-600">1-800-222-1222</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Crisis Helpline</span>
                    <a href="tel:988" className="text-red-600">988</a>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">County Emergency</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Emergency Management</span>
                    <a href="tel:919-555-0100" className="text-blue-600">(919) 555-0100</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Non-Emergency</span>
                    <a href="tel:919-555-0101" className="text-blue-600">(919) 555-0101</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Public Information</span>
                    <a href="tel:919-555-0102" className="text-blue-600">(919) 555-0102</a>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Utilities</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Power Outages</span>
                    <a href="tel:1-800-POWROUT" className="text-blue-600">1-800-POWROUT</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Gas Emergency</span>
                    <a href="tel:1-800-GASEMERG" className="text-blue-600">1-800-GASEMERG</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Water/Sewer</span>
                    <a href="tel:919-555-0200" className="text-blue-600">(919) 555-0200</a>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Assistance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Red Cross</span>
                    <a href="tel:1-800-RED-CROSS" className="text-blue-600">1-800-RED-CROSS</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Salvation Army</span>
                    <a href="tel:919-555-0300" className="text-blue-600">(919) 555-0300</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">FEMA Helpline</span>
                    <a href="tel:1-800-621-3362" className="text-blue-600">1-800-621-3362</a>
                  </div>
                </div>
              </div>
            </div>

            {entityType && (
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">
                  {entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Emergency Support
                </h3>
                <div className="space-y-3">
                  {entityType === 'agriculture' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">USDA Emergency Support</span>
                        <a href="tel:1-800-439-5991" className="text-blue-600">1-800-439-5991</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Extension Emergency Line</span>
                        <a href="tel:919-555-0400" className="text-blue-600">(919) 555-0400</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Farm Bureau Emergency</span>
                        <a href="tel:919-555-0401" className="text-blue-600">(919) 555-0401</a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">SBA Disaster Assistance</span>
                        <a href="tel:1-800-659-2955" className="text-blue-600">1-800-659-2955</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">SCORE Emergency Help</span>
                        <a href="tel:1-800-634-0245" className="text-blue-600">1-800-634-0245</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Small Business Emergency</span>
                        <a href="tel:919-555-0500" className="text-blue-600">(919) 555-0500</a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-6">
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">Immediate Actions</h3>
              <div className="space-y-3">
                {[
                  'Monitor emergency alerts and weather updates',
                  'Secure outdoor equipment and loose objects',
                  'Charge all electronic devices and backup batteries',
                  'Fill bathtubs and containers with water',
                  'Review evacuation routes and meet-up locations',
                  'Gather important documents in waterproof container',
                  'Check emergency supply kit (food, water, medications)',
                  'Contact family members and employees about plans'
                ].map((action, idx) => (
                  <label key={idx} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-yellow-800">{action}</span>
                  </label>
                ))}
              </div>
            </div>

            {entityType === 'agriculture' && (
              <div className="card bg-green-50 border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4">Agricultural Emergency Steps</h3>
                <div className="space-y-3">
                  {[
                    'Move livestock to higher ground or secure shelter',
                    'Secure farm equipment and vehicles',
                    'Harvest crops if possible before storm impact',
                    'Document current livestock and equipment for insurance',
                    'Ensure backup power for critical systems (ventilation, milking)',
                    'Store extra feed and water for animals',
                    'Review crop insurance policies and contacts',
                    'Coordinate with neighbors for mutual assistance'
                  ].map((action, idx) => (
                    <label key={idx} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-green-800">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {entityType === 'small-business' && (
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Business Emergency Steps</h3>
                <div className="space-y-3">
                  {[
                    'Backup all critical business data and files',
                    'Secure or move valuable inventory to safe location',
                    'Document current inventory and equipment for insurance',
                    'Update employee contact information and emergency plans',
                    'Coordinate with suppliers about potential disruptions',
                    'Prepare customer communication about closure/delays',
                    'Review business insurance policies and contacts',
                    'Establish remote work capabilities if possible'
                  ].map((action, idx) => (
                    <label key={idx} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-blue-800">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'insurance':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Insurance Claims & Documentation</h3>
              <p className="text-blue-800 mb-4">
                Get help with filing insurance claims and gathering documentation for your {entityType === 'agriculture' ? 'farm' : 'business'} damages.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-900 mb-2">Claim Templates</h4>
                  <p className="text-sm text-gray-600 mb-3">Pre-built forms for common damage types</p>
                  <button 
                    onClick={() => setShowInsuranceHelper(true)}
                    className="btn-primary text-sm w-full"
                  >
                    Open Insurance Helper
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Documentation</h4>
                  <p className="text-sm text-gray-600 mb-3">Essential steps to document damage</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Take photos immediately</div>
                    <div>• Keep all receipts</div>
                    <div>• Contact insurer within 24-72 hours</div>
                    <div>• Don't dispose of damaged items</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-lg font-bold text-red-900 mb-4">Official Damage Assessment</h3>
              <p className="text-red-800 mb-4">
                Complete a FEMA-compliant damage assessment form to help with disaster declarations and assistance programs.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-900 mb-2">Assessment Form</h4>
                  <p className="text-sm text-gray-600 mb-3">Official preliminary damage assessment</p>
                  <button 
                    onClick={() => setShowDamageAssessment(true)}
                    className="btn-primary bg-red-600 hover:bg-red-700 text-sm w-full"
                  >
                    Start Damage Assessment
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-900 mb-2">Why Complete This?</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Required for FEMA assistance</div>
                    <div>• Helps with disaster declarations</div>
                    <div>• Documents losses for government aid</div>
                    <div>• Professional report generation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-red-900 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto">
        {/* Crisis Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-800 text-white rounded-full flex items-center justify-center text-xl font-bold animate-pulse">
                !
              </div>
              <div>
                <h1 className="text-3xl font-bold">CRISIS RESPONSE MODE</h1>
                <p className="text-red-100 text-lg">
                  Emergency information for {county.name} County
                </p>
              </div>
            </div>
            <button
              onClick={onExitCrisisMode}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Exit Crisis Mode
            </button>
          </div>
          
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates Active</span>
            </div>
            <div>Last Updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'alerts', label: 'Emergency Alerts' },
                { id: 'resources', label: 'Emergency Resources' },
                { id: 'contacts', label: 'Emergency Contacts' },
                { id: 'checklist', label: 'Action Checklist' },
                { id: 'insurance', label: 'Insurance Claims' },
                { id: 'assessment', label: 'Damage Assessment' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading emergency information...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Remember:</strong> If you are in immediate danger, call 911 immediately.
            </p>
            <p>
              This crisis mode provides general emergency information. Always follow official guidance from local emergency management.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      {showInsuranceHelper && (
        <InsuranceClaimHelper
          county={county}
          entityType={entityType || 'agriculture'}
          onClose={() => setShowInsuranceHelper(false)}
        />
      )}

      {showDamageAssessment && (
        <DamageAssessmentForm
          county={county}
          entityType={entityType || 'agriculture'}
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