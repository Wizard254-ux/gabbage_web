import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services/organizationService';
import { InvoiceTable } from '../components/InvoiceTable';
import { AgingSummaryTable } from '../components/AgingSummaryTable';

interface Invoice {
  _id: string;
  id: string;
  invoiceNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  user: {
    name: string;
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
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalInvoices: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AgingBucket {
  range: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

interface AgingSummary {
  totalUnpaidAmount: number;
  totalInvoices: number;
  overdueCount: number;
  overdueAmount: number;
  dueCount: number;
  dueAmount: number;
  agingBuckets: AgingBucket[];
  gracePeriodDays: number;
  message?: string;
}

interface InvoicesProps {
  onNavigate?: (tab: string, params?: { invoiceId?: string }) => void;
}

export const Invoices: React.FC<InvoicesProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'aging'>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agingSummary, setAgingSummary] = useState<AgingSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    hasNext: false,
    hasPrev: false
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingInvoices, setExportingInvoices] = useState<boolean>(false);
  const [exportingAging, setExportingAging] = useState<boolean>(false);
  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);
  
  // Filter states for all invoices
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');

  const fetchInvoices = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      
      // Add filters if they exist
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (accountNumber) params.accountNumber = accountNumber;
      
      const response = await organizationService.getAllInvoices(params);
      console.log(response.data.data)
      
      if (response.data.success) {
        setInvoices(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching invoices';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAgingSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizationService.getAgingSummary({});
      
      if (response.data.success) {
        setAgingSummary(response.data.summary);
      } else {
        setError('Failed to fetch aging summary');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching aging summary';
      setError(errorMessage);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showExportDropdown && !target.closest('.relative')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const handlePageChange = (page: number) => {
    if (activeTab === 'all') {
      fetchInvoices(page);
    } else {
      fetchAgingSummary();
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'all') {
      fetchInvoices(1);
    } else {
      fetchAgingSummary();
    }
  };

  const handleClearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setAccountNumber('');
    fetchInvoices(1);
  };

  const handleExportInvoices = async () => {
    setExportingInvoices(true);
    try {
      const params: Record<string, string> = {};
      
      // Add filters if they exist
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (accountNumber) params.accountNumber = accountNumber;
      
      const response = await organizationService.exportInvoices(params);
      
      // Create and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export invoices:', error);
      alert('Failed to export invoices. Please try again.');
    } finally {
      setExportingInvoices(false);
    }
  };

  const handleExportAgingSummary = async (format: 'csv' | 'pdf') => {
    setExportingAging(true);
    try {
      const params: Record<string, string> = { format };
      
      let response;
      let blob;
      let filename;
      
      if (format === 'csv') {
        response = await organizationService.exportAgingSummary(params);
        blob = new Blob([response.data], { type: 'text/csv' });
        filename = `aging_summary_${new Date().getTime()}.csv`;
      } else {
        // For PDF export, we'll generate it client-side using the aging summary data
        response = await generateAgingSummaryPDF(agingSummary);
        blob = response;
        filename = `aging_summary_report_${new Date().getTime()}.txt`;
      }
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowExportDropdown(false);
    } catch (error) {
      console.error(`Failed to export aging summary as ${format.toUpperCase()}:`, error);
      alert(`Failed to export aging summary as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportingAging(false);
    }
  };

  const generateAgingSummaryPDF = async (summary: AgingSummary | null): Promise<Blob> => {
    if (!summary) {
      throw new Error('No aging summary data available');
    }

    // Create CSV data for aging summary buckets
    const csvData = [
      'Age Range,Count,Amount Outstanding,Percentage of Total',
      ...summary.agingBuckets.map(bucket => 
        `"${bucket.range}",${bucket.count},"KES ${bucket.totalAmount.toLocaleString()}",${bucket.percentage.toFixed(1)}%`
      ),
      `"Total Outstanding",${summary.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0)},"KES ${summary.totalUnpaidAmount.toLocaleString()}",100.0%`
    ].join('\n');

    // Add summary information at the top
    const summaryInfo = [
      'Aging Summary Report',
      `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      '',
      'Summary Statistics:',
      `Total Overdue Invoices: ${summary.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0)}`,
      `Total Outstanding Amount: KES ${summary.totalUnpaidAmount.toLocaleString()}`,
      `Average Outstanding: KES ${summary.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0) > 0 ? Math.round(summary.totalUnpaidAmount / summary.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0)).toLocaleString() : '0'}`,
      '',
      'Age Bucket Breakdown:',
      ''
    ].join('\n');

    const footerInfo = [
      '',
      'Notes:',
      summary.message || `Aging calculation starts after ${summary.gracePeriodDays}-day grace period from due date`
    ].join('\n');

    const fullContent = summaryInfo + csvData + footerInfo;

    // Create a structured text blob that represents the PDF content
    const pdfBlob = new Blob([fullContent], { type: 'text/plain' });
    
    return pdfBlob;
  };

  const handleViewInvoice = (invoiceId: string) => {
    if (onNavigate) {
      onNavigate('invoice-details', { invoiceId });
    }
  };

  return (
    <div className="p-6">
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
      
      {/* Export Section - Only show on Aging Summary tab */}
      {activeTab === 'aging' && (
        <div className="mb-6 flex justify-end">
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={exportingAging || !agingSummary}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exportingAging ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Aging Summary
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
            
            {showExportDropdown && !exportingAging && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExportAgingSummary('csv')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExportAgingSummary('pdf')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Export as Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aging Summary Table */}
      {activeTab === 'aging' && (
        <AgingSummaryTable 
          summary={agingSummary}
        />
      )}
      
      {/* Filter Section - Only show on All Invoices tab */}
      {activeTab === 'all' && (
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
      )}

      {/* Export Section - Only show on All Invoices tab */}
      {activeTab === 'all' && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleExportInvoices}
            disabled={exportingInvoices}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exportingInvoices ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Invoices
              </>
            )}
          </button>
        </div>
      )}

      {/* Invoice Table - Only show on All Invoices tab */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-lg shadow">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
            All Invoices
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
                showAgingInfo={false}
                onViewInvoice={handleViewInvoice}
              />
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            Showing {invoices.length} of {pagination.totalInvoices} invoices
          </div>
        </div>
      )}
    </div>
  );
};

