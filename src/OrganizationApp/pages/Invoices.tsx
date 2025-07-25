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

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');

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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePageChange = (page: number) => {
    fetchInvoices(page);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setAccountNumber('');
    fetchInvoices(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          Filter Invoices
        </div>
        <div className="p-4">
          <form onSubmit={handleFilterSubmit}>
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

      <div className="bg-white rounded-lg shadow">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          Invoice List
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <InvoiceTable 
              invoices={invoices} 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {invoices.length} of {pagination.totalInvoices} invoices
        </div>
      </div>
    </div>
  );
};

