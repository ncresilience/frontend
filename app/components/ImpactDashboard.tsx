'use client';

import { useState, useEffect } from 'react';
import { County } from '../types';
import { PDFReportGenerator } from '../lib/pdfGenerator';

interface ImpactMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'preparedness' | 'financial' | 'infrastructure' | 'community';
  description: string;
}

interface ImpactEvent {
  id: string;
  date: string;
  type: 'assessment' | 'training' | 'improvement' | 'incident';
  title: string;
  description: string;
  impact_score: number;
}

interface ImpactDashboardProps {
  county: County;
  entityType: 'agriculture' | 'small-business';
  onClose: () => void;
}

export default function ImpactDashboard({ county, entityType, onClose }: ImpactDashboardProps) {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [events, setEvents] = useState<ImpactEvent[]>([]);
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y' | 'all'>('90d');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'progress' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [goals, setGoals] = useState<Array<{id: string, target: number, current: number, metric: string}>>([]);

  useEffect(() => {
    loadImpactData();
  }, [county, entityType, timeframe]);

  const loadImpactData = async () => {
    setLoading(true);
    
    // Simulated impact data - in real implementation this would come from API
    const mockMetrics: ImpactMetric[] = entityType === 'agriculture' ? [
      {
        id: 'preparedness',
        name: 'Disaster Preparedness Level',
        value: 78,
        change: 15,
        unit: '%',
        trend: 'up',
        category: 'preparedness',
        description: 'Overall readiness for emergency situations'
      },
      {
        id: 'insurance',
        name: 'Insurance Coverage',
        value: 85,
        change: 8,
        unit: '%',
        trend: 'up',
        category: 'financial',
        description: 'Percentage of assets covered by insurance'
      },
      {
        id: 'diversification',
        name: 'Income Diversification',
        value: 3.2,
        change: 0.7,
        unit: 'sources',
        trend: 'up',
        category: 'financial',
        description: 'Number of distinct revenue streams'
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure Resilience',
        value: 72,
        change: 12,
        unit: '%',
        trend: 'up',
        category: 'infrastructure',
        description: 'Critical systems protection level'
      },
      {
        id: 'network',
        name: 'Support Network Strength',
        value: 8.4,
        change: 1.2,
        unit: '/10',
        trend: 'up',
        category: 'community',
        description: 'Access to community and professional support'
      },
      {
        id: 'recovery_time',
        name: 'Expected Recovery Time',
        value: 21,
        change: -7,
        unit: 'days',
        trend: 'up',
        category: 'preparedness',
        description: 'Estimated time to resume operations after disruption'
      }
    ] : [
      {
        id: 'preparedness',
        name: 'Business Continuity Readiness',
        value: 82,
        change: 18,
        unit: '%',
        trend: 'up',
        category: 'preparedness',
        description: 'Preparedness for business disruptions'
      },
      {
        id: 'financial_reserves',
        name: 'Emergency Fund Coverage',
        value: 4.2,
        change: 1.8,
        unit: 'months',
        trend: 'up',
        category: 'financial',
        description: 'Operating expenses covered by emergency fund'
      },
      {
        id: 'digital_resilience',
        name: 'Digital Infrastructure Resilience',
        value: 88,
        change: 23,
        unit: '%',
        trend: 'up',
        category: 'infrastructure',
        description: 'IT systems backup and recovery capability'
      },
      {
        id: 'supply_chain',
        name: 'Supply Chain Diversification',
        value: 3.8,
        change: 1.1,
        unit: 'sources',
        trend: 'up',
        category: 'infrastructure',
        description: 'Number of alternative suppliers identified'
      },
      {
        id: 'team_training',
        name: 'Team Emergency Training',
        value: 75,
        change: 25,
        unit: '%',
        trend: 'up',
        category: 'preparedness',
        description: 'Percentage of team trained in emergency procedures'
      },
      {
        id: 'customer_retention',
        name: 'Customer Retention During Crisis',
        value: 92,
        change: 5,
        unit: '%',
        trend: 'up',
        category: 'community',
        description: 'Customer loyalty during disruptions'
      }
    ];

    const mockEvents: ImpactEvent[] = [
      {
        id: 'evt-001',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'assessment',
        title: 'Risk Assessment Completed',
        description: 'Completed comprehensive risk assessment wizard',
        impact_score: 15
      },
      {
        id: 'evt-002',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'training',
        title: 'Emergency Response Training',
        description: 'Completed FEMA emergency preparedness course',
        impact_score: 12
      },
      {
        id: 'evt-003',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'improvement',
        title: 'Backup System Installed',
        description: entityType === 'agriculture' ? 'Installed backup generator for barn ventilation' : 'Implemented cloud backup for critical business data',
        impact_score: 20
      },
      {
        id: 'evt-004',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'incident',
        title: 'Minor Weather Event',
        description: 'Successfully weathered severe thunderstorm with minimal disruption',
        impact_score: 8
      }
    ];

    setMetrics(mockMetrics);
    setEvents(mockEvents);
    setLoading(false);
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return change > 0 ? '↗' : '↘';
    if (trend === 'down') return change > 0 ? '↘' : '↗';
    return '→';
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') return change > 0 ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return change > 0 ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assessment': return 'A';
      case 'training': return 'T';
      case 'improvement': return 'I';
      case 'incident': return '!';
      default: return 'E';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'preparedness': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'infrastructure': return 'bg-purple-100 text-purple-800';
      case 'community': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallScore = () => {
    if (metrics.length === 0) return 0;
    
    // Weighted average based on category importance
    const weights = {
      preparedness: 0.3,
      financial: 0.3,
      infrastructure: 0.25,
      community: 0.15
    };
    
    const categoryScores: Record<string, number[]> = {};
    metrics.forEach(metric => {
      if (!categoryScores[metric.category]) {
        categoryScores[metric.category] = [];
      }
      // Normalize values to 0-100 scale
      let normalizedValue = metric.value;
      if (metric.unit === 'days' && metric.id === 'recovery_time') {
        normalizedValue = Math.max(0, 100 - metric.value * 2); // Lower is better for recovery time
      } else if (metric.unit === 'months') {
        normalizedValue = Math.min(100, metric.value * 20); // Convert months to percentage
      } else if (metric.unit === 'sources') {
        normalizedValue = Math.min(100, metric.value * 25); // Convert sources to percentage
      } else if (metric.unit === '/10') {
        normalizedValue = metric.value * 10; // Convert to percentage
      }
      categoryScores[metric.category].push(normalizedValue);
    });
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const weight = weights[category as keyof typeof weights] || 0.1;
      weightedSum += avgScore * weight;
      totalWeight += weight;
    });
    
    return Math.round(weightedSum / totalWeight);
  };

  const generatePDFReport = async (reportType: 'quarterly' | 'progress' | 'compliance') => {
    setGeneratingReport(true);
    
    try {
      const pdfGenerator = new PDFReportGenerator();
      const reportData = {
        county: county.name,
        entityType,
        overallScore: calculateOverallScore(),
        metrics,
        events,
        timeframe,
        generatedDate: new Date().toLocaleDateString()
      };

      switch (reportType) {
        case 'quarterly':
          await pdfGenerator.generateQuarterlyReport(reportData);
          break;
        case 'progress':
          await pdfGenerator.generateProgressSummary(reportData);
          break;
        case 'compliance':
          await pdfGenerator.generateComplianceReport(reportData);
          break;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportDataCSV = () => {
    const csvData = [
      ['Metric', 'Value', 'Unit', 'Change', 'Category', 'Description'],
      ...metrics.map(m => [m.name, m.value.toString(), m.unit, m.change.toString(), m.category, m.description])
    ];
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${county.name}-${entityType}-impact-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const initializeDefaultGoals = () => {
    const defaultGoals = entityType === 'agriculture' ? [
      { id: '1', target: 90, current: metrics.find(m => m.id === 'preparedness')?.value || 0, metric: 'Disaster Preparedness Level' },
      { id: '2', target: 95, current: metrics.find(m => m.id === 'insurance')?.value || 0, metric: 'Insurance Coverage' },
      { id: '3', target: 15, current: metrics.find(m => m.id === 'recovery_time')?.value || 30, metric: 'Recovery Time (lower is better)' },
    ] : [
      { id: '1', target: 90, current: metrics.find(m => m.id === 'preparedness')?.value || 0, metric: 'Business Continuity Readiness' },
      { id: '2', target: 6, current: metrics.find(m => m.id === 'financial_reserves')?.value || 0, metric: 'Emergency Fund Coverage' },
      { id: '3', target: 95, current: metrics.find(m => m.id === 'digital_resilience')?.value || 0, metric: 'Digital Infrastructure Resilience' },
    ];
    setGoals(defaultGoals);
  };

  const generateKeyInsights = () => {
    const insights = [];
    
    // Performance Analysis
    const topMetric = metrics.reduce((max, metric) => 
      (metric.value > max.value) ? metric : max
    );
    const weakestMetric = metrics.reduce((min, metric) => 
      (metric.value < min.value) ? metric : min
    );
    
    insights.push({
      category: 'Performance Analysis',
      title: 'Strongest Area',
      description: `${topMetric.name} is your strongest performance area at ${topMetric.value}${topMetric.unit}. This ${topMetric.category} strength provides a solid foundation for overall resilience.`,
      type: 'strength'
    });
    
    insights.push({
      category: 'Performance Analysis', 
      title: 'Priority Improvement Area',
      description: `${weakestMetric.name} at ${weakestMetric.value}${weakestMetric.unit} represents the greatest opportunity for improvement. Focus on ${weakestMetric.category} initiatives to address this gap.`,
      type: 'opportunity'
    });

    // Trend Analysis
    const improvingMetrics = metrics.filter(m => m.change > 0);
    const decliningMetrics = metrics.filter(m => m.change < 0);
    
    if (improvingMetrics.length > 0) {
      insights.push({
        category: 'Trend Analysis',
        title: 'Positive Momentum',
        description: `${improvingMetrics.length} metrics show improvement, with ${improvingMetrics[0].name} leading at +${improvingMetrics[0].change}${improvingMetrics[0].unit}. This indicates effective resilience building efforts.`,
        type: 'positive'
      });
    }

    if (decliningMetrics.length > 0) {
      insights.push({
        category: 'Trend Analysis',
        title: 'Areas Needing Attention',
        description: `${decliningMetrics.length} metrics show decline. ${decliningMetrics[0].name} decreased by ${Math.abs(decliningMetrics[0].change)}${decliningMetrics[0].unit} and requires immediate attention.`,
        type: 'warning'
      });
    }

    // Activity Impact
    const totalImpact = events.reduce((sum, event) => sum + event.impact_score, 0);
    const mostImpactfulActivity = events.sort((a, b) => b.impact_score - a.impact_score)[0];
    
    insights.push({
      category: 'Activity Impact',
      title: 'Implementation Effectiveness',
      description: `${events.length} activities have generated ${totalImpact} total impact points. "${mostImpactfulActivity?.title}" was most effective with +${mostImpactfulActivity?.impact_score} points.`,
      type: 'neutral'
    });

    // Sector-Specific Insights
    if (entityType === 'agriculture') {
      const seasonalReadiness = metrics.find(m => m.id === 'preparedness')?.value || 0;
      insights.push({
        category: 'Agricultural Focus',
        title: 'Seasonal Preparedness',
        description: `At ${seasonalReadiness}% preparedness, ${seasonalReadiness >= 80 ? 'you are well-prepared for seasonal challenges' : 'consider strengthening seasonal preparation protocols'}. Focus on weather monitoring and crop protection systems.`,
        type: seasonalReadiness >= 80 ? 'positive' : 'opportunity'
      });
    } else {
      const digitalResilience = metrics.find(m => m.id === 'digital_resilience')?.value || 0;
      insights.push({
        category: 'Business Focus',
        title: 'Digital Resilience',
        description: `Your ${digitalResilience}% digital infrastructure resilience ${digitalResilience >= 80 ? 'provides strong protection against IT disruptions' : 'needs enhancement to protect against cyber threats and system failures'}.`,
        type: digitalResilience >= 80 ? 'positive' : 'opportunity'
      });
    }

    // Comparative Analysis
    const avgScore = calculateOverallScore();
    const benchmarkText = avgScore >= 80 ? 'exceeding regional averages' : 
                         avgScore >= 60 ? 'meeting regional standards' : 
                         'below regional averages';
    
    insights.push({
      category: 'Comparative Analysis',
      title: 'Regional Standing',
      description: `Your overall score of ${avgScore}/100 is ${benchmarkText}. ${avgScore >= 60 ? 'Continue current strategies while addressing specific gaps.' : 'Implement comprehensive improvement initiatives across all categories.'}`,
      type: avgScore >= 60 ? 'positive' : 'warning'
    });

    return insights;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Overall Resilience Score
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
                      className="stroke-blue-600"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${calculateOverallScore()}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{calculateOverallScore()}</div>
                      <div className="text-sm text-gray-500">out of 100</div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Based on {metrics.length} tracked metrics across {timeframe} timeframe
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{metric.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(metric.category)}`}>
                      {metric.category}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.change)}`}>
                      <span>{getTrendIcon(metric.trend, metric.change)}</span>
                      <span className="text-sm font-medium">
                        {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Impact Activities</h3>
              <div className="space-y-3">
                {events.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{getEventIcon(event.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">{event.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(event.date).toLocaleDateString()} • +{event.impact_score} impact points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights & Analysis</h3>
              <div className="space-y-4">
                {generateKeyInsights().map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'strength' ? 'bg-green-50 border-green-400' :
                    insight.type === 'positive' ? 'bg-blue-50 border-blue-400' :
                    insight.type === 'warning' ? 'bg-red-50 border-red-400' :
                    insight.type === 'opportunity' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-gray-50 border-gray-400'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {insight.category}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            insight.type === 'strength' ? 'bg-green-400' :
                            insight.type === 'positive' ? 'bg-blue-400' :
                            insight.type === 'warning' ? 'bg-red-400' :
                            insight.type === 'opportunity' ? 'bg-yellow-400' :
                            'bg-gray-400'
                          }`}></span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps Recommendation</h4>
                <p className="text-sm text-blue-800">
                  Based on your current metrics and trends, consider focusing on the identified improvement areas while maintaining your strengths. 
                  Use the Reports section to generate detailed action plans and track progress toward specific goals.
                </p>
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Detailed Metrics</h3>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="grid gap-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                      <p className="text-sm text-gray-600">{metric.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(metric.category)}`}>
                      {metric.category}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-sm text-gray-500">Current Value</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getTrendColor(metric.trend, metric.change)}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                      </div>
                      <div className="text-sm text-gray-500">Change</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">
                        {getTrendIcon(metric.trend, metric.change)}
                      </div>
                      <div className="text-sm text-gray-500">Trend</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Progress Timeline</h3>
            
            <div className="relative">
              {events.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-4 pb-6">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                    </div>
                    {index < events.length - 1 && (
                      <div className="absolute top-10 left-5 w-0.5 h-16 bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <div className="text-sm text-blue-600 font-medium">
                        +{event.impact_score} points
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(event.date).toLocaleDateString()} • {event.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card bg-green-50 border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Impact Summary</h4>
              <p className="text-sm text-green-800 mb-3">
                Total impact score gained: +{events.reduce((sum, event) => sum + event.impact_score, 0)} points
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-900">Most Impactful</div>
                  <div className="text-green-800">
                    {events.sort((a, b) => b.impact_score - a.impact_score)[0]?.title || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-green-900">Recent Activity</div>
                  <div className="text-green-800">
                    {events.length} activities in {timeframe}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Impact Reports & Goal Tracking</h3>
              {generatingReport && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Generating PDF...</span>
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Quarterly Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive resilience assessment for the past quarter
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Metric trends and analysis</li>
                  <li>• Impact activity summary</li>
                  <li>• Key insights and recommendations</li>
                  <li>• Executive summary for stakeholders</li>
                  <li>• Professional PDF format</li>
                </ul>
                <button 
                  className="btn-primary w-full text-sm"
                  onClick={() => generatePDFReport('quarterly')}
                  disabled={generatingReport}
                >
                  {generatingReport ? 'Generating...' : 'Generate PDF Report'}
                </button>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Progress Summary</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Share your resilience journey with stakeholders
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Key achievements highlighted</li>
                  <li>• Timeline of improvement activities</li>
                  <li>• Impact points summary</li>
                  <li>• Shareable PDF format</li>
                  <li>• Perfect for grant applications</li>
                </ul>
                <button 
                  className="btn-secondary w-full text-sm"
                  onClick={() => generatePDFReport('progress')}
                  disabled={generatingReport}
                >
                  Create Progress PDF
                </button>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Goal Tracking</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor progress toward resilience goals
                </p>
                {goals.length === 0 ? (
                  <>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• Set custom targets for key metrics</li>
                      <li>• Track milestone achievements</li>
                      <li>• Visual progress indicators</li>
                      <li>• Automated progress alerts</li>
                    </ul>
                    <button 
                      className="btn-secondary w-full text-sm"
                      onClick={initializeDefaultGoals}
                    >
                      Initialize Goals
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {goals.map(goal => (
                        <div key={goal.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{goal.metric}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{width: `${Math.min(100, (goal.current / goal.target) * 100)}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      className="btn-secondary w-full text-sm"
                      onClick={() => setGoals([])}
                    >
                      Reset Goals
                    </button>
                  </>
                )}
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Compliance Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Documentation for insurance and regulatory requirements
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Insurance documentation ready</li>
                  <li>• Regulatory compliance certification</li>
                  <li>• Risk management evidence</li>
                  <li>• Professional legal format</li>
                  <li>• Meets industry standards</li>
                </ul>
                <button 
                  className="btn-secondary w-full text-sm"
                  onClick={() => generatePDFReport('compliance')}
                  disabled={generatingReport}
                >
                  Export Compliance PDF
                </button>
              </div>
            </div>

            {/* Additional Report Options */}
            <div className="card bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-4">Additional Export Options</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <button 
                  className="btn-secondary text-sm"
                  onClick={exportDataCSV}
                >
                  Export Raw Data (CSV)
                </button>
                <button 
                  className="btn-secondary text-sm"
                  onClick={() => {
                    const data = {
                      county: county.name,
                      entityType,
                      overallScore: calculateOverallScore(),
                      metrics,
                      events,
                      insights: generateKeyInsights(),
                      generatedDate: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${county.name}-${entityType}-full-data-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Export Full Data (JSON)
                </button>
                <button 
                  className="btn-secondary text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${county.name} County Resilience Summary:\n` +
                      `Overall Score: ${calculateOverallScore()}/100\n` +
                      `Top Metric: ${metrics.reduce((max, m) => m.value > max.value ? m : max).name}\n` +
                      `Total Impact: +${events.reduce((sum, e) => sum + e.impact_score, 0)} points\n` +
                      `Generated: ${new Date().toLocaleDateString()}`
                    );
                    alert('Summary copied to clipboard!');
                  }}
                >
                  Copy Summary to Clipboard
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Impact Tracking Dashboard</h2>
              <p className="text-gray-600 mt-1">
                {county.name} County • {entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Resilience
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'metrics', label: 'Detailed Metrics' },
                { id: 'progress', label: 'Progress Timeline' },
                { id: 'reports', label: 'Reports & Goals' }
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading impact data...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Data updated: {new Date().toLocaleString()} • {metrics.length} metrics tracked • {events.length} activities logged
            </div>
            <div className="space-x-3">
              <button 
                className="btn-secondary text-sm"
                onClick={exportDataCSV}
              >
                Export Data (CSV)
              </button>
              <button onClick={onClose} className="btn-primary text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}