import React, { useState, useEffect } from 'react';
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
import Bags from './pages/Bags.tsx';

interface OrganizationAppProps {
  onLogout: () => void;
}

export const OrganizationApp: React.FC<OrganizationAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('activeTab') || 'dashboard';
  });
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleNavigation = (tab: string, params?: {invoiceId?: string}) => {
    if (tab === 'invoice-details' && params?.invoiceId) {
      setInvoiceId(params.invoiceId);
      setActiveTab('invoice-details');
    } else {
      setActiveTab(tab);
      setInvoiceId(null);
    }
    sessionStorage.setItem('activeTab', tab);
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
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onLogout={onLogout} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};