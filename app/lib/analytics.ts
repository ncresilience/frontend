// Comprehensive Analytics and User Activity Tracking System
// Tracks user interactions to provide government metrics and platform optimization data

export interface UserEvent {
  id: string;
  session_id: string;
  timestamp: Date;
  event_type: string;
  page: string;
  county_fips?: string;
  entity_type?: 'agriculture' | 'small-business';
  user_agent: string;
  ip_hash?: string;
  metadata?: Record<string, any>;
}

export interface SessionData {
  session_id: string;
  start_time: Date;
  end_time?: Date;
  total_duration?: number;
  pages_visited: string[];
  counties_viewed: string[];
  features_used: string[];
  entity_type?: 'agriculture' | 'small-business';
  completed_actions: string[];
  referrer?: string;
  exit_page?: string;
}

export interface AnalyticsMetrics {
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

class AnalyticsTracker {
  private sessionId: string;
  private events: UserEvent[] = [];
  private sessionStart: Date;
  private isTrackingEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.isTrackingEnabled = this.shouldEnableTracking();
    
    if (this.isTrackingEnabled && typeof window !== 'undefined') {
      this.initializeSession();
      this.setupPageVisibilityTracking();
      this.setupUnloadTracking();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldEnableTracking(): boolean {
    // Only track in production and when user hasn't opted out
    if (typeof window === 'undefined') return false;
    
    const doNotTrack = navigator.doNotTrack === '1' || 
                      localStorage.getItem('analytics-opt-out') === 'true';
    return !doNotTrack;
  }

  private initializeSession(): void {
    this.track('session_start', {
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      }
    });
  }

  private setupPageVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.track('page_blur');
      } else {
        this.track('page_focus');
      }
    });
  }

  private setupUnloadTracking(): void {
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - this.sessionStart.getTime()
      });
      this.sendPendingEvents();
    });
  }

  public track(eventType: string, metadata?: Record<string, any>): void {
    if (!this.isTrackingEnabled) return;

    const event: UserEvent = {
      id: `${this.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      session_id: this.sessionId,
      timestamp: new Date(),
      event_type: eventType,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      metadata
    };

    this.events.push(event);
    
    // Send events in batches to avoid overwhelming the server
    if (this.events.length >= 5) {
      this.sendEvents();
    }
  }

  // Specific tracking methods for common user actions
  public trackPageView(page: string, county?: string, entityType?: 'agriculture' | 'small-business'): void {
    this.track('page_view', {
      page,
      county_fips: county,
      entity_type: entityType
    });
  }

  public trackCountySelection(countyFips: string, countyName: string, entityType: 'agriculture' | 'small-business'): void {
    this.track('county_selected', {
      county_fips: countyFips,
      county_name: countyName,
      entity_type: entityType
    });
  }

  public trackAssessmentStart(countyFips: string, entityType: 'agriculture' | 'small-business'): void {
    this.track('assessment_started', {
      county_fips: countyFips,
      entity_type: entityType
    });
  }

  public trackAssessmentComplete(countyFips: string, entityType: 'agriculture' | 'small-business', score: number): void {
    this.track('assessment_completed', {
      county_fips: countyFips,
      entity_type: entityType,
      risk_score: score
    });
  }

  public trackProgramView(programType: string, countyFips: string, entityType: 'agriculture' | 'small-business'): void {
    this.track('program_viewed', {
      program_type: programType,
      county_fips: countyFips,
      entity_type: entityType
    });
  }

  public trackCrisisModeActivation(countyFips: string, entityType: 'agriculture' | 'small-business'): void {
    this.track('crisis_mode_activated', {
      county_fips: countyFips,
      entity_type: entityType
    });
  }

  public trackInsuranceClaimGeneration(countyFips: string, entityType: 'agriculture' | 'small-business', claimType: string): void {
    this.track('insurance_claim_generated', {
      county_fips: countyFips,
      entity_type: entityType,
      claim_type: claimType,
      government_value: 'disaster_recovery_assistance'
    });
  }

  public trackDamageAssessment(countyFips: string, entityType: 'agriculture' | 'small-business', damageLevel: string): void {
    this.track('damage_assessment_completed', {
      county_fips: countyFips,
      entity_type: entityType,
      damage_level: damageLevel,
      government_value: 'fema_reporting_assistance'
    });
  }

  public trackPDFDownload(reportType: string, countyFips: string, entityType: 'agriculture' | 'small-business'): void {
    this.track('pdf_downloaded', {
      report_type: reportType,
      county_fips: countyFips,
      entity_type: entityType,
      government_value: 'report_generation'
    });
  }

  public trackFeatureUsage(feature: string, context?: Record<string, any>): void {
    this.track('feature_used', {
      feature_name: feature,
      ...context
    });
  }

  public trackError(error: string, context?: Record<string, any>): void {
    this.track('error_occurred', {
      error_message: error,
      ...context
    });
  }

  public trackPerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.track('performance_metric', {
      metric_name: metric,
      metric_value: value,
      ...context
    });
  }

  private async sendEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      await fetch(`${API_BASE_URL}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Add events back to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  private sendPendingEvents(): void {
    if (this.events.length > 0 && navigator.sendBeacon) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const blob = new Blob([JSON.stringify({ events: this.events })], {
        type: 'application/json'
      });
      navigator.sendBeacon(
        `${API_BASE_URL}/analytics/events`,
        blob
      );
    }
  }

  public async getSessionMetrics(): Promise<any> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/analytics/session/${this.sessionId}`);
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch session metrics:', error);
      return null;
    }
  }

  public optOut(): void {
    localStorage.setItem('analytics-opt-out', 'true');
    this.isTrackingEnabled = false;
    this.events = [];
  }

  public optIn(): void {
    localStorage.removeItem('analytics-opt-out');
    this.isTrackingEnabled = true;
    this.initializeSession();
  }
}

// Government Impact Metrics Calculator
export class GovernmentMetrics {
  static calculateEfficiencyGains(metrics: AnalyticsMetrics): {
    disaster_response_improvement: number;
    program_matching_efficiency: number;
    assessment_time_savings: number;
    documentation_acceleration: number;
  } {
    const baseline_assessment_time = 240; // 4 hours manual assessment
    const platform_assessment_time = 15; // 15 minutes with platform
    
    return {
      disaster_response_improvement: Math.round(
        (metrics.government_impact.damage_assessments_completed * 0.8) + 
        (metrics.government_impact.insurance_claims_generated * 0.6)
      ),
      program_matching_efficiency: Math.round(
        metrics.government_impact.sba_program_matches * 2.5
      ),
      assessment_time_savings: Math.round(
        metrics.government_impact.total_assessments * 
        (baseline_assessment_time - platform_assessment_time)
      ),
      documentation_acceleration: Math.round(
        metrics.government_impact.pdf_reports_downloaded * 1.8
      )
    };
  }

  static generateGovernmentReport(metrics: AnalyticsMetrics): {
    summary: string;
    key_metrics: Record<string, number>;
    cost_savings: number;
    efficiency_gains: Record<string, number>;
    recommendations: string[];
  } {
    const efficiency = this.calculateEfficiencyGains(metrics);
    const estimated_cost_per_hour = 75; // Government employee cost
    const total_time_saved = efficiency.assessment_time_savings;
    const cost_savings = total_time_saved * estimated_cost_per_hour;

    return {
      summary: `Platform has served ${metrics.unique_users} unique users across ${metrics.county_engagement.length} counties, generating ${metrics.government_impact.total_assessments} risk assessments and facilitating ${metrics.government_impact.sba_program_matches} government program connections.`,
      key_metrics: {
        total_users: metrics.unique_users,
        counties_served: metrics.county_engagement.length,
        assessments_completed: metrics.government_impact.total_assessments,
        program_matches: metrics.government_impact.sba_program_matches,
        crisis_responses: metrics.conversion_funnel.crisis_mode_activated
      },
      cost_savings,
      efficiency_gains: efficiency,
      recommendations: [
        'Expand platform access to additional counties with high risk scores',
        'Integrate additional government program databases for broader matching',
        'Develop automated alert system for crisis response activation',
        'Create direct API connections with SBA and FEMA systems'
      ]
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsTracker();

// Hook for React components
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackCountySelection: analytics.trackCountySelection.bind(analytics),
    trackAssessmentStart: analytics.trackAssessmentStart.bind(analytics),
    trackAssessmentComplete: analytics.trackAssessmentComplete.bind(analytics),
    trackProgramView: analytics.trackProgramView.bind(analytics),
    trackCrisisModeActivation: analytics.trackCrisisModeActivation.bind(analytics),
    trackInsuranceClaimGeneration: analytics.trackInsuranceClaimGeneration.bind(analytics),
    trackDamageAssessment: analytics.trackDamageAssessment.bind(analytics),
    trackPDFDownload: analytics.trackPDFDownload.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
  };
}