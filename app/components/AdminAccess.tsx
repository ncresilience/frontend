'use client';

import { useState, useEffect } from 'react';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';

export default function AdminAccess() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // Listen for admin access event from triple-click
  useEffect(() => {
    const handleAdminAccess = () => {
      if (!isAuthenticated) {
        setShowLogin(true);
      } else {
        setShowAnalytics(true);
      }
    };

    window.addEventListener('adminAccess', handleAdminAccess);
    return () => window.removeEventListener('adminAccess', handleAdminAccess);
  }, [isAuthenticated]);

  // Simple password check (in production, use proper authentication)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // You can change this password as needed
    if (password === 'nc-resilience-admin-2024') {
      setIsAuthenticated(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('Invalid password');
    }
  };

  // Triple-click to show login (hidden feature)
  const handleTripleClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setShowAnalytics(true);
    }
  };

  if (showAnalytics && isAuthenticated) {
    return <AdminAnalyticsDashboard onClose={() => setShowAnalytics(false)} />;
  }

  return (
    <>
      {/* Hidden admin access trigger - triple click the logo/title */}
      <div 
        onClickCapture={(e) => {
          if (e.detail === 3) { // Triple click
            handleTripleClick();
          }
        }}
        className="inline-block cursor-default"
      >
        {/* This component wraps around the main title/logo to provide hidden access */}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Admin Access</h3>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setPassword('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Toggle (only visible when authenticated) */}
      {isAuthenticated && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowAnalytics(true)}
            className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            title="Open Analytics Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}