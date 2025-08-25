import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './AdminApp/components/Login';
import { AdminApp } from './AdminApp/AdminApp';
import { OrganizationApp } from './OrganizationApp/OrganizationApp';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, admin } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  // Route based on user role
  switch (admin?.data?.user?.role) {
    case 'admin':
      return <AdminApp onLogout={logout} />;
    case 'organization':
      return <OrganizationApp onLogout={logout} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">Your role does not have access to this application.</p>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      );
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App