'use client';

import { useState } from 'react';

interface ExplanationPanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  importance?: 'high' | 'medium' | 'low';
}

export default function ExplanationPanel({ 
  title, 
  children, 
  defaultOpen = false,
  importance = 'medium' 
}: ExplanationPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const importanceColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-blue-200 bg-blue-50',
    low: 'border-gray-200 bg-gray-50'
  };

  const iconColors = {
    high: 'text-red-600',
    medium: 'text-blue-600',
    low: 'text-gray-600'
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${importanceColors[importance]}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
      >
        <div className="flex items-center">
          <div className={`w-6 h-6 mr-3 ${iconColors[importance]}`}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} ${iconColors[importance]}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="mt-4 text-gray-700 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}