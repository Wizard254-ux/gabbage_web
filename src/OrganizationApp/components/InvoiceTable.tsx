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
  billingPeriod: {
    start: string;
    end: string;
  };
}

interface InvoiceTableProps {
  invoices: Invoice[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ 
  invoices, 
  currentPage, 
  totalPages, 
  onPageChange 
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
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{startIndex + index + 1}</td>
                <td className="py-3 px-4 border-b font-medium">{invoice.invoiceNumber}</td>
                <td className="py-3 px-4 border-b">{invoice.userId.name}</td>
                <td className="py-3 px-4 border-b">{invoice.accountNumber}</td>
                <td className="py-3 px-4 border-b">
                  {formatDate(invoice.billingPeriod.start)} - {formatDate(invoice.billingPeriod.end)}
                </td>
                <td className="py-3 px-4 border-b">{formatDate(invoice.issuedDate)}</td>
                <td className="py-3 px-4 border-b">{formatDate(invoice.dueDate)}</td>
                <td className="py-3 px-4 border-b">KES {invoice.totalAmount.toLocaleString()}</td>
                <td className="py-3 px-4 border-b">KES {invoice.amountPaid.toLocaleString()}</td>
                <td className="py-3 px-4 border-b">KES {invoice.remainingBalance.toLocaleString()}</td>
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
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={12} className="py-4 text-center text-gray-500">No invoices found</td>
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

