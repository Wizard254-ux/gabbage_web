import React from 'react';
import { format } from 'date-fns';

interface Payment {
  _id: string;
  userId: string;
  accountNumber: string;
  amount: number;
  invoice:any,
  currency: string;
  paymentMethod: string;
  transactionId: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  invoiceId?: {
    billingPeriod: {
      start: string;
      end: string;
    };
    _id: string;
    userId: string;
    accountNumber: string;
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
    status: string;
    dueDate: string;
    emailSent: boolean;
    issuedDate: string;
    createdAt: string;
    updatedAt: string;
    invoiceNumber: string;
  };
  invoiceIds?: Array<{
    _id: string;
    invoiceNumber: string;
  }>;
  invoiceAllocations?: Array<{
    invoiceId: {
      _id: string;
      invoiceNumber: string;
    };
    amount: number;
  }>;
  status: string;
  allocationStatus?: string;
  allocatedAmount?: number;
  remainingAmount?: number;
  paidAt: string;
  metadata?: {
    payerName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaymentHistoryTableProps {
  payments: Payment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Function to get allocation status badge color
  const getAllocationBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fully_allocated':
        return 'bg-green-500 text-white';
      case 'partially_allocated':
        return 'bg-blue-500 text-white';
      case 'unallocated':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Function to format allocation status
  const formatAllocationStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fully_allocated':
        return 'Fully Allocated';
      case 'partially_allocated':
        return 'Partially Allocated';
      case 'unallocated':
        return 'Unallocated';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Calculate the starting index for the current page
  const startIndex = (currentPage - 1) * (payments.length > 0 ? payments.length : 10);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left">#</th>
              <th className="py-3 px-4 border-b text-left">Date</th>
              <th className="py-3 px-4 border-b text-left">Account</th>
              <th className="py-3 px-4 border-b text-left">Amount</th>
              <th className="py-3 px-4 border-b text-left">Method</th>
              <th className="py-3 px-4 border-b text-left">Receipt</th>
              <th className="py-3 px-4 border-b text-left">Phone</th>
              <th className="py-3 px-4 border-b text-left">Invoice</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
              <th className="py-3 px-4 border-b text-left">Allocation Status</th>
              <th className="py-3 px-4 border-b text-left">Allocated Amount</th>
              <th className="py-3 px-4 border-b text-left">Remaining Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{startIndex + index + 1}</td>
                <td className="py-3 px-4 border-b">{formatDate(payment.paidAt || payment.createdAt)}</td>
                <td className="py-3 px-4 border-b">{payment.accountNumber}</td>
                <td className="py-3 px-4 border-b font-medium text-green-600">
                  KES {payment.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 border-b capitalize">{payment.paymentMethod}</td>
                <td className="py-3 px-4 border-b font-mono">{payment.mpesaReceiptNumber || '-'}</td>
                <td className="py-3 px-4 border-b">{payment.phoneNumber}</td>
                <td className="py-3 px-4 border-b">
                  {payment.invoiceAllocations && payment.invoiceAllocations.length > 0 ? (
                    <div className="space-y-1">
                      {payment.invoiceAllocations.map((allocation, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium text-blue-600">
                            {allocation.invoiceId.invoiceNumber}
                          </span>
                          <span className="text-gray-500 ml-1">
                            (KES {allocation.amount.toLocaleString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : payment.invoice ? (
                    payment.invoice.invoiceNumber
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
                <td className="`">
                  {payment.allocationStatus ? (
                    <span className={`font-medium text-blue-600 `}>
                      {formatAllocationStatus(payment.allocationStatus)}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {payment.allocatedAmount !== undefined ? (
                    <span className="font-medium text-blue-600">
                      KES {payment.allocatedAmount.toLocaleString()}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {payment.remainingAmount !== undefined ? (
                    <span className="font-medium text-orange-600">
                      KES {payment.remainingAmount.toLocaleString()}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={12} className="py-4 text-center text-gray-500">No payments found</td>
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