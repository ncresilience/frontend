import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountySelector from '../CountySelector';
import { api } from '../../lib/api';

// Mock the API
jest.mock('../../lib/api');
jest.mock('../../lib/analytics');

const mockApi = api as jest.Mocked<typeof api>;

const mockCounties = [
  { fips_code: '37183', name: 'Wake County', population: '1129410', area_sq_miles: '857.14' },
  { fips_code: '37119', name: 'Mecklenburg County', population: '1115482', area_sq_miles: '546.35' },
  { fips_code: '37067', name: 'Forsyth County', population: '382590', area_sq_miles: '413.43' },
];

describe('CountySelector Component', () => {
  const mockOnCountySelect = jest.fn();

  beforeEach(() => {
    mockApi.getCounties.mockResolvedValue(mockCounties);
    mockOnCountySelect.mockClear();
  });

  it('renders loading state initially', async () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
  });

  it('loads and displays counties after loading', async () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    // Click to open dropdown
    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Wake County')).toBeInTheDocument();
      expect(screen.getByText('Mecklenburg County')).toBeInTheDocument();
      expect(screen.getByText('Forsyth County')).toBeInTheDocument();
    });
  });

  it('filters counties based on search input', async () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    // Click to open dropdown
    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    // Type to search
    const searchInput = screen.getByRole('textbox');
    await userEvent.type(searchInput, 'Wake');

    await waitFor(() => {
      expect(screen.getByText('Wake County')).toBeInTheDocument();
      expect(screen.queryByText('Mecklenburg County')).not.toBeInTheDocument();
      expect(screen.queryByText('Forsyth County')).not.toBeInTheDocument();
    });
  });

  it('filters counties by FIPS code', async () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    const searchInput = screen.getByRole('textbox');
    await userEvent.type(searchInput, '37183');

    await waitFor(() => {
      expect(screen.getByText('Wake County')).toBeInTheDocument();
      expect(screen.queryByText('Mecklenburg County')).not.toBeInTheDocument();
    });
  });

  it('calls onCountySelect when a county is selected', async () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    const wakeCountyOption = await screen.findByText('Wake County');
    await userEvent.click(wakeCountyOption);

    expect(mockOnCountySelect).toHaveBeenCalledWith(mockCounties[0]);
  });

  it('displays selected county in the input', () => {
    const selectedCounty = mockCounties[0];
    
    render(
      <CountySelector
        selectedCounty={selectedCounty}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    expect(screen.getByDisplayValue('Wake County')).toBeInTheDocument();
  });

  it('closes dropdown after county selection', async () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    const wakeCountyOption = await screen.findByText('Wake County');
    await userEvent.click(wakeCountyOption);

    await waitFor(() => {
      expect(screen.queryByText('Mecklenburg County')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApi.getCounties.mockRejectedValue(new Error('API Error'));

    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    // Should still render the component even if API fails
    expect(screen.getByRole('button')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('sorts counties alphabetically', async () => {
    const unsortedCounties = [
      { fips_code: '37067', name: 'Forsyth County', population: '382590', area_sq_miles: '413.43' },
      { fips_code: '37183', name: 'Wake County', population: '1129410', area_sq_miles: '857.14' },
      { fips_code: '37119', name: 'Mecklenburg County', population: '1115482', area_sq_miles: '546.35' },
    ];

    mockApi.getCounties.mockResolvedValue(unsortedCounties);

    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    const options = await screen.findAllByRole('option');
    
    // Should be sorted: Forsyth, Mecklenburg, Wake
    expect(options[0]).toHaveTextContent('Forsyth County');
    expect(options[1]).toHaveTextContent('Mecklenburg County');
    expect(options[2]).toHaveTextContent('Wake County');
  });

  it('tracks analytics when county is selected', async () => {
    const { useAnalytics } = require('../../lib/analytics');
    const mockTrackCountySelection = jest.fn();
    
    useAnalytics.mockReturnValue({
      trackCountySelection: mockTrackCountySelection
    });

    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        entityType="agriculture"
      />
    );

    await waitFor(() => {
      expect(mockApi.getCounties).toHaveBeenCalled();
    });

    const selectButton = screen.getByRole('button');
    await userEvent.click(selectButton);

    const wakeCountyOption = await screen.findByText('Wake County');
    await userEvent.click(wakeCountyOption);

    expect(mockTrackCountySelection).toHaveBeenCalledWith('37183', 'Wake County', 'agriculture');
  });

  it('applies custom className', () => {
    render(
      <CountySelector
        selectedCounty={null}
        onCountySelect={mockOnCountySelect}
        className="custom-class"
        entityType="agriculture"
      />
    );

    const container = screen.getByRole('button').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});