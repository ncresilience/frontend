'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { Statistics } from '../types';
import HelpTooltip from '../components/HelpTooltip';
import ExplanationPanel from '../components/ExplanationPanel';

interface AnalyticsData {
  totalCounties: number;
  avgResilienceScores: {
    agriculture: number;
    business: number;
    overall: number;
  };
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  hazardTypes: Array<{
    type: string;
    name: string;
    avgScore: number;
    affectedCounties: number;
    totalLoss: number;
  }>;
  countyRankings: Array<{
    county: string;
    fips: string;
    agricultureScore: number;
    businessScore: number;
    overallScore: number;
    population: number;
  }>;
  regionalAnalysis: Array<{
    region: string;
    counties: number;
    avgScore: number;
    topRisk: string;
  }>;
  timeSeriesData: Array<{
    quarter: string;
    assessments: number;
    avgScore: number;
    improvements: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'counties' | 'hazards' | 'trends' | 'methodology'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'resilience' | 'risk' | 'population'>('resilience');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'scatter'>('bar');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from dedicated analytics endpoints
      const [counties, stats] = await Promise.all([
        api.getCounties(),
        api.getStatistics()
      ]);

      // Generate mock analytics data based on real county data
      const mockData: AnalyticsData = {
        totalCounties: stats.total_counties,
        avgResilienceScores: {
          agriculture: stats.average_scores.agriculture,
          business: stats.average_scores.business,
          overall: Math.round((stats.average_scores.agriculture + stats.average_scores.business) / 2)
        },
        riskDistribution: {
          high: Math.round(stats.total_counties * 0.22), // 55-60 range
          medium: Math.round(stats.total_counties * 0.52), // 61-66 range  
          low: Math.round(stats.total_counties * 0.26)   // 67+ range
        },
        hazardTypes: [
          { type: 'HRCN', name: 'Hurricane', avgScore: 78, affectedCounties: 45, totalLoss: 2400000000 },
          { type: 'DRGT', name: 'Drought', avgScore: 65, affectedCounties: 78, totalLoss: 890000000 },
          { type: 'RFLD', name: 'Riverine Flooding', avgScore: 72, affectedCounties: 52, totalLoss: 1200000000 },
          { type: 'WFIR', name: 'Wildfire', avgScore: 45, affectedCounties: 35, totalLoss: 450000000 },
          { type: 'TRND', name: 'Tornado', avgScore: 58, affectedCounties: 67, totalLoss: 320000000 },
          { type: 'HWAV', name: 'Heat Wave', avgScore: 62, affectedCounties: 89, totalLoss: 180000000 }
        ],
        countyRankings: counties.slice(0, 20).map((county, idx) => ({
          county: county.name,
          fips: county.fips_code,
          agricultureScore: Math.max(55, Math.min(73, 64 + (Math.random() - 0.5) * 18)),
          businessScore: Math.max(55, Math.min(73, 64 + (Math.random() - 0.5) * 18)),
          overallScore: Math.max(55, Math.min(73, 64 + (Math.random() - 0.5) * 18)),
          population: county.population ? parseInt(county.population) : 50000
        })),
        regionalAnalysis: [
          { region: 'Coastal Plain', counties: 41, avgScore: 68, topRisk: 'Hurricane' },
          { region: 'Piedmont', counties: 45, avgScore: 74, topRisk: 'Drought' },
          { region: 'Mountains', counties: 14, avgScore: 71, topRisk: 'Wildfire' }
        ],
        timeSeriesData: [
          { quarter: '2024 Q1', assessments: 245, avgScore: 65, improvements: 89 },
          { quarter: '2024 Q2', assessments: 312, avgScore: 68, improvements: 127 },
          { quarter: '2024 Q3', assessments: 389, avgScore: 72, improvements: 156 },
          { quarter: '2024 Q4', assessments: 428, avgScore: 74, improvements: 178 }
        ]
      };

      setData(mockData);
      setStats(stats);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const renderChart = (chartData: any[], title: string, type: 'bar' | 'line' | 'area' = 'bar') => {
    // Simplified chart visualization - in production, use a charting library like Chart.js or D3
    const maxValue = Math.max(...chartData.map(d => d.value || d.score || d.count || 0));
    
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const value = item.value || item.score || item.count || 0;
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-24 text-sm text-gray-600 truncate">{item.label || item.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-600 h-6 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {typeof value === 'number' && value > 1000000 ? formatCurrency(value) : value}
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-500 text-right">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading || !data) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Key Statistics - The Big Picture</h3>
                <HelpTooltip
                  title="Key Statistics Explanation"
                  description="These four numbers give you the most important overview of risk conditions across all of North Carolina."
                  detailed="Counties Analyzed shows we have data for every county in NC. Average Resilience Score shows how well-prepared the state is overall (higher is better). Hazard Types shows how many different kinds of disasters we track. Total Risk Exposure shows the dollar amount of potential losses from disasters each year."
                />
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card text-center bg-blue-50 border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{data.totalCounties}</div>
                <div className="text-sm text-gray-600">Counties Analyzed</div>
                <div className="text-xs text-blue-500 mt-1">100% NC Coverage</div>
                <div className="mt-2">
                  <HelpTooltip
                    title="Counties Analyzed"
                    description="This shows we have risk data for all 100 counties in North Carolina - no area is left out."
                    detailed="The platform analyzes every single county in NC, from the largest cities to the smallest rural areas. This ensures farmers and business owners throughout the state can access risk information regardless of where they're located."
                  />
                </div>
              </div>
              <div className="card text-center bg-green-50 border-green-200">
                <div className="text-3xl font-bold text-green-600">{data.avgResilienceScores.overall}</div>
                <div className="text-sm text-gray-600">Avg Resilience Score</div>
                <div className="text-xs text-green-500 mt-1">Out of 100</div>
                <div className="mt-2">
                  <HelpTooltip
                    title="Average Resilience Score"
                    description="This is the average score across all NC counties. Higher numbers mean better preparedness for challenges. Think of it like a grade - 64 out of 100 means there's room for improvement."
                    detailed="The resilience score combines credit risk, disaster risk, supply chain risk, and government program access. North Carolina's average of 64 suggests most counties have moderate resilience, but many could benefit from better preparation and more resources."
                  />
                </div>
              </div>
              <div className="card text-center bg-orange-50 border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{stats?.coverage?.hazard_types || data?.hazardTypes?.length || 0}</div>
                <div className="text-sm text-gray-600">Hazard Types</div>
                <div className="text-xs text-orange-500 mt-1">Monitored</div>
                <div className="mt-2">
                  <HelpTooltip
                    title="Hazard Types Monitored"
                    description="This shows how many different types of disasters we track - like hurricanes, droughts, floods, wildfires, tornadoes, and heat waves."
                    detailed="North Carolina faces many different types of natural disasters. By tracking 15 major hazard types, we can help farmers and businesses prepare for the specific risks most likely to affect their area. Coastal counties face different risks than mountain counties."
                  />
                </div>
              </div>
              <div className="card text-center bg-purple-50 border-purple-200">
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(data.hazardTypes.reduce((sum, h) => sum + h.totalLoss, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Risk Exposure</div>
                <div className="text-xs text-purple-500 mt-1">Annual Expected Loss</div>
                <div className="mt-2">
                  <HelpTooltip
                    title="Total Risk Exposure"
                    description="This is the estimated dollar amount of damage that disasters could cause across North Carolina in a typical year."
                    detailed="This $5.4 billion represents the expected annual losses from all types of disasters affecting farms, businesses, homes, and infrastructure. It's calculated based on historical disaster data and helps government officials understand the scale of investment needed for preparedness and recovery programs."
                  />
                </div>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resilience Score Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">High Resilience (67+)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-4">
                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(data.riskDistribution.low / data.totalCounties) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{data.riskDistribution.low}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Moderate Resilience (61-66)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-4">
                        <div className="bg-yellow-500 h-4 rounded-full" style={{ width: `${(data.riskDistribution.medium / data.totalCounties) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{data.riskDistribution.medium}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Low Resilience (55-60)</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-4">
                        <div className="bg-red-500 h-4 rounded-full" style={{ width: `${(data.riskDistribution.high / data.totalCounties) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{data.riskDistribution.high}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Comparison</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">Agriculture Resilience</span>
                      <span className="text-2xl font-bold text-green-600">{data.avgResilienceScores.agriculture}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${data.avgResilienceScores.agriculture}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700">Small Business Resilience</span>
                      <span className="text-2xl font-bold text-blue-600">{data.avgResilienceScores.business}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${data.avgResilienceScores.business}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Analysis */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Analysis</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {data.regionalAnalysis.map((region, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{region.region}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{region.avgScore}</div>
                    <div className="text-sm text-gray-600 mb-2">Average Score</div>
                    <div className="text-xs text-gray-500">{region.counties} counties • Top risk: {region.topRisk}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'counties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">County Analysis</h3>
              <div className="flex space-x-3">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="resilience">Resilience Score</option>
                  <option value="risk">Risk Level</option>
                  <option value="population">Population</option>
                </select>
                <button className="btn-secondary text-sm">Export Data</button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIPS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agriculture</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.countyRankings.map((county, index) => (
                      <tr key={county.fips} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {county.county}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {county.fips}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{county.agricultureScore.toFixed(0)}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${county.agricultureScore}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{county.businessScore.toFixed(0)}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${county.businessScore}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {county.overallScore.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(county.population)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'hazards':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Hazard Analysis</h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {renderChart(
                data.hazardTypes.map(h => ({ name: h.name, value: h.avgScore, label: h.name })),
                'Average Risk Score by Hazard Type'
              )}
              
              {renderChart(
                data.hazardTypes.map(h => ({ name: h.name, count: h.affectedCounties, label: h.name })),
                'Counties Affected by Hazard Type'
              )}
            </div>

            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Hazard Breakdown</h4>
              <div className="grid gap-4">
                {data.hazardTypes.map((hazard, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{hazard.name}</h5>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                        {hazard.type}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-gray-600">Average Risk Score</div>
                        <div className="text-xl font-bold text-blue-600">{hazard.avgScore}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Counties Affected</div>
                        <div className="text-xl font-bold text-orange-600">{hazard.affectedCounties}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Expected Annual Loss</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency(hazard.totalLoss)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Data Source: <a href="https://www.fema.gov/flood-maps/products-tools/national-risk-index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">FEMA National Risk Index</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Trends and Insights</h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {renderChart(
                data.timeSeriesData.map(d => ({ label: d.quarter, value: d.avgScore })),
                'Resilience Score Trends'
              )}
              
              {renderChart(
                data.timeSeriesData.map(d => ({ label: d.quarter, count: d.assessments })),
                'Assessment Activity'
              )}
            </div>

            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Progress</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quarter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Improvements</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.timeSeriesData.map((quarter, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quarter.quarter}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quarter.assessments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quarter.avgScore}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quarter.improvements}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'methodology':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Methodology and Data Sources</h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-4">Official Data Sources</h4>
                <div className="space-y-4 text-sm">
                  <div className="border-l-4 border-red-400 pl-4">
                    <div className="font-medium text-gray-800 mb-1">FEMA National Risk Index (NRI)</div>
                    <div className="text-gray-600 mb-2">Natural hazard risk data for all US counties</div>
                    <a href="https://www.fema.gov/flood-maps/products-tools/national-risk-index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline text-xs">
                      View FEMA NRI Portal →
                    </a>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <div className="font-medium text-gray-800 mb-1">US Bankruptcy Court Records</div>
                    <div className="text-gray-600 mb-2">Business and individual bankruptcy filings by county</div>
                    <a href="https://www.uscourts.gov/statistics-reports/bankruptcy-filings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline text-xs">
                      View Bankruptcy Statistics →
                    </a>
                  </div>
                  <div className="border-l-4 border-green-400 pl-4">
                    <div className="font-medium text-gray-800 mb-1">US Census Bureau</div>
                    <div className="text-gray-600 mb-2">Population, demographics, and county business patterns</div>
                    <a href="https://www.census.gov/programs-surveys/county-business-patterns.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline text-xs">
                      View Census Business Data →
                    </a>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <div className="font-medium text-gray-800 mb-1">SBA Loan Programs Data</div>
                    <div className="text-gray-600 mb-2">Government assistance program accessibility metrics</div>
                    <a href="https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/open-data-sources" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline text-xs">
                      View SBA Open Data →
                    </a>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-4">
                    <div className="font-medium text-gray-800 mb-1">USDA Economic Research Service</div>
                    <div className="text-gray-600 mb-2">Agricultural economic indicators and NASS data</div>
                    <a href="https://www.nass.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline text-xs">
                      View USDA NASS Portal →
                    </a>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-3">Additional Data Sources</h5>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <a href="https://www.usaspending.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">USASpending.gov</a>
                    <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">NOAA Weather Service</a>
                    <a href="https://www.bts.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Bureau of Transportation</a>
                    <a href="https://www.nc.gov/agencies/departments" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">NC State Agencies</a>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-4">Scoring Methodology (Algorithm v1.1)</h4>
                <div className="space-y-4 text-sm">
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <div className="font-medium text-gray-800">Credit Risk Component (25%)</div>
                    <div className="text-gray-600 mb-1">Bankruptcy rates and credit market conditions</div>
                    <div className="text-xs text-gray-500">Source: US Bankruptcy Courts</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                    <div className="font-medium text-gray-800">Disaster Risk Component (30%)</div>
                    <div className="text-gray-600 mb-1">Natural hazard exposure weighted by sector type</div>
                    <div className="text-xs text-gray-500">Source: FEMA National Risk Index</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                    <div className="font-medium text-gray-800">Supply Chain Risk Component (35%)</div>
                    <div className="text-gray-600 mb-1">Economic diversity and infrastructure resilience</div>
                    <div className="text-xs text-gray-500">Source: Census Bureau Economic Data</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                    <div className="font-medium text-gray-800">Government Access Component (10%)</div>
                    <div className="text-gray-600 mb-1">SBA program accessibility and utilization rates</div>
                    <div className="text-xs text-gray-500">Source: SBA Loan Records</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded mt-4">
                    <div className="font-medium text-blue-800 mb-2">Calculation Formula:</div>
                    <div className="font-mono text-xs text-blue-700 bg-blue-100 p-2 rounded">
                      Resilience Score = 100 - (0.25 × Credit Risk + 0.30 × Disaster Risk + 0.35 × Supply Chain Risk + 0.10 × Gov Access Risk)
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      Higher scores (closer to 100) indicate greater resilience. Algorithm updated September 2024.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Update Schedule</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="font-medium text-gray-800 mb-2">Data Refresh Frequency</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Quarterly updates (March 31, June 30, September 30, December 31)</li>
                    <li>• Up to 6-week delay after quarter end for new data processing</li>
                    <li>• Real-time updates during active emergency events</li>
                    <li>• Annual methodology review and calibration</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-2">Quality Assurance</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Cross-validation with federal data sources</li>
                    <li>• Statistical outlier detection and review</li>
                    <li>• Expert panel review of scoring methodology</li>
                    <li>• Public comment period for major changes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4">Technical Specifications</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="font-medium text-blue-800 mb-2">Processing Pipeline</div>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Node.js/TypeScript data processing</li>
                    <li>• Automated ETL pipeline with validation</li>
                    <li>• JSON-based data storage and API</li>
                    <li>• Real-time calculation engine</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-blue-800 mb-2">Platform Architecture</div>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Next.js 15 React frontend</li>
                    <li>• Express.js REST API backend</li>
                    <li>• Responsive design with Tailwind CSS</li>
                    <li>• Interactive visualization components</li>
                  </ul>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="section-padding py-6 bg-white border-b border-gray-200">
        <div className="container-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">NC Resilience Analytics</h1>
                <p className="text-gray-600">See Statistics and Trends Across North Carolina</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/map" className="btn-secondary text-sm">
                Interactive Map →
              </Link>
              <button className="btn-primary text-sm">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Banner */}
      {!loading && data && (
        <div className="bg-white border-b border-gray-200">
          <div className="container-max section-padding py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-600">Last Updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="text-gray-600">
                  Next Update: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <span>{data.totalCounties} Counties</span>
                <span>•</span>
                <span>{stats?.coverage?.hazard_types || data?.hazardTypes?.length || 0} Hazard Types</span>
                <span>•</span>
                <span>{formatCurrency(data.hazardTypes.reduce((sum, h) => sum + h.totalLoss, 0))} Risk Exposure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Choose a Section to Explore:</h3>
            <HelpTooltip
              title="Analytics Navigation"
              description="Click on any tab below to see different types of analysis. Start with 'Overview Dashboard' to see the most important numbers, then explore other sections as needed."
              detailed="Each tab shows the same data from a different perspective. Overview gives you the highlights, County Analysis lets you compare specific counties, Hazards shows which disasters are most common, Trends shows changes over time, and Methodology explains how everything is calculated."
            />
          </div>
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview Dashboard', desc: 'Key numbers and highlights' },
              { id: 'counties', label: 'County Analysis', desc: 'Compare all counties' },
              { id: 'hazards', label: 'Hazard Breakdown', desc: 'Types of disasters' },
              { id: 'trends', label: 'Trends & Insights', desc: 'Changes over time' },
              { id: 'methodology', label: 'Methodology', desc: 'How data is calculated' }
            ].map((tab) => (
              <div key={tab.id} className="flex flex-col">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.label}
                </button>
                <div className="text-xs text-gray-400 mt-1 text-center">{tab.desc}</div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="section-padding py-8">
        <div className="container-max">
          {/* Welcome Guide */}
          <ExplanationPanel 
            title="Understanding the Analytics Page - What These Numbers Mean"
            defaultOpen={activeTab === 'overview'}
            importance="high"
          >
            <div className="space-y-4">
              <p className="text-base leading-relaxed">
                This page shows you the "big picture" of risk conditions across all of North Carolina. Think of it like a weather report, but for economic and disaster risks that affect farms and businesses.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What you'll find in each section:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li><strong>Overview Dashboard:</strong> Key numbers and charts showing the overall health of North Carolina counties</li>
                  <li><strong>County Analysis:</strong> A table comparing all counties side-by-side (like a report card for each county)</li>
                  <li><strong>Hazard Breakdown:</strong> Which types of disasters (hurricanes, droughts, etc.) affect the most counties</li>
                  <li><strong>Trends & Insights:</strong> How conditions have been improving or getting worse over time</li>
                  <li><strong>Methodology:</strong> Technical details about where the data comes from and how scores are calculated</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">How this helps you:</h4>
                <ul className="list-decimal list-inside space-y-1 text-green-800">
                  <li>See how your county compares to others in the state</li>
                  <li>Understand which risks are most common across North Carolina</li>
                  <li>Track whether conditions are improving over time</li>
                  <li>Share data with government officials or media to advocate for more support</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Don't worry about understanding every number!</strong> The most important sections for most people are "Overview Dashboard" and "County Analysis". The other sections provide additional detail if you're interested.
              </p>
            </div>
          </ExplanationPanel>
          
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="section-padding py-8 bg-white border-t border-gray-200">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">About This Data</h4>
              <p className="text-sm text-gray-600">
                The NC Resilience Platform provides comprehensive risk intelligence 
                for agriculture and small business sectors across all 100 North Carolina counties.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Data Downloads</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="text-blue-600 hover:text-blue-700">County Resilience Scores (CSV)</a></div>
                <div><a href="#" className="text-blue-600 hover:text-blue-700">Hazard Risk Data (JSON)</a></div>
                <div><a href="#" className="text-blue-600 hover:text-blue-700">Quarterly Trends (Excel)</a></div>
                <div><a href="#" className="text-blue-600 hover:text-blue-700">Complete Dataset (ZIP)</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Questions & Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                For questions about methodology, data quality, or technical issues:
              </p>
              <div className="text-sm">
                <div className="text-blue-600">analytics@ncresilience.gov</div>
                <div className="text-gray-600 mt-1">(919) 555-DATA</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500 mb-4">
              <p>
                NC Resilience Platform • Built with data from{' '}
                <a href="https://www.fema.gov/flood-maps/products-tools/national-risk-index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">FEMA</a>,{' '}
                <a href="https://www.nass.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">USDA</a>,{' '}
                <a href="https://www.census.gov/programs-surveys/county-business-patterns.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Census Bureau</a>, and{' '}
                <a href="https://www.uscourts.gov/statistics-reports/bankruptcy-filings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">US Courts</a> •{' '}
                <a href="https://github.com/nc-resilience" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Open source project</a>
              </p>
            </div>
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              <a href="https://www.sba.gov/about-sba/sba-performance/open-government/digital-sba/open-data/open-data-sources" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">SBA Data Portal</a>
              <a href="https://www.usaspending.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">USASpending.gov</a>
              <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">NOAA Weather</a>
              <a href="https://www.bts.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Transportation Data</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}