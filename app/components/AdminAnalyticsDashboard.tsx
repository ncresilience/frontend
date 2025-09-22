'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AnalyticsMetrics {
  total_sessions: number;
  unique_users: number;
  average_session_duration: number;
  bounce_rate: number;
  pages_per_session: number;
  most_visited_pages: Array<{ page: string; visits: number }>;
  county_engagement: Array<{ county_fips: string; county_name: string; views: number }>;
  feature_usage: Array<{ feature: string; uses: number }>;
  conversion_funnel: {
    landing: number;
    county_selected: number;
    assessment_started: number;
    assessment_completed: number;
    programs_viewed: number;
    crisis_mode_activated: number;
  };
  government_impact: {
    total_assessments: number;
    sba_program_matches: number;
    insurance_claims_generated: number;
    damage_assessments_completed: number;
    pdf_reports_downloaded: number;
  };
}

interface RealtimeData {
  current_activity: {
    active_sessions: number;
    total_events: number;
    counties_active: number;
    crisis_activations: number;
  };
  recent_counties: Array<{
    county_fips: string;
    county_name: string;
    recent_activity: number;
  }>;
  last_updated: string;
}

interface AdminAnalyticsDashboardProps {
  onClose: () => void;
}

export default function AdminAnalyticsDashboard({ onClose }: AdminAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedTimeframe));

      // Fetch metrics and realtime data
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const [metricsResponse, realtimeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/metrics?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`),
        fetch(`${API_BASE_URL}/analytics/realtime`)
      ]);

      if (!metricsResponse.ok || !realtimeResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const metricsData = await metricsResponse.json();
      const realtimeDataResponse = await realtimeResponse.json();

      if (metricsData.status === 'success') {
        setMetrics(metricsData.data);
      }
      if (realtimeDataResponse.status === 'success') {
        setRealtimeData(realtimeDataResponse.data);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedTimeframe]);

  const downloadGovernmentReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedTimeframe));

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/analytics/government-report?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);
      const data = await response.json();

      if (data.status === 'success') {
        // Create and download the report as JSON
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `government-impact-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download government report:', error);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${Math.round(num * 10) / 10}%`;
  };

  const calculateConversionRate = (completed: number, started: number): number => {
    return started > 0 ? (completed / started) * 100 : 0;
  };

  if (loading && !metrics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">NC Resilience Platform Analytics</h2>
            <p className="text-gray-600">Internal platform metrics and government impact data</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto refresh</span>
            </label>
            <button
              onClick={downloadGovernmentReport}
              className="btn-secondary text-sm"
            >
              Download Gov Report
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button onClick={fetchAnalyticsData} className="text-red-600 underline">Try again</button>
            </div>
          )}

          {/* Real-time Activity */}
          {realtimeData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Real-time Activity</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{realtimeData.current_activity.active_sessions}</div>
                  <div className="text-sm text-green-700">Active Sessions (5min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{realtimeData.current_activity.total_events}</div>
                  <div className="text-sm text-green-700">Total Events (5min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{realtimeData.current_activity.counties_active}</div>
                  <div className="text-sm text-green-700">Counties Active (5min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{realtimeData.current_activity.crisis_activations}</div>
                  <div className="text-sm text-green-700">Crisis Activations (5min)</div>
                </div>
              </div>
              <div className="text-xs text-green-600 mt-2">
                Last updated: {new Date(realtimeData.last_updated).toLocaleTimeString()}
              </div>
            </div>
          )}

          {metrics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatNumber(metrics.unique_users)}</div>
                  <div className="text-blue-700">Unique Users</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{formatNumber(metrics.total_sessions)}</div>
                  <div className="text-purple-700">Total Sessions</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{formatPercentage(metrics.bounce_rate)}</div>
                  <div className="text-orange-700">Bounce Rate</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-indigo-600">{Math.round(metrics.pages_per_session * 10) / 10}</div>
                  <div className="text-indigo-700">Pages per Session</div>
                </div>
              </div>

              {/* Government Impact Metrics */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Government Impact Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(metrics.government_impact.total_assessments)}</div>
                    <div className="text-sm text-gray-600">Risk Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(metrics.government_impact.sba_program_matches)}</div>
                    <div className="text-sm text-gray-600">Program Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(metrics.government_impact.insurance_claims_generated)}</div>
                    <div className="text-sm text-gray-600">Insurance Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(metrics.government_impact.damage_assessments_completed)}</div>
                    <div className="text-sm text-gray-600">Damage Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(metrics.government_impact.pdf_reports_downloaded)}</div>
                    <div className="text-sm text-gray-600">Reports Generated</div>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">User Conversion Funnel</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Landing Pages</span>
                    <span className="font-semibold">{formatNumber(metrics.conversion_funnel.landing)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>County Selected</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{formatNumber(metrics.conversion_funnel.county_selected)}</span>
                      <span className="text-sm text-gray-500">
                        ({formatPercentage(calculateConversionRate(metrics.conversion_funnel.county_selected, metrics.conversion_funnel.landing))})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assessment Started</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{formatNumber(metrics.conversion_funnel.assessment_started)}</span>
                      <span className="text-sm text-gray-500">
                        ({formatPercentage(calculateConversionRate(metrics.conversion_funnel.assessment_started, metrics.conversion_funnel.county_selected))})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assessment Completed</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{formatNumber(metrics.conversion_funnel.assessment_completed)}</span>
                      <span className="text-sm text-gray-500">
                        ({formatPercentage(calculateConversionRate(metrics.conversion_funnel.assessment_completed, metrics.conversion_funnel.assessment_started))})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Programs Viewed</span>
                    <span className="font-semibold">{formatNumber(metrics.conversion_funnel.programs_viewed)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Crisis Mode Activated</span>
                    <span className="font-semibold">{formatNumber(metrics.conversion_funnel.crisis_mode_activated)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Counties */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Counties by Engagement</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {metrics.county_engagement.slice(0, 10).map((county, index) => (
                      <div key={county.county_fips} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm">{county.county_name}</span>
                        </div>
                        <span className="font-semibold">{formatNumber(county.views)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Usage */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {metrics.feature_usage.map((feature, index) => (
                      <div key={feature.feature} className="flex items-center justify-between">
                        <span className="text-sm">{feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="font-semibold">{formatNumber(feature.uses)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Most Visited Pages */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Most Visited Pages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics.most_visited_pages.slice(0, 6).map((page, index) => (
                    <div key={page.page} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{page.page}</span>
                        <span className="font-semibold">{formatNumber(page.visits)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}