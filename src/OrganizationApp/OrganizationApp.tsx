import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Drivers } from './pages/Drivers';
import { Clients } from './pages/Clients';
import { Routes } from './pages/Routes';
import { Payments } from './pages/Payments';
import { Invoices } from './pages/Invoices';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Pickups } from './pages/Pickups';
import Bags from './pages/Bags';

interface OrganizationAppProps {
  onLogout: () => void;
}

export const OrganizationApp: React.FC<OrganizationAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const handleNavigation = (tab: string, params?: any) => {
    if (tab === 'invoice-details' && params?.invoiceId) {
      setInvoiceId(params.invoiceId);
      setActiveTab('invoice-details');
    } else {
      setActiveTab(tab);
      setInvoiceId(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'drivers':
        return <Drivers />;
      case 'clients':
        return <Clients />;
      case 'routes':
        return <Routes />;
      case 'payments':
        return <Payments />;
      case 'invoices':
        return <Invoices onNavigate={handleNavigation} />;
      case 'invoice-details':
        return <InvoiceDetails invoiceId={invoiceId} onNavigate={handleNavigation} />;
      case 'pickups':
        return <Pickups />;
      case 'bags':
        return <Bags />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
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