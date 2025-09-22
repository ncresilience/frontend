import { render, screen } from '@testing-library/react';
import RiskScoreCard from '../RiskScoreCard';

const mockAgricultureScore = {
  county_fips: '37183',
  entity_type: 'agriculture' as const,
  overall_score: 68,
  credit_risk_score: 72,
  disaster_risk_score: 65,
  supply_chain_risk_score: 67,
  risk_factors: [
    {
      factor: 'drought_risk',
      impact: 'moderate',
      description: 'Moderate drought risk based on historical patterns',
      recommendation: 'Implement water conservation practices',
      data_source: 'NOAA Climate Data'
    },
    {
      factor: 'market_access',
      impact: 'low',
      description: 'Good access to agricultural markets',
      recommendation: 'Maintain current market relationships',
      data_source: 'USDA Market Data'
    }
  ],
  last_updated: '2024-01-15T10:00:00Z'
};

const mockBusinessScore = {
  county_fips: '37119',
  entity_type: 'small-business' as const,
  overall_score: 71,
  credit_risk_score: 75,
  disaster_risk_score: 68,
  supply_chain_risk_score: 70,
  risk_factors: [
    {
      factor: 'hurricane_risk',
      impact: 'high',
      description: 'High hurricane risk in coastal proximity',
      recommendation: 'Develop comprehensive disaster preparedness plan',
      data_source: 'FEMA Risk Index'
    }
  ],
  last_updated: '2024-01-15T10:00:00Z'
};

describe('RiskScoreCard Component', () => {
  it('renders agriculture score correctly', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText('68')).toBeInTheDocument();
    expect(screen.getByText('out of 100')).toBeInTheDocument();
    expect(screen.getByText('Agricultural Resilience Score')).toBeInTheDocument();
  });

  it('renders business score correctly', () => {
    render(
      <RiskScoreCard 
        score={mockBusinessScore} 
        entityType="small-business" 
      />
    );

    expect(screen.getByText('71')).toBeInTheDocument();
    expect(screen.getByText('Business Resilience Score')).toBeInTheDocument();
  });

  it('displays correct score interpretation for good scores', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    // Score of 68 should be "Good resilience"
    expect(screen.getByText(/Good resilience/)).toBeInTheDocument();
  });

  it('displays correct score interpretation for excellent scores', () => {
    const excellentScore = { ...mockAgricultureScore, overall_score: 85 };
    
    render(
      <RiskScoreCard 
        score={excellentScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText(/Excellent resilience/)).toBeInTheDocument();
  });

  it('displays correct score interpretation for low scores', () => {
    const lowScore = { ...mockAgricultureScore, overall_score: 45 };
    
    render(
      <RiskScoreCard 
        score={lowScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText(/Moderate resilience/)).toBeInTheDocument();
  });

  it('displays correct score interpretation for very low scores', () => {
    const veryLowScore = { ...mockAgricultureScore, overall_score: 35 };
    
    render(
      <RiskScoreCard 
        score={veryLowScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText(/Lower resilience/)).toBeInTheDocument();
  });

  it('renders individual risk component scores', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText('Credit Risk')).toBeInTheDocument();
    expect(screen.getByText('Disaster Risk')).toBeInTheDocument();
    expect(screen.getByText('Supply Chain Risk')).toBeInTheDocument();
    
    expect(screen.getByText('72')).toBeInTheDocument(); // credit risk score
    expect(screen.getByText('65')).toBeInTheDocument(); // disaster risk score
    expect(screen.getByText('67')).toBeInTheDocument(); // supply chain risk score
  });

  it('displays risk factors when available', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText('drought_risk')).toBeInTheDocument();
    expect(screen.getByText('market_access')).toBeInTheDocument();
    expect(screen.getByText('Moderate drought risk based on historical patterns')).toBeInTheDocument();
  });

  it('shows appropriate color coding for different score ranges', () => {
    const { rerender } = render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    // Good score (68) should have green coloring
    const scoreElement = screen.getByText('68');
    expect(scoreElement).toHaveClass('text-green-600');

    // Test excellent score
    const excellentScore = { ...mockAgricultureScore, overall_score: 85 };
    rerender(
      <RiskScoreCard 
        score={excellentScore} 
        entityType="agriculture" 
      />
    );
    
    const excellentScoreElement = screen.getByText('85');
    expect(excellentScoreElement).toHaveClass('text-green-600');

    // Test moderate score
    const moderateScore = { ...mockAgricultureScore, overall_score: 45 };
    rerender(
      <RiskScoreCard 
        score={moderateScore} 
        entityType="agriculture" 
      />
    );
    
    const moderateScoreElement = screen.getByText('45');
    expect(moderateScoreElement).toHaveClass('text-yellow-600');

    // Test low score
    const lowScore = { ...mockAgricultureScore, overall_score: 30 };
    rerender(
      <RiskScoreCard 
        score={lowScore} 
        entityType="agriculture" 
      />
    );
    
    const lowScoreElement = screen.getByText('30');
    expect(lowScoreElement).toHaveClass('text-red-600');
  });

  it('renders agriculture-specific language', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText('Agricultural Resilience Score')).toBeInTheDocument();
    expect(screen.getByText(/farming operation/)).toBeInTheDocument();
  });

  it('renders business-specific language', () => {
    render(
      <RiskScoreCard 
        score={mockBusinessScore} 
        entityType="small-business" 
      />
    );

    expect(screen.getByText('Business Resilience Score')).toBeInTheDocument();
    expect(screen.getByText(/business/)).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  it('handles missing risk factors gracefully', () => {
    const scoreWithoutFactors = {
      ...mockAgricultureScore,
      risk_factors: []
    };

    render(
      <RiskScoreCard 
        score={scoreWithoutFactors} 
        entityType="agriculture" 
      />
    );

    // Should still render the main score
    expect(screen.getByText('68')).toBeInTheDocument();
    expect(screen.getByText('Agricultural Resilience Score')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    const cardElement = screen.getByText('Agricultural Resilience Score').closest('div');
    expect(cardElement).toHaveClass('card');
  });

  it('displays appropriate help information', () => {
    render(
      <RiskScoreCard 
        score={mockAgricultureScore} 
        entityType="agriculture" 
      />
    );

    expect(screen.getByText(/This score combines/)).toBeInTheDocument();
  });
});