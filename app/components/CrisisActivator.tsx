'use client';

import { useState } from 'react';

interface CrisisActivatorProps {
  onActivateCrisis: () => void;
  county?: string;
}

export default function CrisisActivator({ onActivateCrisis, county }: CrisisActivatorProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleActivate = () => {
    setShowConfirm(false);
    onActivateCrisis();
  };

  return (
    <>
      {/* Crisis Activation Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-40 transition-all duration-200 hover:scale-105"
        title="Activate Crisis Response Mode"
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
            !
          </div>
          <span className="hidden sm:inline font-medium">Emergency Mode</span>
        </div>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                !
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activate Crisis Response Mode?</h3>
              <p className="text-gray-600 mb-6">
                This will switch to emergency mode with real-time alerts, emergency resources, 
                and crisis management tools for {county || 'your area'}.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    !
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-yellow-800 mb-1">Important</div>
                    <div className="text-sm text-yellow-700">
                      If you are in immediate danger, call 911 immediately. 
                      This tool provides general emergency information and resources.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Activate Crisis Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}