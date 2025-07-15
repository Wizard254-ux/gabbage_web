import React, { useState } from 'react';
import { OrganizationManagement } from './screens/OrganizationManagement';

type ActiveTab = 'organizations';

export const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('organizations');

  const renderContent = () => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationManagement />;
      default:
        return <OrganizationManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'organizations', label: 'Organizations' },
              { key: 'users', label: 'Users' },
              { key: 'routes', label: 'Routes' },
              { key: 'pickups', label: 'Pickups' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ActiveTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">
        {renderContent()}
      </main>
    </div>
  );
};