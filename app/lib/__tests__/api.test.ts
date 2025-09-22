import { api } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Library', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getCounties', () => {
    it('should fetch counties successfully', async () => {
      const mockCounties = [
        { fips_code: '37183', name: 'Wake County', population: '1129410' },
        { fips_code: '37119', name: 'Mecklenburg County', population: '1115482' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockCounties
        })
      });

      const result = await api.getCounties();
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/counties',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result).toEqual(mockCounties);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          status: 'error',
          message: 'Internal server error'
        })
      });

      await expect(api.getCounties()).rejects.toThrow('Internal server error');
    });

    it('should include query parameters when provided', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: []
        })
      });

      await api.getCounties({ 
        name: 'Wake',
        entity_type: 'agriculture',
        include_scores: true
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/counties?name=Wake&include_scores=true&entity_type=agriculture',
        expect.any(Object)
      );
    });
  });

  describe('getCountyDetails', () => {
    it('should fetch county details successfully', async () => {
      const mockCountyDetails = {
        county: { fips_code: '37183', name: 'Wake County' },
        resilienceScores: [
          { entity_type: 'agriculture', overall_score: 65 }
        ],
        disasterRisks: []
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockCountyDetails
        })
      });

      const result = await api.getCountyDetails('37183');
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/counties/37183',
        expect.any(Object)
      );
      expect(result).toEqual(mockCountyDetails);
    });
  });

  describe('getRankings', () => {
    it('should fetch rankings successfully', async () => {
      const mockRankings = {
        most_resilient: [
          { county_fips: '37183', overall_score: 75 },
          { county_fips: '37119', overall_score: 72 }
        ],
        least_resilient: []
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockRankings
        })
      });

      const result = await api.getRankings('agriculture', 10);
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/resilience/rankings?entity_type=agriculture&limit=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockRankings);
    });
  });

  describe('assessRisk', () => {
    it('should submit risk assessment successfully', async () => {
      const mockAssessment = {
        overall_score: 68,
        risk_factors: ['drought', 'supply_chain'],
        recommendations: ['diversify_crops', 'emergency_fund']
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockAssessment
        })
      });

      const assessmentRequest = {
        county_fips: '37183',
        entity_type: 'agriculture' as const,
        farm_type: 'crop'
      };

      const result = await api.assessRisk(assessmentRequest);
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/resilience/assess',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assessmentRequest)
        })
      );
      expect(result).toEqual(mockAssessment);
    });
  });

  describe('getStatistics', () => {
    it('should fetch platform statistics successfully', async () => {
      const mockStats = {
        total_counties: 100,
        total_resilience_scores: 200,
        average_agriculture_score: 64,
        average_business_score: 66
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockStats
        })
      });

      const result = await api.getStatistics();
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/resilience/statistics',
        expect.any(Object)
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('network error handling', () => {
    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getCounties()).rejects.toThrow('Network error or server unavailable');
    });
  });
});