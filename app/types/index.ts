// Shared types for NC Resilience Platform Frontend

export interface County {
  fips_code: string;
  name: string;
  state_abbr: string;
  population?: string;
  area_sq_miles?: string;
  resilienceScores?: ResilienceScore[];
}

export interface DisasterRisk {
  county_fips: string;
  hazard_type: string;
  risk_score: number;
  annual_loss_expected: number;
  risk_rating: string;
  percentile: number;
  data_vintage: string;
}

export interface ResilienceScore {
  county_fips: string;
  entity_type: 'agriculture' | 'small-business';
  calculation_date: string;
  overall_score: number;
  credit_risk_component: number;
  disaster_risk_component: number;
  supply_chain_risk_component: number;
  confidence_lower: number;
  confidence_upper: number;
  algorithm_version: string;
}

export interface CountyDetails {
  county: County;
  resilienceScores: ResilienceScore[];
  disasterRisks: DisasterRisk[];
  creditRisks: any[];
}

export interface APIResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  metadata: {
    timestamp: string;
    version: string;
    confidence?: number;
  };
}

export interface Rankings {
  most_resilient: ResilienceScore[];
  least_resilient: ResilienceScore[];
}

export interface RiskAssessment {
  county: County;
  resilience_score: ResilienceScore;
  risk_breakdown: {
    credit_risk: {
      score: number;
      level: string;
      description: string;
    };
    disaster_risk: {
      score: number;
      level: string;
      description: string;
      top_hazards: Array<{
        hazard_type: string;
        risk_score: number;
        risk_rating: string;
      }>;
    };
    supply_chain_risk: {
      score: number;
      level: string;
      description: string;
    };
  };
  recommendations: string[];
  confidence_interval: {
    lower: number;
    upper: number;
    interpretation: string;
  };
}

export interface Statistics {
  total_counties: number;
  total_disaster_risks: number;
  total_resilience_scores: number;
  average_scores: {
    agriculture: number;
    business: number;
  };
  coverage: {
    counties_with_scores: number;
    hazard_types: number;
  };
}

// Entity types
export type EntityType = 'agriculture' | 'small-business';

// Risk levels
export type RiskLevel = 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';

// Hazard types
export const HAZARD_TYPES = {
  AVLN: 'Avalanche',
  CFLD: 'Coastal Flooding', 
  CWAV: 'Cold Wave',
  DRGT: 'Drought',
  ERQK: 'Earthquake',
  HAIL: 'Hail',
  HWAV: 'Heat Wave',
  HRCN: 'Hurricane',
  ISTM: 'Ice Storm',
  LNDS: 'Landslide',
  LTNG: 'Lightning',
  RFLD: 'Riverine Flooding',
  SWND: 'Strong Wind',
  TRND: 'Tornado',
  TSUN: 'Tsunami',
  VLCN: 'Volcanic Activity',
  WFIR: 'Wildfire',
  WNTW: 'Winter Weather'
} as const;