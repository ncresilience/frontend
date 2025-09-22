import { APIResponse, County, CountyDetails, Rankings, RiskAssessment, Statistics, EntityType } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nc-resilience-backend.onrender.com/api';

class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data: APIResponse<T> = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new APIError(data.message || 'API request failed', response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error or server unavailable', 500);
  }
}

export const api = {
  // Health check
  async getHealth() {
    return apiRequest('/health');
  },

  // Counties
  async getCounties(params?: { 
    name?: string; 
    fips_code?: string; 
    include_scores?: boolean;
    entity_type?: EntityType;
  }): Promise<County[]> {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.set('name', params.name);
    if (params?.fips_code) searchParams.set('fips_code', params.fips_code);
    if (params?.include_scores) searchParams.set('include_scores', 'true');
    if (params?.entity_type) searchParams.set('entity_type', params.entity_type);
    
    const query = searchParams.toString();
    return apiRequest(`/counties${query ? `?${query}` : ''}`);
  },

  async getCountyDetails(fips: string): Promise<CountyDetails> {
    return apiRequest(`/counties/${fips}`);
  },

  async getCountyResilience(fips: string, entityType?: EntityType) {
    const params = new URLSearchParams();
    if (entityType) params.set('entity_type', entityType);
    
    const query = params.toString();
    return apiRequest(`/counties/${fips}/resilience${query ? `?${query}` : ''}`);
  },

  async getCountyRisks(fips: string) {
    return apiRequest(`/counties/${fips}/risks`);
  },

  // Resilience
  async getRankings(entityType: EntityType, limit: number = 10): Promise<Rankings> {
    return apiRequest(`/resilience/rankings?entity_type=${entityType}&limit=${limit}`);
  },

  async assessRisk(request: {
    county_fips: string;
    entity_type: EntityType;
    industry_sector?: string;
    business_size?: string;
    farm_type?: string;
  }): Promise<RiskAssessment> {
    return apiRequest('/resilience/assess', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getStatistics(): Promise<Statistics> {
    return apiRequest('/resilience/statistics');
  },
};