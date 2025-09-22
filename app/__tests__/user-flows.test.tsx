import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import Agriculture from '../agriculture/page';
import Business from '../business/page';
import { api } from '../lib/api';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock API
jest.mock('../lib/api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock analytics
jest.mock('../lib/analytics', () => ({
  useAnalytics: () => ({
    trackPageView: jest.fn(),
    trackCountySelection: jest.fn(),
    trackAssessmentStart: jest.fn(),
    trackFeatureUsage: jest.fn(),
  }),
  analytics: {
    track: jest.fn(),
  },
}));

const mockStatistics = {
  total_counties: 100,
  total_resilience_scores: 200,
  average_agriculture_score: 64,
  average_business_score: 66,
};

const mockCounties = [
  {
    fips_code: '37183',
    name: 'Wake County',
    population: '1129410',
    area_sq_miles: '857.14',
  },
  {
    fips_code: '37119',
    name: 'Mecklenburg County',
    population: '1115482',
    area_sq_miles: '546.35',
  },
];

const mockCountyDetails = {
  county: {
    fips_code: '37183',
    name: 'Wake County',
    population: '1129410',
    area_sq_miles: '857.14',
  },
  resilienceScores: [
    {
      county_fips: '37183',
      entity_type: 'agriculture',
      overall_score: 68,
      credit_risk_score: 72,
      disaster_risk_score: 65,
      supply_chain_risk_score: 67,
      risk_factors: [],
      last_updated: '2024-01-15T10:00:00Z',
    },
  ],
  disasterRisks: [
    {
      hazard_type: 'drought',
      risk_rating: 'moderate',
      expected_annual_loss: 50000,
      social_vulnerability: 0.3,
    },
  ],
};

const mockRankings = {
  most_resilient: [
    { county_fips: '37183', overall_score: 75 },
    { county_fips: '37119', overall_score: 72 },
  ],
  least_resilient: [
    { county_fips: '37001', overall_score: 45 },
  ],
};

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    mockApi.getStatistics.mockResolvedValue(mockStatistics);
    mockApi.getCounties.mockResolvedValue(mockCounties);
    mockApi.getCountyDetails.mockResolvedValue(mockCountyDetails);
    mockApi.getRankings.mockResolvedValue(mockRankings);
  });

  describe('Homepage Flow', () => {
    it('displays platform statistics and navigation options', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('100 Counties')).toBeInTheDocument();
      });

      expect(screen.getByText('NC Resilience Platform')).toBeInTheDocument();
      expect(screen.getByText(/Build Resilience for Your/)).toBeInTheDocument();
      expect(screen.getByText('Get Started →')).toBeInTheDocument();
      expect(screen.getByText('View Risk Map')).toBeInTheDocument();
    });

    it('provides path selection for agriculture and business', () => {
      render(<Home />);

      expect(screen.getByText(/Choose Your Path/)).toBeInTheDocument();
      expect(screen.getByText(/Agricultural Operations/)).toBeInTheDocument();
      expect(screen.getByText(/Small Business Owners/)).toBeInTheDocument();
    });
  });

  describe('Agriculture User Flow', () => {
    it('loads agriculture page with county rankings', async () => {
      render(<Agriculture />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalledWith('agriculture', 5);
      });

      expect(screen.getByText('Agricultural Resilience Platform')).toBeInTheDocument();
      expect(screen.getByText(/Step 1: Select Your County/)).toBeInTheDocument();
    });

    it('allows county selection and displays county details', async () => {
      const user = userEvent.setup();
      render(<Agriculture />);

      // Wait for initial loading
      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      // Find and click county selector
      const countySelector = screen.getByRole('button');
      await user.click(countySelector);

      // Wait for counties to load and select Wake County
      await waitFor(() => {
        expect(screen.getByText('Wake County')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wake County'));

      // Wait for county details to load
      await waitFor(() => {
        expect(mockApi.getCountyDetails).toHaveBeenCalledWith('37183');
      });

      // Check that county assessment appears
      expect(screen.getByText(/Wake County Agricultural Assessment/)).toBeInTheDocument();
    });

    it('displays risk score card after county selection', async () => {
      const user = userEvent.setup();
      render(<Agriculture />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      // Select county
      const countySelector = screen.getByRole('button');
      await user.click(countySelector);

      await waitFor(() => {
        expect(screen.getByText('Wake County')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wake County'));

      await waitFor(() => {
        expect(mockApi.getCountyDetails).toHaveBeenCalled();
      });

      // Check risk score is displayed
      expect(screen.getByText('68')).toBeInTheDocument();
      expect(screen.getByText('Agricultural Resilience Score')).toBeInTheDocument();
    });

    it('shows disaster risks for selected county', async () => {
      const user = userEvent.setup();
      render(<Agriculture />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      const countySelector = screen.getByRole('button');
      await user.click(countySelector);

      await waitFor(() => {
        expect(screen.getByText('Wake County')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wake County'));

      await waitFor(() => {
        expect(mockApi.getCountyDetails).toHaveBeenCalled();
      });

      // Check disaster risks are shown
      expect(screen.getByText(/Check Disaster Risks/)).toBeInTheDocument();
    });

    it('provides access to assessment wizard', async () => {
      const user = userEvent.setup();
      render(<Agriculture />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      const countySelector = screen.getByRole('button');
      await user.click(countySelector);

      await waitFor(() => {
        expect(screen.getByText('Wake County')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wake County'));

      await waitFor(() => {
        expect(mockApi.getCountyDetails).toHaveBeenCalled();
      });

      // Check assessment wizard button is available
      expect(screen.getByText(/Start Personal Agricultural Assessment/)).toBeInTheDocument();
    });
  });

  describe('Business User Flow', () => {
    it('loads business page with appropriate language', async () => {
      render(<Business />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalledWith('small-business', 5);
      });

      expect(screen.getByText('Small Business Resilience Platform')).toBeInTheDocument();
      expect(screen.getByText(/business/)).toBeInTheDocument();
    });

    it('provides business-specific assessment workflow', async () => {
      const user = userEvent.setup();
      render(<Business />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      const countySelector = screen.getByRole('button');
      await user.click(countySelector);

      await waitFor(() => {
        expect(screen.getByText('Wake County')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wake County'));

      await waitFor(() => {
        expect(mockApi.getCountyDetails).toHaveBeenCalled();
      });

      expect(screen.getByText(/Start Personal Business Assessment/)).toBeInTheDocument();
    });
  });

  describe('Error Handling Flows', () => {
    it('handles API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.getStatistics.mockRejectedValue(new Error('API Error'));

      render(<Home />);

      // Should still render the page even with API errors
      expect(screen.getByText('NC Resilience Platform')).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('displays error state when county data fails to load', async () => {
      const user = userEvent.setup();
      mockApi.getCountyDetails.mockRejectedValue(new Error('County data unavailable'));

      render(<Agriculture />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      const countySelector = screen.getByRole('button');
      await user.click(countySelector);

      await waitFor(() => {
        expect(screen.getByText('Wake County')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wake County'));

      await waitFor(() => {
        expect(screen.getByText(/Unable to Load County Data/)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders mobile-friendly layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Home />);

      expect(screen.getByText('NC Resilience Platform')).toBeInTheDocument();
      // Mobile layout should still be functional
      expect(screen.getByText('Get Started →')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<Home />);

      // Check for proper semantic elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main content
      
      // Check for accessible navigation
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Agriculture />);

      await waitFor(() => {
        expect(mockApi.getRankings).toHaveBeenCalled();
      });

      // Tab to county selector and open with Enter
      const countySelector = screen.getByRole('button');
      countySelector.focus();
      await user.keyboard('{Enter}');

      // Should open dropdown
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });
});