import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Drivers } from './pages/Drivers';
import { Clients } from './pages/Clients';
import { Routes } from './pages/Routes';
import { Payments } from './pages/Payments';

interface OrganizationAppProps {
  onLogout: () => void;
}

export const OrganizationApp: React.FC<OrganizationAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'drivers':
        return <Drivers />;
      case 'clients':
        return <Clients />;
      case 'routes':
        return <Routes />;
      case 'payments':
        return <Payments />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onLogout={onLogout} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <div className="w-full max-w-none">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};