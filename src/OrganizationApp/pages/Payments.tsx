import React, { useState, useEffect } from 'react';
import { organizationService } from '../../services/organizationService';
import { PaymentHistoryTable } from '../components/PaymentHistoryTable';

interface Payment {
  _id: string;
  accountNumber: string;
  amount: number;
  paymentMethod: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

export const Payments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [exportingPayments, setExportingPayments] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    hasNext: false,
    hasPrev: false
  });
  const [activeView, setActiveView] = useState<'all' | 'search'>('all');
  
  // Fetch all payments on component mount
  useEffect(() => {
    fetchAllPayments(1);
  }, []);

  const [exportFormData, setExportFormData] = useState({
    format: 'csv' as 'csv' | 'excel' | 'pdf',
    startDate: '',
    endDate: '',
    accountNumber: '',
  });

  const fetchPaymentHistory = async (page = 1) => {
    if (!accountNumber) return;
    
    setLoading(true);
    try {
      const response = await organizationService.getPaymentHistory(accountNumber, {
        page,
        limit: itemsPerPage
      });
      console.log(response.data.payments)

      setPaymentHistory(response.data.payments || []);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNumber) {
      setActiveView('search');
      setCurrentPage(1);
      fetchPaymentHistory(1);
    }
  };

  const fetchAllPayments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await organizationService.getAllPaymentHistory({
        page,
        limit: itemsPerPage
      });
      
      if (response.data.success) {
        console.log(response.data)
        setPaymentHistory(response.data.data.payments || []);
        setPagination(response.data.data.pagination);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch all payments: API returned success=false');
      }
    } catch (error) {
      console.error('Failed to fetch all payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setExportingPayments(true);
    try {
      const response = await organizationService.exportPayments(exportFormData);
      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-export.${exportFormData.format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export payments:', error);
      alert('Failed to export payments');
    } finally {
      setExportingPayments(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <p className="text-gray-600 mt-1">Process payments and manage financial transactions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-white border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Payments</h3>
          </div>
          
          <form onSubmit={handleAccountSearch} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter Account Number (e.g., RES123456)"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              disabled={!accountNumber}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Filter</span>
            </button>
            {accountNumber && (
              <button
                type="button"
                onClick={() => {
                  setAccountNumber('');
                  setActiveView('all');
                  fetchAllPayments(1);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Payment History */}
      {(
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {activeView === 'search' ? `Payment History for ${accountNumber}` : 'All Payment History'}
              </h3>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="p-4">
              <PaymentHistoryTable
                payments={paymentHistory}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={activeView === 'search' ? fetchPaymentHistory : fetchAllPayments}
              />
            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Export Payments</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleExportPayments} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select
                  value={exportFormData.format}
                  onChange={(e) => setExportFormData({ ...exportFormData, format: e.target.value as 'csv' | 'excel' | 'pdf' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={exportFormData.startDate}
                  onChange={(e) => setExportFormData({ ...exportFormData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={exportFormData.endDate}
                  onChange={(e) => setExportFormData({ ...exportFormData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number (Optional)</label>
                <input
                  type="text"
                  value={exportFormData.accountNumber}
                  onChange={(e) => setExportFormData({ ...exportFormData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Leave blank for all accounts"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={exportingPayments}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exportingPayments ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    'Export'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  disabled={exportingPayments}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};