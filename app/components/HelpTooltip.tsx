'use client';

import { useState } from 'react';

interface HelpTooltipProps {
  title: string;
  description: string;
  detailed?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTooltip({ 
  title, 
  description, 
  detailed, 
  position = 'top' 
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800'
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={`Help for ${title}`}
      >
        ?
      </button>
      
      {isOpen && (
        <div className={`absolute z-50 ${positionClasses[position]} w-80 max-w-sm`}>
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
            <div className="text-sm font-semibold mb-2 text-blue-200">{title}</div>
            <div className="text-sm mb-2 leading-relaxed">{description}</div>
            {detailed && (
              <div className="text-xs text-gray-300 leading-relaxed border-t border-gray-600 pt-2">
                <strong>More Details:</strong> {detailed}
              </div>
            )}
          </div>
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
}