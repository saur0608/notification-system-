import React from 'react';
import { Monitor, AlertCircle, Package, BarChart3, Zap } from 'lucide-react';

export function DesktopOnlyRestriction() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Desktop Only</h1>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-center text-gray-700 font-medium">
            MetaController is optimized for desktop and laptop computers.
          </p>

          {/* Monitor Icon */}
          <div className="flex justify-center">
            <div className="bg-blue-50 p-4 rounded-full">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Reasons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Complex Analytics & Charts
                </p>
                <p className="text-xs text-gray-600">
                  Real-time dashboards and visualizations work best on larger screens
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Performance & Responsiveness
                </p>
                <p className="text-xs text-gray-600">
                  Industrial control systems require precise input and high responsiveness
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Full Feature Access
                </p>
                <p className="text-xs text-gray-600">
                  All tools and controls are designed for desktop interface
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <a
              href="/"
              onClick={(e) => {
                // This is a placeholder - user would need to actually switch to desktop
                e.preventDefault();
                alert('Please switch to a desktop or laptop computer to access this application.');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition text-center block"
            >
              Refresh Page on Desktop
            </a>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-center text-gray-500 pt-2">
            This application is designed exclusively for desktop and tablet browsers with a minimum width of 1024px.
          </p>
        </div>
      </div>
    </div>
  );
}
