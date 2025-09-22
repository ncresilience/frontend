'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { performanceMonitor, lazyImageLoader, cleanupPerformanceMonitoring } from '@/lib/performance';

interface PerformanceContextType {
  trackCustomMetric: (name: string, value: number, metadata?: Record<string, any>) => void;
  preloadResource: (href: string, as?: string) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Performance monitoring is automatically initialized
    // Cleanup on unmount
    return () => {
      cleanupPerformanceMonitoring();
    };
  }, []);

  const trackCustomMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    // Custom metric tracking through analytics
    if (typeof window !== 'undefined') {
      import('@/lib/analytics').then(({ analytics }) => {
        analytics.trackPerformance(name, value, metadata);
      });
    }
  };

  const preloadResource = (href: string, as: string = 'fetch') => {
    if (typeof window !== 'undefined') {
      import('@/lib/performance').then(({ preloadResource: preload }) => {
        preload(href, as);
      });
    }
  };

  return (
    <PerformanceContext.Provider value={{ trackCustomMetric, preloadResource }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// Hook for lazy loading images
export function useLazyImage() {
  const observeImage = (img: HTMLImageElement) => {
    lazyImageLoader.observe(img);
  };

  return { observeImage };
}