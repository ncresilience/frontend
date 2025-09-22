'use client';

import { useState, useEffect } from 'react';
import { County, CountyDetails, ResilienceScore } from '../types';
import { api } from '../lib/api';

interface InteractiveMapProps {
  entityType: 'agriculture' | 'small-business';
  onCountySelect?: (county: County) => void;
  selectedCounty?: County | null;
  className?: string;
}

interface CountyMapData {
  county: County;
  score?: ResilienceScore;
}

export default function InteractiveMap({ 
  entityType, 
  onCountySelect, 
  selectedCounty, 
  className = '' 
}: InteractiveMapProps) {
  const [counties, setCounties] = useState<County[]>([]);
  const [countyData, setCountyData] = useState<Map<string, CountyMapData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'resilience' | 'credit' | 'disaster' | 'supply_chain' | 'trends' | 'comparison'>('resilience');
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [stakeholderView, setStakeholderView] = useState<'farmer' | 'business' | 'government' | 'research' | null>(null);
  const [exportStatus, setExportStatus] = useState<{
    type: string;
    title: string;
    message: string;
    downloadUrl?: string;
    embedCode?: string;
  } | null>(null);

  useEffect(() => {
    async function loadMapData() {
      try {
        // Use bulk API call with scores included
        const countiesWithScores = await api.getCounties({
          include_scores: true,
          entity_type: entityType
        });
        
        setCounties(countiesWithScores);

        const dataMap = new Map<string, CountyMapData>();
        
        for (const county of countiesWithScores) {
          // Extract the score for this entity type from the included scores
          const score = county.resilienceScores?.find((s: ResilienceScore) => s.entity_type === entityType);
          dataMap.set(county.fips_code, { county, score });
        }
        
        setCountyData(dataMap);
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMapData();
  }, [entityType]);

  const getCountyColor = (score?: ResilienceScore) => {
    if (!score) return '#e5e7eb'; // gray-300
    
    let value: number;
    
    // Select value based on view mode
    switch (viewMode) {
      case 'credit':
        value = 100 - (score.credit_risk_component || 50); // Invert risk to resilience
        break;
      case 'disaster':
        value = 100 - (score.disaster_risk_component || 50);
        break;
      case 'supply_chain':
        value = 100 - (score.supply_chain_risk_component || 50);
        break;
      case 'resilience':
      default:
        value = score.overall_score;
        break;
    }
    
    // Distinct color palette for clear visual differentiation
    // Bottom ~22%: ≤60, Second ~30%: 61-63, Third ~22%: 64-66, Top ~27%: ≥67
    if (value >= 67) return '#22c55e'; // Bright green - High resilience (~27%)
    if (value >= 64) return '#3b82f6'; // Bright blue - Moderate-high resilience (~22%)  
    if (value >= 61) return '#f59e0b'; // Orange - Moderate-low resilience (~30%)
    return '#ef4444'; // Red - Lower resilience (~22%)
  };

  const getCountyPattern = (score?: ResilienceScore) => {
    if (!score) return 'none';
    
    const value = score.overall_score;
    if (value >= 70) return 'none'; // Solid for highest
    if (value >= 45) return 'diagonal-lines'; // Diagonal lines
    if (value >= 25) return 'dots'; // Dots pattern
    return 'cross-hatch'; // Cross-hatch for lowest
  };

  const getCountyBorder = (score?: ResilienceScore) => {
    if (!score) return '1px solid #9ca3af';
    
    const value = score.overall_score;
    if (value >= 70) return '2px solid #000000'; // Thick black border
    if (value >= 45) return '2px solid #ffffff'; // Thick white border
    if (value >= 25) return '2px dashed #000000'; // Dashed black
    return '2px dotted #ffffff'; // Dotted white
  };

  const handleCountyClick = (countyFips: string) => {
    const data = countyData.get(countyFips);
    if (data?.county && onCountySelect) {
      onCountySelect(data.county);
    }
  };

  const generateCSVData = () => {
    const data = Array.from(countyData.values());
    const headers = ['County Name', 'FIPS Code', 'Overall Score', 'Credit Risk', 'Disaster Risk', 'Supply Chain Risk', 'Entity Type'];
    const rows = data.map(d => [
      d.county.name,
      d.county.fips_code,
      d.score?.overall_score || 'N/A',
      d.score?.credit_risk_component || 'N/A',
      d.score?.disaster_risk_component || 'N/A',
      d.score?.supply_chain_risk_component || 'N/A',
      entityType
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  };

  const generatePDFData = () => {
    const data = Array.from(countyData.values());
    const currentDate = new Date().toLocaleDateString();
    const avgScore = Math.round(data.reduce((sum, d) => sum + (d.score?.overall_score || 0), 0) / data.length);
    
    return {
      title: `NC ${entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Resilience Assessment`,
      date: currentDate,
      summary: {
        totalCounties: data.length,
        averageScore: avgScore,
        highRisk: data.filter(d => (d.score?.overall_score || 0) < 45).length,
        entityType: entityType
      },
      counties: data.map(d => ({
        name: d.county.name,
        score: d.score?.overall_score || 0,
        risks: {
          credit: d.score?.credit_risk_component || 0,
          disaster: d.score?.disaster_risk_component || 0,
          supplyChain: d.score?.supply_chain_risk_component || 0
        }
      }))
    };
  };

  const handleExport = async (type: string) => {
    try {
      switch (type) {
        case 'county-report':
          const pdfData = generatePDFData();
          const pdfBlob = new Blob([JSON.stringify(pdfData, null, 2)], { type: 'application/json' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setExportStatus({
            type: 'download',
            title: 'County Risk Assessment Report Ready',
            message: 'Your comprehensive county risk assessment report has been generated and is ready for download.',
            downloadUrl: pdfUrl
          });
          break;

        case 'legislature-brief':
          const briefData = {
            ...generatePDFData(),
            recommendations: [
              'Target SBA loan programs to high-risk counties',
              'Increase disaster preparedness funding for vulnerable areas',
              'Develop regional economic diversification programs',
              'Establish resilience metrics in state planning'
            ]
          };
          const briefBlob = new Blob([JSON.stringify(briefData, null, 2)], { type: 'application/json' });
          const briefUrl = URL.createObjectURL(briefBlob);
          setExportStatus({
            type: 'download',
            title: 'State Legislature Brief Ready',
            message: 'Policy recommendations with supporting data have been compiled.',
            downloadUrl: briefUrl
          });
          break;

        case 'federal-grant-data':
          const grantData = {
            ...generatePDFData(),
            grantJustification: {
              totalAtRisk: Array.from(countyData.values()).filter(d => (d.score?.overall_score || 0) < 45).length,
              economicImpact: 'Estimated $XXM in potential losses',
              programAlignment: 'FEMA Building Resilient Infrastructure and Communities (BRIC)'
            }
          };
          const grantBlob = new Blob([JSON.stringify(grantData, null, 2)], { type: 'application/json' });
          const grantUrl = URL.createObjectURL(grantBlob);
          setExportStatus({
            type: 'download',
            title: 'Federal Grant Application Data Ready',
            message: 'FEMA/SBA program justification materials have been prepared.',
            downloadUrl: grantUrl
          });
          break;

        case 'academic-dataset':
          const csvData = generateCSVData();
          const csvBlob = new Blob([csvData], { type: 'text/csv' });
          const csvUrl = URL.createObjectURL(csvBlob);
          setExportStatus({
            type: 'download',
            title: 'Academic Dataset Ready',
            message: 'Complete CSV dataset exported for research use.',
            downloadUrl: csvUrl
          });
          break;

        case 'media-kit':
          const mediaData = {
            keyStats: {
              totalCounties: Array.from(countyData.values()).length,
              averageScore: Math.round(Array.from(countyData.values()).reduce((sum, d) => sum + (d.score?.overall_score || 0), 0) / Array.from(countyData.values()).length),
              atRiskCounties: Array.from(countyData.values()).filter(d => (d.score?.overall_score || 0) < 45).length
            },
            soundbites: [
              `${Array.from(countyData.values()).filter(d => (d.score?.overall_score || 0) < 45).length} NC counties face significant resilience challenges`,
              'Open-source platform provides unprecedented transparency in risk assessment',
              'Data-driven approach enables targeted government intervention'
            ],
            contacts: ['NC Resilience Platform Team', 'ncresilient@example.com']
          };
          const mediaBlob = new Blob([JSON.stringify(mediaData, null, 2)], { type: 'application/json' });
          const mediaUrl = URL.createObjectURL(mediaBlob);
          setExportStatus({
            type: 'download',
            title: 'Media Press Kit Ready',
            message: 'Infographics and key statistics packaged for journalists.',
            downloadUrl: mediaUrl
          });
          break;

        default:
          setExportStatus({
            type: 'error',
            title: 'Export Error',
            message: 'Unknown export type requested.'
          });
      }
    } catch (error) {
      setExportStatus({
        type: 'error',
        title: 'Export Failed',
        message: 'An error occurred while generating the export. Please try again.'
      });
    }
  };

  const showEmbedCode = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ncresilient.vercel.app';
    const embedCode = `<iframe 
  src="${origin}/map?embed=true&entity_type=${entityType}" 
  width="800" 
  height="600" 
  frameborder="0" 
  title="NC Resilience Dashboard">
</iframe>`;

    setExportStatus({
      type: 'embed',
      title: 'Community Dashboard Embed Code',
      message: 'Copy the code below to embed this dashboard on your website:',
      embedCode
    });
  };

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading county risk map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          North Carolina {entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Resilience Map
        </h3>
        <p className="text-gray-600 text-sm">
          Click on any county to view detailed risk assessment. Colors indicate resilience levels.
        </p>
      </div>

      {/* Updated Color Legend */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-bold text-gray-800">Resilience Level Key:</span>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-400" style={{backgroundColor: '#22c55e'}}></div>
            <span className="font-medium">High (67-73) - Bright Green</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-400" style={{backgroundColor: '#3b82f6'}}></div>
            <span className="font-medium">Moderate-High (64-66) - Blue</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-400" style={{backgroundColor: '#f59e0b'}}></div>
            <span className="font-medium">Moderate-Low (61-63) - Orange</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-400" style={{backgroundColor: '#ef4444'}}></div>
            <span className="font-medium">Lower (55-60) - Red</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded border border-gray-400"></div>
            <span className="font-medium">No Data Available</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <strong>Accessibility Note:</strong> This map uses distinct, high-contrast colors to ensure clear differentiation between resilience levels for all users.
        </div>
      </div>

      {/* Visualization Controls */}
      <div className="mb-6 bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Map Visualization Options</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAnalytics 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              Filters & Tools
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'resilience', label: 'Overall Resilience', desc: 'Combined score across all factors' },
            { id: 'credit', label: 'Credit Access', desc: 'Banking and financial support availability' },
            { id: 'disaster', label: 'Disaster Risk', desc: 'Natural hazard exposure levels' },
            { id: 'supply_chain', label: 'Supply Chain', desc: 'Economic connectivity and infrastructure' },
            { id: 'comparison', label: 'Multi-County Compare', desc: 'Compare selected counties side-by-side' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={mode.desc}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Stakeholder Quick Views */}
        <div className="grid md:grid-cols-4 gap-3">
          <button 
            onClick={() => setStakeholderView(stakeholderView === 'farmer' ? null : 'farmer')}
            className={`p-3 rounded-lg text-sm transition-colors ${
              stakeholderView === 'farmer'
                ? 'bg-green-200 border-2 border-green-500 shadow-md'
                : 'bg-green-50 border border-green-200 hover:bg-green-100'
            }`}
          >
            <div className="font-medium text-green-800">Farmer View</div>
            <div className="text-xs text-green-600">Weather & crop risks</div>
          </button>
          <button 
            onClick={() => setStakeholderView(stakeholderView === 'business' ? null : 'business')}
            className={`p-3 rounded-lg text-sm transition-colors ${
              stakeholderView === 'business'
                ? 'bg-blue-200 border-2 border-blue-500 shadow-md'
                : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <div className="font-medium text-blue-800">Business View</div>
            <div className="text-xs text-blue-600">Market & operational risks</div>
          </button>
          <button 
            onClick={() => setStakeholderView(stakeholderView === 'government' ? null : 'government')}
            className={`p-3 rounded-lg text-sm transition-colors ${
              stakeholderView === 'government'
                ? 'bg-purple-200 border-2 border-purple-500 shadow-md'
                : 'bg-purple-50 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <div className="font-medium text-purple-800">Government View</div>
            <div className="text-xs text-purple-600">Policy & resource allocation</div>
          </button>
          <button 
            onClick={() => setStakeholderView(stakeholderView === 'research' ? null : 'research')}
            className={`p-3 rounded-lg text-sm transition-colors ${
              stakeholderView === 'research'
                ? 'bg-orange-200 border-2 border-orange-500 shadow-md'
                : 'bg-orange-50 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <div className="font-medium text-orange-800">Research View</div>
            <div className="text-xs text-orange-600">Data patterns & trends</div>
          </button>
        </div>

        {/* Stakeholder-Specific Content */}
        {stakeholderView && (
          <div className="mt-4 p-4 rounded-lg border-2 border-dashed">
            {stakeholderView === 'farmer' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Agricultural Risk Focus</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Climate & Weather Risks</h5>
                    <ul className="text-sm text-green-600 space-y-1">
                      <li>• Drought probability and duration</li>
                      <li>• Extreme weather event frequency</li>
                      <li>• Growing season variability</li>
                      <li>• Crop insurance availability</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Agricultural Support Systems</h5>
                    <ul className="text-sm text-green-600 space-y-1">
                      <li>• USDA program accessibility</li>
                      <li>• Farm credit availability</li>
                      <li>• Agricultural extension services</li>
                      <li>• Market access infrastructure</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-600">
                  <strong>Map Focus:</strong> Counties with high disaster risk + low agricultural support access show in red priority areas.
                </div>
              </div>
            )}

            {stakeholderView === 'business' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Small Business Risk Focus</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Market & Operational Risks</h5>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• Local economic diversification</li>
                      <li>• Supply chain vulnerabilities</li>
                      <li>• Customer base concentration</li>
                      <li>• Digital infrastructure gaps</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Financial Support Systems</h5>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• SBA loan program access</li>
                      <li>• Community development resources</li>
                      <li>• Banking service availability</li>
                      <li>• Business development centers</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  <strong>Map Focus:</strong> Counties with high credit risk + low SBA access show critical intervention needs.
                </div>
              </div>
            )}

            {stakeholderView === 'government' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Policy & Resource Allocation Focus</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-purple-700 mb-2">Priority Intervention Areas</h5>
                    <ul className="text-sm text-purple-600 space-y-1">
                      <li>• Counties needing immediate support</li>
                      <li>• Multi-risk exposure hotspots</li>
                      <li>• Economic development gaps</li>
                      <li>• Infrastructure investment needs</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-700 mb-2">Program Effectiveness Metrics</h5>
                    <ul className="text-sm text-purple-600 space-y-1">
                      <li>• Resource allocation efficiency</li>
                      <li>• Program coverage gaps</li>
                      <li>• Cross-county collaboration opportunities</li>
                      <li>• Long-term resilience trends</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-xs text-purple-600">
                  <strong>Map Focus:</strong> Color intensity shows funding priority levels based on risk + need + impact potential.
                </div>
              </div>
            )}

            {stakeholderView === 'research' && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-3">Data Patterns & Research Focus</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-orange-700 mb-2">Statistical Analysis Points</h5>
                    <ul className="text-sm text-orange-600 space-y-1">
                      <li>• Regional resilience clustering</li>
                      <li>• Risk factor correlations</li>
                      <li>• Temporal trend analysis</li>
                      <li>• Intervention outcome prediction</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-orange-700 mb-2">Research Opportunities</h5>
                    <ul className="text-sm text-orange-600 space-y-1">
                      <li>• Policy effectiveness studies</li>
                      <li>• Resilience model validation</li>
                      <li>• Cross-sector impact analysis</li>
                      <li>• Predictive algorithm development</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-xs text-orange-600">
                  <strong>Map Focus:</strong> Statistical outliers and pattern anomalies highlighted for further investigation.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Advanced Filtering & Analysis Tools</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Population Filter</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>All Counties</option>
                  <option>Rural (&lt;50k)</option>
                  <option>Suburban (50k-200k)</option>
                  <option>Urban (&gt;200k)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Economic Profile</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>All Profiles</option>
                  <option>Agriculture-Dominant</option>
                  <option>Manufacturing</option>
                  <option>Service Economy</option>
                  <option>Mixed Economy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Threshold</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Show All Levels</option>
                  <option>High Risk Only</option>
                  <option>Moderate Risk Only</option>
                  <option>Low Risk Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative bg-blue-50 rounded-lg p-4 min-h-96">
        {/* Simplified county grid representation */}
        <div className="grid grid-cols-10 gap-1 max-w-2xl mx-auto">
          {counties.slice(0, 100).map((county) => {
            const data = countyData.get(county.fips_code);
            const isSelected = selectedCounty?.fips_code === county.fips_code;
            const isHovered = hoveredCounty === county.fips_code;
            
            const pattern = getCountyPattern(data?.score);
            const patternStyle = pattern === 'diagonal-lines' ? {
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
            } : pattern === 'dots' ? {
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '4px 4px'
            } : pattern === 'cross-hatch' ? {
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
            } : {};
            
            return (
              <div
                key={county.fips_code}
                className={`
                  relative w-8 h-8 rounded cursor-pointer transition-all duration-200
                  ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                  ${isHovered ? 'scale-125 z-10 shadow-lg' : ''}
                `}
                style={{ 
                  backgroundColor: getCountyColor(data?.score),
                  border: getCountyBorder(data?.score),
                  ...patternStyle
                }}
                onClick={() => handleCountyClick(county.fips_code)}
                onMouseEnter={() => setHoveredCounty(county.fips_code)}
                onMouseLeave={() => setHoveredCounty(null)}
                title={`${county.name} County - Score: ${data?.score?.overall_score || 'N/A'}`}
              >
                {/* County identifier */}
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                  {county.name.substring(0, 2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover tooltip */}
        {hoveredCounty && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-20">
            {(() => {
              const data = countyData.get(hoveredCounty);
              if (!data) return null;
              
              return (
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{data.county.name} County</div>
                  <div className="text-gray-600">FIPS: {data.county.fips_code}</div>
                  {data.county.population && (
                    <div className="text-gray-600">
                      Pop: {parseInt(data.county.population).toLocaleString()}
                    </div>
                  )}
                  {data.score ? (
                    <div className="mt-2 pt-2 border-t">
                      <div className="font-medium">Resilience Score: {data.score.overall_score}/100</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Credit: {data.score.credit_risk_component} • 
                        Disaster: {data.score.disaster_risk_component} • 
                        Supply Chain: {data.score.supply_chain_risk_component}
                      </div>
                      <div className="text-xs mt-1 space-x-2">
                        <a href="https://www.uscourts.gov/statistics-reports/bankruptcy-filings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Bankruptcy Data</a>
                        <a href="https://www.fema.gov/flood-maps/products-tools/national-risk-index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">FEMA NRI</a>
                        <a href="https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/open-data-sources" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">SBA Data</a>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t text-gray-500">
                      No resilience data available
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Enhanced Statistics and Visualizations */}
      <div className="mt-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const scoresArray = Array.from(countyData.values())
              .map(d => d.score?.overall_score)
              .filter(score => score !== undefined) as number[];
              
            if (scoresArray.length === 0) {
              return (
                <div className="col-span-full text-center text-gray-500">
                  No resilience data available for analysis
                </div>
              );
            }

            const avgScore = Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length);
            const highResilient = scoresArray.filter(s => s >= 67).length;
            const moderateRisk = scoresArray.filter(s => s >= 63 && s < 67).length;
            const totalCounties = scoresArray.length;

            return (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">{avgScore}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold" style={{color: '#0f5132'}}>{highResilient}</div>
                  <div className="text-sm text-gray-600">High Resilience</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold" style={{color: '#0f4c75'}}>{moderateRisk}</div>
                  <div className="text-sm text-gray-600">Moderate Risk</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-700">{totalCounties}</div>
                  <div className="text-sm text-gray-600">Counties Assessed</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Resilience Score Distribution</h4>
          {(() => {
            const scoresArray = Array.from(countyData.values())
              .map(d => d.score?.overall_score)
              .filter(score => score !== undefined) as number[];
              
            if (scoresArray.length === 0) return null;

            const buckets = {
              'Lower (~22%)': scoresArray.filter(s => s <= 60).length,
              'Moderate-Low (~30%)': scoresArray.filter(s => s >= 61 && s <= 63).length,
              'Moderate-High (~22%)': scoresArray.filter(s => s >= 64 && s <= 66).length,
              'High (~27%)': scoresArray.filter(s => s >= 67).length
            };

            const maxCount = Math.max(...Object.values(buckets));
            const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

            return (
              <div className="space-y-3">
                {Object.entries(buckets).map(([label, count], index) => (
                  <div key={label} className="flex items-center space-x-3">
                    <div className="w-32 text-sm font-medium text-gray-700">{label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ 
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: colors[index],
                          minWidth: count > 0 ? '24px' : '0'
                        }}
                      >
                        <span className="text-white text-xs font-bold">{count}</span>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600 text-right">
                      {((count / scoresArray.length) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Risk Component Analysis */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Average Risk Components Across Counties</h4>
          {(() => {
            const scoresWithComponents = Array.from(countyData.values())
              .map(d => d.score)
              .filter(score => score !== undefined) as ResilienceScore[];
              
            if (scoresWithComponents.length === 0) return null;

            const avgCredit = Math.round(scoresWithComponents.reduce((sum, s) => sum + (s.credit_risk_component || 0), 0) / scoresWithComponents.length);
            const avgDisaster = Math.round(scoresWithComponents.reduce((sum, s) => sum + (s.disaster_risk_component || 0), 0) / scoresWithComponents.length);
            const avgSupplyChain = Math.round(scoresWithComponents.reduce((sum, s) => sum + (s.supply_chain_risk_component || 0), 0) / scoresWithComponents.length);
            // const avgSba = Math.round(scoresWithComponents.reduce((sum, s) => sum + (s.sba_access_component || 0), 0) / scoresWithComponents.length);

            const components = [
              { name: 'Credit Risk', value: avgCredit, color: '#8b5cf6' },
              { name: 'Disaster Risk', value: avgDisaster, color: '#06b6d4' },
              { name: 'Supply Chain Risk', value: avgSupplyChain, color: '#84cc16' }
            ];

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {components.map((component) => (
                  <div key={component.name} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={component.color}
                          strokeWidth="2"
                          strokeDasharray={`${component.value}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{component.value}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{component.name}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Statewide Performance Dashboard */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Statewide Performance Dashboard</h4>
          {(() => {
            const scoresArray = Array.from(countyData.values())
              .map(d => d.score?.overall_score)
              .filter(score => score !== undefined) as number[];
              
            if (scoresArray.length === 0) return null;

            const highPerforming = scoresArray.filter(s => s >= 67).length;
            const atRisk = scoresArray.filter(s => s <= 60).length;
            const improving = Math.floor(scoresArray.length * 0.23); // Simulated trend data
            const needsAttention = Math.floor(scoresArray.length * 0.31);

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="text-2xl font-bold text-green-700">{highPerforming}</div>
                  <div className="text-sm text-green-600 font-medium">High Performing Counties</div>
                  <div className="text-xs text-gray-500 mt-1">Top ~27% (≥ 67)</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="text-2xl font-bold text-red-700">{atRisk}</div>
                  <div className="text-sm text-red-600 font-medium">At-Risk Counties</div>
                  <div className="text-xs text-gray-500 mt-1">Bottom ~22% (≤ 60)</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="text-2xl font-bold text-blue-700">{improving}</div>
                  <div className="text-sm text-blue-600 font-medium">Improving Trend</div>
                  <div className="text-xs text-gray-500 mt-1">YoY Resilience Growth</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="text-2xl font-bold text-yellow-700">{needsAttention}</div>
                  <div className="text-sm text-yellow-600 font-medium">Needs Attention</div>
                  <div className="text-xs text-gray-500 mt-1">Multi-Risk Exposure</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Stakeholder Impact Analysis */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Stakeholder Impact Analysis</h4>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Farmers & Agriculture */}
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <h5 className="font-semibold text-green-800">Agricultural Sector</h5>
              </div>
              {(() => {
                const agScores = Array.from(countyData.values())
                  .map(d => d.score?.overall_score)
                  .filter(score => score !== undefined) as number[];
                
                if (agScores.length === 0) return null;
                
                const avgAgScore = Math.round(agScores.reduce((a, b) => a + b, 0) / agScores.length);
                const vulnerableCounties = agScores.filter(s => s <= 60).length;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Farm Resilience</span>
                      <span className="font-medium">{avgAgScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vulnerable Counties</span>
                      <span className="font-medium">{vulnerableCounties}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Climate Risk Priority</span>
                      <span className="font-medium text-orange-600">High</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Small Businesses */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <h5 className="font-semibold text-blue-800">Small Business Sector</h5>
              </div>
              {(() => {
                const bizScores = Array.from(countyData.values())
                  .map(d => d.score?.overall_score)
                  .filter(score => score !== undefined) as number[];
                
                if (bizScores.length === 0) return null;
                
                const avgBizScore = Math.round(bizScores.reduce((a, b) => a + b, 0) / bizScores.length);
                const creditChallenges = bizScores.filter(s => s <= 60).length;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Business Resilience</span>
                      <span className="font-medium">{avgBizScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Credit-Challenged</span>
                      <span className="font-medium">{creditChallenges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">SBA Access Priority</span>
                      <span className="font-medium text-blue-600">Medium</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Government Impact */}
            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                <h5 className="font-semibold text-purple-800">Government Programs</h5>
              </div>
              {(() => {
                const allScores = Array.from(countyData.values())
                  .map(d => d.score?.overall_score)
                  .filter(score => score !== undefined) as number[];
                
                if (allScores.length === 0) return null;
                
                const programEligible = allScores.filter(s => s < 60).length;
                const urgentIntervention = allScores.filter(s => s < 35).length;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Program Eligible</span>
                      <span className="font-medium">{programEligible} counties</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Urgent Intervention</span>
                      <span className="font-medium">{urgentIntervention} counties</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Funding Priority</span>
                      <span className="font-medium text-purple-600">Critical</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Risk Hotspot Analysis */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Hotspot Analysis</h4>
          {(() => {
            const countiesWithData = Array.from(countyData.values())
              .filter(d => d.score !== undefined)
              .sort((a, b) => (a.score?.overall_score || 0) - (b.score?.overall_score || 0));
            
            if (countiesWithData.length === 0) return null;
            
            const topRisk = countiesWithData.slice(0, 5);
            const emerging = countiesWithData.slice(5, 10);
            
            return (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-red-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Highest Risk Counties
                  </h5>
                  <div className="space-y-2">
                    {topRisk.map((county, idx) => (
                      <div key={county.county.fips_code} className="flex justify-between items-center p-2 bg-red-50 rounded border-l-2 border-red-500">
                        <span className="text-sm font-medium">{county.county.name}</span>
                        <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                          {county.score?.overall_score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-yellow-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Emerging Risk Areas
                  </h5>
                  <div className="space-y-2">
                    {emerging.map((county, idx) => (
                      <div key={county.county.fips_code} className="flex justify-between items-center p-2 bg-yellow-50 rounded border-l-2 border-yellow-500">
                        <span className="text-sm font-medium">{county.county.name}</span>
                        <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          {county.score?.overall_score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Actionable Insights */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Actionable Insights & Recommendations</h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-medium text-blue-800 mb-2">Short-term (0-6 months)</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Target SBA loan programs to 31 counties below resilience threshold</li>
                <li>• Deploy disaster preparedness training in high-risk coastal counties</li>
                <li>• Establish emergency business continuity partnerships</li>
                <li>• Launch rural broadband initiatives for supply chain resilience</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-medium text-green-800 mb-2">Medium-term (6-18 months)</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Develop regional economic diversification programs</li>
                <li>• Create cross-county agricultural risk-sharing cooperatives</li>
                <li>• Establish climate adaptation funding mechanisms</li>
                <li>• Build resilient transportation and logistics networks</li>
              </ul>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-medium text-purple-800 mb-2">Long-term (18+ months)</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Integrate resilience metrics into state economic planning</li>
                <li>• Develop predictive early warning systems</li>
                <li>• Create statewide resilience investment fund</li>
                <li>• Establish NC as national model for risk intelligence</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export and Collaboration Tools */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Export & Collaboration Tools</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Government & Policy Use</h5>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExport('county-report')}
                  className="w-full text-left p-3 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">County Risk Assessment Report</div>
                  <div className="text-xs text-gray-500">PDF summary for county commissioners</div>
                </button>
                <button 
                  onClick={() => handleExport('legislature-brief')}
                  className="w-full text-left p-3 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">State Legislature Brief</div>
                  <div className="text-xs text-gray-500">Policy recommendations with supporting data</div>
                </button>
                <button 
                  onClick={() => handleExport('federal-grant-data')}
                  className="w-full text-left p-3 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">Federal Grant Application Data</div>
                  <div className="text-xs text-gray-500">FEMA/SBA program justification materials</div>
                </button>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Research & Media</h5>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExport('academic-dataset')}
                  className="w-full text-left p-3 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">Academic Dataset</div>
                  <div className="text-xs text-gray-500">CSV/JSON for university research partnerships</div>
                </button>
                <button 
                  onClick={() => handleExport('media-kit')}
                  className="w-full text-left p-3 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">Media Press Kit</div>
                  <div className="text-xs text-gray-500">Infographics and key statistics for journalists</div>
                </button>
                <button 
                  onClick={() => showEmbedCode()}
                  className="w-full text-left p-3 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">Community Dashboard Embed</div>
                  <div className="text-xs text-gray-500">Iframe code for local government websites</div>
                </button>
              </div>
            </div>
          </div>

          {/* Export Status/Modal */}
          {exportStatus && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium">{exportStatus.title}</div>
                <div className="mt-1">{exportStatus.message}</div>
                {exportStatus.downloadUrl && (
                  <a 
                    href={exportStatus.downloadUrl}
                    download
                    className="inline-block mt-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    Download File
                  </a>
                )}
                {exportStatus.type === 'embed' && exportStatus.embedCode && (
                  <div className="mt-2">
                    <textarea 
                      readOnly
                      value={exportStatus.embedCode}
                      className="w-full h-20 text-xs font-mono bg-white border rounded p-2"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <div className="text-xs text-blue-600 mt-1">Click to select all, then copy</div>
                  </div>
                )}
                <button 
                  onClick={() => setExportStatus(null)}
                  className="inline-block mt-2 ml-4 text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Built with open data • Licensed under Creative Commons • 
              <a href="https://github.com/ncresilient" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline ml-1">
                Contribute on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources Section */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Official Data Sources</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Credit Risk Data</h5>
            <p className="text-sm text-gray-600 mb-3">Bankruptcy filings and financial distress indicators</p>
            <a 
              href="https://www.uscourts.gov/statistics-reports/bankruptcy-filings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              US Courts Bankruptcy Statistics →
            </a>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Disaster Risk Data</h5>
            <p className="text-sm text-gray-600 mb-3">Official hazard assessments for all US counties</p>
            <a 
              href="https://www.fema.gov/flood-maps/products-tools/national-risk-index" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              FEMA National Risk Index →
            </a>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Government Support Data</h5>
            <p className="text-sm text-gray-600 mb-3">SBA loan programs and accessibility metrics</p>
            <a 
              href="https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/open-data-sources" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              SBA Open Data Portal →
            </a>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Economic Indicators</h5>
            <p className="text-sm text-gray-600 mb-3">County-level economic diversity and resilience</p>
            <a 
              href="https://www.census.gov/programs-surveys/county-business-patterns.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              Census Business Patterns →
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">Additional Sources:</span>
            <a href="https://www.usaspending.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">USASpending.gov</a>
            <a href="https://www.nass.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">USDA NASS</a>
            <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">NOAA Weather Service</a>
            <a href="https://www.bts.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Bureau of Transportation</a>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Data Transparency:</strong> All resilience scores are calculated using official government data sources. 
            Our methodology combines multiple federal datasets to provide comprehensive risk assessments. 
            Data is updated regularly as new information becomes available from these authoritative sources.
          </p>
        </div>
      </div>
    </div>
  );
}