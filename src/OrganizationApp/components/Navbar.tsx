import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onLogout: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout, setIsMobileMenuOpen }) => {
  const { admin } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
            <p className="text-gray-600">Manage your drivers, clients, and operations efficiently</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          {/*<button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">*/}
          {/*  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />*/}
          {/*  </svg>*/}
          {/*  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>*/}
          {/*</button>*/}
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            {/*<div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">*/}
            {/*  <span className="text-white font-semibold text-sm">*/}
            {/*    {admin?.data?.user?.name?.charAt(0).toUpperCase()}*/}
            {/*  </span>*/}
            {/*</div>*/}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{admin?.data?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{admin?.data?.user?.email}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          <button
            onClick={onLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};