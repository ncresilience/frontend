'use client';

import { useState, useEffect } from 'react';
import { County } from '../types';
import { api } from '../lib/api';
import { useAnalytics } from '../lib/analytics';

interface CountySelectorProps {
  selectedCounty: County | null;
  onCountySelect: (county: County) => void;
  className?: string;
  entityType?: 'agriculture' | 'small-business';
}

export default function CountySelector({ selectedCounty, onCountySelect, className = '', entityType }: CountySelectorProps) {
  const [counties, setCounties] = useState<County[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    async function loadCounties() {
      try {
        const data = await api.getCounties();
        setCounties(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load counties:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCounties();
  }, []);

  const filteredCounties = counties.filter(county =>
    county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    county.fips_code.includes(searchTerm)
  );

  const handleCountySelect = (county: County) => {
    // Track county selection for analytics
    if (entityType) {
      analytics.trackCountySelection(county.fips_code, county.name, entityType);
    }
    
    onCountySelect(county);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div>
              {selectedCounty ? (
                <div>
                  <span className="font-medium text-gray-900">{selectedCounty.name} County</span>
                  <span className="ml-2 text-sm text-gray-500">({selectedCounty.fips_code})</span>
                  {selectedCounty.population && (
                    <div className="text-sm text-gray-600">
                      Pop: {parseInt(selectedCounty.population).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">Select a North Carolina county...</span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search counties..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCounties.length > 0 ? (
                filteredCounties.map((county) => (
                  <button
                    key={county.fips_code}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    onClick={() => handleCountySelect(county)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{county.name} County</div>
                        <div className="text-sm text-gray-500">FIPS: {county.fips_code}</div>
                      </div>
                      {county.population && (
                        <div className="text-sm text-gray-600">
                          {parseInt(county.population).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No counties found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}