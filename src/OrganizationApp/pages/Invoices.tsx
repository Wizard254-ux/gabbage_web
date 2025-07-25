import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services/organizationService';
import { InvoiceTable } from '../components/InvoiceTable';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  accountNumber: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  status: string;
  paymentStatus?: string;
  dueStatus?: string;
  dueDate: string;
  issuedDate: string;
  billingPeriod: {
    start: string;
    end: string;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalInvoices: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AgingSummary {
  totalUnpaidAmount: number;
  totalInvoices: number;
  overdueCount: number;
  overdueAmount: number;
  dueCount: number;
  dueAmount: number;
}

export const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'aging'>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agingInvoices, setAgingInvoices] = useState<Invoice[]>([]);
  const [agingSummary, setAgingSummary] = useState<AgingSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    hasNext: false,
    hasPrev: false
  });
  const [agingPagination, setAgingPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states for all invoices
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  
  // Filter states for aging summary
  const [agingPaymentStatus, setAgingPaymentStatus] = useState<string>('');
  const [agingDueStatus, setAgingDueStatus] = useState<string>('');
  const [agingStartDate, setAgingStartDate] = useState<string>('');
  const [agingEndDate, setAgingEndDate] = useState<string>('');
  const [agingAccountNumber, setAgingAccountNumber] = useState<string>('');

  const fetchInvoices = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { page, limit: 10 };
      
      // Add filters if they exist
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (accountNumber) params.accountNumber = accountNumber;
      
      const response = await organizationService.getAllInvoices(params);
      
      if (response.data.success) {
        setInvoices(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching invoices');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAgingSummary = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { page, limit: 10 };
      
      // Add filters if they exist
      if (agingPaymentStatus) params.paymentStatus = agingPaymentStatus;
      if (agingDueStatus) params.dueStatus = agingDueStatus;
      if (agingStartDate) params.startDate = agingStartDate;
      if (agingEndDate) params.endDate = agingEndDate;
      if (agingAccountNumber) params.accountNumber = agingAccountNumber;
      
      const response = await organizationService.getAgingSummary(params);
      
      if (response.data.success) {
        setAgingInvoices(response.data.data);
        setAgingSummary(response.data.summary);
        setAgingPagination(response.data.pagination);
      } else {
        setError('Failed to fetch aging summary');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching aging summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      fetchInvoices();
    } else {
      fetchAgingSummary();
    }
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    if (activeTab === 'all') {
      fetchInvoices(page);
    } else {
      fetchAgingSummary(page);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'all') {
      fetchInvoices(1);
    } else {
      fetchAgingSummary(1);
    }
  };

  const handleClearFilters = () => {
    if (activeTab === 'all') {
      setStatus('');
      setStartDate('');
      setEndDate('');
      setAccountNumber('');
      fetchInvoices(1);
    } else {
      setAgingPaymentStatus('');
      setAgingDueStatus('');
      setAgingStartDate('');
      setAgingEndDate('');
      setAgingAccountNumber('');
      fetchAgingSummary(1);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Invoices
          </button>
          <button
            onClick={() => setActiveTab('aging')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'aging'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aging Summary
          </button>
        </nav>
      </div>
      
      {/* Aging Summary Statistics */}
      {activeTab === 'aging' && agingSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Outstanding</div>
            <div className="text-2xl font-bold text-red-600">KSH {agingSummary.totalUnpaidAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{agingSummary.totalInvoices} invoices</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Overdue</div>
            <div className="text-2xl font-bold text-red-700">KSH {agingSummary.overdueAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{agingSummary.overdueCount} invoices</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Due (Grace Period)</div>
            <div className="text-2xl font-bold text-yellow-600">KSH {agingSummary.dueAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{agingSummary.dueCount} invoices</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Average Outstanding</div>
            <div className="text-2xl font-bold text-blue-600">
              KSH {agingSummary.totalInvoices > 0 ? Math.round(agingSummary.totalUnpaidAmount / agingSummary.totalInvoices).toLocaleString() : '0'}
            </div>
            <div className="text-sm text-gray-500">per invoice</div>
          </div>
        </div>
      )}
      
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          Filter {activeTab === 'all' ? 'Invoices' : 'Aging Summary'}
        </div>
        <div className="p-4">
          <form onSubmit={handleFilterSubmit}>
            {activeTab === 'all' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="fully_paid">Fully Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="due">Due (Grace Period)</option>
                    <option value="overdue">Overdue</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input 
                    type="text" 
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. RES158009"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select 
                    value={agingPaymentStatus} 
                    onChange={(e) => setAgingPaymentStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Payment Status</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Status</label>
                  <select 
                    value={agingDueStatus} 
                    onChange={(e) => setAgingDueStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Due Status</option>
                    <option value="due">Due (Grace Period)</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date From</label>
                  <input 
                    type="date" 
                    value={agingStartDate} 
                    onChange={(e) => setAgingStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date To</label>
                  <input 
                    type="date" 
                    value={agingEndDate} 
                    onChange={(e) => setAgingEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input 
                    type="text" 
                    value={agingAccountNumber} 
                    onChange={(e) => setAgingAccountNumber(e.target.value)}
                    placeholder="e.g. RES158009"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
              <button 
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          {activeTab === 'all' ? 'All Invoices' : 'Outstanding Invoices (Aging Summary)'}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">Loading {activeTab === 'all' ? 'invoices' : 'aging summary'}...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <InvoiceTable 
              invoices={activeTab === 'all' ? invoices : agingInvoices} 
              currentPage={activeTab === 'all' ? pagination.currentPage : agingPagination.currentPage}
              totalPages={activeTab === 'all' ? pagination.totalPages : agingPagination.totalPages}
              onPageChange={handlePageChange}
              showAgingInfo={activeTab === 'aging'}
            />
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {activeTab === 'all' ? invoices.length : agingInvoices.length} of {activeTab === 'all' ? pagination.totalInvoices : agingPagination.totalInvoices} invoices
        </div>
      </div>
    </div>
  );
};

