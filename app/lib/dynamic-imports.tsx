'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary for dynamic imports
const DynamicImportError = () => (
  <div className="flex items-center justify-center min-h-[200px] text-red-600">
    <p>Failed to load component. Please refresh the page.</p>
  </div>
);

// Admin Analytics Dashboard - Large component, load on demand
export const AdminAnalyticsDashboard = dynamic(
  () => import('../components/AdminAnalyticsDashboard'),
  {
    loading: LoadingSpinner,
    ssr: false // Admin dashboard doesn't need SSR
  }
);

// Risk Assessment Form - Load when user navigates to assessment
export const RiskAssessmentForm = dynamic(
  () => import('../components/RiskWizard'),
  {
    loading: LoadingSpinner,
    ssr: true // SEO important for assessment pages
  }
);

// Map Components - Heavy dependency, load when needed
export const CountyMap = dynamic(
  () => import('../components/InteractiveMap'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
    ssr: false // Maps usually don't work well with SSR
  }
);

// Crisis Response Components - Load only during crisis mode
export const CrisisResponsePanel = dynamic(
  () => import('../components/CrisisMode'),
  {
    loading: LoadingSpinner,
    ssr: false // Crisis mode is real-time, no SSR needed
  }
);

export const DamageAssessmentForm = dynamic(
  () => import('../components/DamageAssessmentForm'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

// Government Program Components - Load when user accesses programs
export const ProgramMatchingResults = dynamic(
  () => import('../components/ProgramMatcher'),
  {
    loading: LoadingSpinner,
    ssr: true // SEO important for program discovery
  }
);

// Charts and Data Visualization - Load when needed
export const ImpactDashboard = dynamic(
  () => import('../components/ImpactDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    ),
    ssr: false // Charts don't need SSR
  }
);

// Performance monitoring - using existing optimized image
export const OptimizedImage = dynamic(
  () => import('../components/OptimizedImage'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

// Route-based code splitting helpers
export const loadRouteComponent = (componentName: string) => {
  const componentMap = {
    'agriculture': () => import('../agriculture/page'),
    'business': () => import('../business/page')
  };

  const loader = componentMap[componentName as keyof typeof componentMap];
  
  if (!loader) {
    return Promise.reject(new Error(`Component ${componentName} not found`));
  }

  return loader();
};

// Preload components for better UX
export const preloadComponent = (componentName: string) => {
  if (typeof window !== 'undefined') {
    const componentMap = {
      'AdminAnalyticsDashboard': () => import('../components/AdminAnalyticsDashboard'),
      'InteractiveMap': () => import('../components/InteractiveMap'),
      'CrisisMode': () => import('../components/CrisisMode'),
      'ProgramMatcher': () => import('../components/ProgramMatcher'),
      'ImpactDashboard': () => import('../components/ImpactDashboard')
    };

    const loader = componentMap[componentName as keyof typeof componentMap];
    if (loader) {
      loader().catch(console.error);
    }
  }
};

// Bundle size analysis helper
export const getBundleInfo = () => {
  if (typeof window !== 'undefined') {
    return {
      'Main Bundle': 'Contains core app functionality',
      'Admin Bundle': 'Analytics dashboard and admin tools',
      'Assessment Bundle': 'Risk assessment forms and calculations',
      'Map Bundle': 'Interactive county maps and visualizations',
      'Crisis Bundle': 'Emergency response components',
      'Charts Bundle': 'Data visualization and charts',
      'Programs Bundle': 'Government program matching'
    };
  }
  return {};
};