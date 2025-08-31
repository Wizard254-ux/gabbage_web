import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { organizationService } from '../../shared/services/services/organizationService';
import { handleApiError } from '../../shared/utils/errorHandler';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

interface LoadingStates {
  counts: boolean;
  greeting: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalClients: 0,
    totalRoutes: 0,
    activeDrivers: 0,
    activeClients: 0,
  });
  const [loading, setLoading] = useState<LoadingStates>({
    counts: true,
    greeting: false
  });
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('🚀 Dashboard: Starting to fetch optimized dashboard data...');
    setError(null);
    
    try {
      // Fetch counts from optimized endpoint
      const countsResponse = await organizationService.getDashboardCounts();
      
      if (countsResponse.data.status) {
        const countsData = countsResponse.data.data;
        setStats({
          totalDrivers: countsData.totalDrivers || 0,
          totalClients: countsData.totalClients || 0,
          totalRoutes: countsData.totalRoutes || 0,
          activeDrivers: countsData.activeDrivers || 0,
          activeClients: countsData.activeClients || 0,
        });
      } else {
        throw new Error('Failed to fetch dashboard counts');
      }
    } catch (error: any) {
      console.error("❌ Dashboard: Failed to fetch dashboard data:", error);
      // @ts-expect-error - organizationService
      handleApiError(error, (message) => {
        setError(message);
        setShowErrorModal(true);
      });
    } finally {
      setLoading(prev => ({ ...prev, counts: false }));
      console.log('🏁 Dashboard: Dashboard data fetching completed');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Component for loading skeleton
  const StatsCardSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  // Show error state if there's an error
  if (error && loading.counts) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Failed to load dashboard</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {admin?.data?.user?.name}!
        </h2>
        <p className="text-gray-600 mt-2">Here's what's happening with your organization today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {loading.counts ? (
          <StatsCardSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Drivers</p>
                <p className="text-3xl font-bold">{stats.totalDrivers}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {loading.counts ? (
          <StatsCardSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p>Total Clients</p>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {loading.counts ? (
          <StatsCardSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Routes</p>
                <p className="text-3xl font-bold">{stats.totalRoutes}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {loading.counts ? (
          <StatsCardSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Active Drivers</p>
                <p className="text-3xl font-bold">{stats.activeDrivers}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {loading.counts ? (
          <StatsCardSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100">Active Clients</p>
                <p className="text-3xl font-bold">{stats.activeClients}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Ready to help</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => onNavigate?.('drivers')}
            className="group flex items-center space-x-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Add New Driver</p>
              <p className="text-sm text-gray-500">Register a new driver</p>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate?.('clients')}
            className="group flex items-center space-x-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Add New Client</p>
              <p className="text-sm text-gray-500">Register a new client</p>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate?.('routes')}
            className="group flex items-center space-x-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Create New Route</p>
              <p className="text-sm text-gray-500">Design a collection route</p>
            </div>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">System Online</p>
              <p className="text-sm text-gray-500">All services operational</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Database Connected</p>
              <p className="text-sm text-gray-500">Data sync active</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Secure Connection</p>
              <p className="text-sm text-gray-500">SSL encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Error</h3>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  fetchDashboardData();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};