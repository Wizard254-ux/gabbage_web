import React from 'react';
import { format } from 'date-fns';

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
  billingPeriodEnd:string,
  billingPeriodStart:string,
  id:string,
  user:any,

}

interface InvoiceTableProps {
  invoices: Invoice[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showAgingInfo?: boolean;
  onViewInvoice?: (invoiceId: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ 
  invoices, 
  currentPage, 
  totalPages, 
  onPageChange,
  showAgingInfo = false,
  onViewInvoice
}) => {
  // Function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  // Function to get payment status badge color
  const getPaymentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fully_paid':
      case 'paid':
        return 'bg-green-500 text-white';
      case 'partially_paid':
      case 'partial':
        return 'bg-blue-500 text-white';
      case 'unpaid':
      case 'pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Function to get due status badge color
  const getDueStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'due':
        return 'bg-yellow-500 text-white';
      case 'overdue':
        return 'bg-red-500 text-white';
      case 'paid':
        return 'bg-green-500 text-white';
      case 'upcoming':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Function to format payment status text
  const formatPaymentStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fully_paid':
      case 'paid':
        return 'Fully Paid';
      case 'partially_paid':
      case 'partial':
        return 'Partially Paid';
      case 'unpaid':
      case 'pending':
        return 'Unpaid';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown';
    }
  };
  
  // Function to format due status text
  const formatDueStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'due':
        return 'Due (Grace Period)';
      case 'overdue':
        return 'Overdue';
      case 'paid':
        return 'Paid';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };
  
  // For backward compatibility
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'overdue':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Calculate the starting index for the current page
  const startIndex = (currentPage - 1) * (invoices.length > 0 ? invoices.length : 10);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left">#</th>
              <th className="py-3 px-4 border-b text-left">Invoice Number</th>
              <th className="py-3 px-4 border-b text-left">Client Name</th>
              <th className="py-3 px-4 border-b text-left">Account Number</th>
              <th className="py-3 px-4 border-b text-left">Billing Period</th>
              <th className="py-3 px-4 border-b text-left">Issue Date</th>
              <th className="py-3 px-4 border-b text-left">Due Date</th>
              <th className="py-3 px-4 border-b text-left">Total Amount</th>
              <th className="py-3 px-4 border-b text-left">Amount Paid</th>
              <th className="py-3 px-4 border-b text-left">Balance</th>
              <th className="py-3 px-4 border-b text-left">Payment Status</th>
              <th className="py-3 px-4 border-b text-left">Due Status</th>
              {onViewInvoice && <th className="py-3 px-4 border-b text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => {
              console.log(invoice)
              const isOverdue = (invoice.dueStatus || invoice.status) === 'overdue';
              const isDue = (invoice.dueStatus || invoice.status) === 'due';
              const rowClass = showAgingInfo 
                ? isOverdue 
                  ? 'hover:bg-red-50 bg-red-25' 
                  : isDue 
                  ? 'hover:bg-yellow-50 bg-yellow-25' 
                  : 'hover:bg-gray-50'
                : 'hover:bg-gray-50';
              
              return (
                <tr key={invoice.id} className={rowClass}>
                  <td className="py-3 px-4 border-b">{startIndex + index + 1}</td>
                  <td className="py-3 px-4 border-b font-medium">
                    {invoice.invoiceNumber}
                    {showAgingInfo && isOverdue && (
                      <span className="ml-2 text-red-500 text-xs">⚠️</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">{invoice.user.name}</td>
                  <td className="py-3 px-4 border-b">{invoice.accountNumber}</td>
                  <td className="py-3 px-4 border-b">
                    {formatDate(invoice.billingPeriodStart
                   )} - {formatDate(invoice.billingPeriodEnd)}
                  </td>
                  <td className="py-3 px-4 border-b">{formatDate(invoice.issuedDate)}</td>
                  <td className={`py-3 px-4 border-b ${showAgingInfo && isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                    {formatDate(invoice.dueDate)}
                    {showAgingInfo && (
                      <div className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const dueDate = new Date(invoice.dueDate);
                          const today = new Date();
                          const diffTime = today.getTime() - dueDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays > 0) {
                            return `${diffDays} days overdue`;
                          } else if (diffDays === 0) {
                            return 'Due today';
                          } else {
                            return `${Math.abs(diffDays)} days until due`;
                          }
                        })()
                        }
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">KES {invoice.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 border-b">KES {invoice.amountPaid.toLocaleString()}</td>
                  <td className={`py-3 px-4 border-b font-semibold ${showAgingInfo ? 'text-red-600' : ''}`}>
                    KES {invoice.remainingBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadge(invoice.paymentStatus || invoice.status)}`}>
                      {formatPaymentStatus(invoice.paymentStatus || invoice.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDueStatusBadge(invoice.dueStatus || (invoice.status === 'overdue' ? 'overdue' : 'due'))}`}>
                      {formatDueStatus(invoice.dueStatus || (invoice.status === 'overdue' ? 'overdue' : 'due'))}
                    </span>
                  </td>
                  {onViewInvoice && (
                    <td className="py-3 px-4 border-b text-center">
                      <button
                        onClick={() => onViewInvoice(invoice.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        title="View invoice details and payment history"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={onViewInvoice ? 13 : 12} className="py-4 text-center text-gray-500">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
          >
            &laquo;
          </button>
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
          >
            &lsaquo;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${page === currentPage ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
          >
            &rsaquo;
          </button>
          <button 
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

