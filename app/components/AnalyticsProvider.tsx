'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics } from '../lib/analytics';
import { usePathname } from 'next/navigation';

type EntityType = 'agriculture' | 'small-business';

interface AnalyticsContextType {
  trackPageView: (page: string, county?: string, entityType?: EntityType) => void;
  trackCountySelection: (countyFips: string, countyName: string, entityType: EntityType) => void;
  trackAssessmentStart: (countyFips: string, entityType: EntityType) => void;
  trackAssessmentComplete: (countyFips: string, entityType: EntityType, score: number) => void;
  trackProgramView: (programType: string, countyFips: string, entityType: EntityType) => void;
  trackCrisisModeActivation: (countyFips: string, entityType: EntityType) => void;
  trackInsuranceClaimGeneration: (countyFips: string, entityType: EntityType, claimType: string) => void;
  trackDamageAssessment: (countyFips: string, entityType: EntityType, damageLevel: string) => void;
  trackPDFDownload: (reportType: string, countyFips: string, entityType: EntityType) => void;
  trackFeatureUsage: (feature: string, context?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  // Automatically track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      analytics.trackPageView(pathname);
    }
  }, [pathname]);

  const contextValue: AnalyticsContextType = {
    trackPageView: (page: string, county?: string, entityType?: EntityType) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackPageView(page, county, entityType);
      }
    },
    trackCountySelection: (countyFips: string, countyName: string, entityType: EntityType) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackCountySelection(countyFips, countyName, entityType);
      }
    },
    trackAssessmentStart: (countyFips: string, entityType: EntityType) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackAssessmentStart(countyFips, entityType);
      }
    },
    trackAssessmentComplete: (countyFips: string, entityType: EntityType, score: number) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackAssessmentComplete(countyFips, entityType, score);
      }
    },
    trackProgramView: (programType: string, countyFips: string, entityType: EntityType) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackProgramView(programType, countyFips, entityType);
      }
    },
    trackCrisisModeActivation: (countyFips: string, entityType: EntityType) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackCrisisModeActivation(countyFips, entityType);
      }
    },
    trackInsuranceClaimGeneration: (countyFips: string, entityType: EntityType, claimType: string) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackInsuranceClaimGeneration(countyFips, entityType, claimType);
      }
    },
    trackDamageAssessment: (countyFips: string, entityType: EntityType, damageLevel: string) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackDamageAssessment(countyFips, entityType, damageLevel);
      }
    },
    trackPDFDownload: (reportType: string, countyFips: string, entityType: EntityType) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackPDFDownload(reportType, countyFips, entityType);
      }
    },
    trackFeatureUsage: (feature: string, context?: Record<string, any>) => {
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackFeatureUsage(feature, context);
      }
    },
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}