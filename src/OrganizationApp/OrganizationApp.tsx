import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Drivers } from './pages/Drivers';
import { Clients } from './pages/Clients';
import { Routes as RoutesPage } from './pages/Routes';
import { Payments } from './pages/Payments';
import { Invoices } from './pages/Invoices';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Pickups } from './pages/Pickups';
import Bags from './pages/Bags.tsx';

interface OrganizationAppProps {
  onLogout: () => void;
}

export const OrganizationApp: React.FC<OrganizationAppProps> = ({ onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar 
        currentPath={location.pathname}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onLogout={onLogout} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/drivers" element={<Drivers />} />
            <Route path="dashboard/clients" element={<Clients />} />
            <Route path="dashboard/routes" element={<RoutesPage />} />
            <Route path="dashboard/payments" element={<Payments />} />
            <Route path="dashboard/invoices" element={<Invoices />} />
            <Route path="dashboard/invoices/:invoiceId" element={<InvoiceDetails />} />
            <Route path="dashboard/pickups" element={<Pickups />} />
            <Route path="dashboard/bags" element={<Bags />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};