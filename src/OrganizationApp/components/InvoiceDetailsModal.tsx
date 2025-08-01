import React from 'react';
import { format } from 'date-fns';

interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  mpesaReceiptNumber?: string;
  phoneNumber?: string;
  status: string;
  allocatedAmount?: number;
  paidAt?: string;
  createdAt: string;
  invoiceAllocations?: any[];
  invoiceIds?: number[];
}

interface InvoiceDetails {
  id: number;
  invoiceNumber: string;
  accountNumber: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: string;
  dueStatus: string;
  dueDate: string;
  issuedDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  payments: Payment[];
}

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetails | null;
  loading: boolean;
  error: string | null;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  isOpen,
  onClose,
  invoice,
  loading,
  error
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return '📱';
      case 'cash':
        return '💵';
      case 'bank_transfer':
        return '🏦';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatPaymentStatus = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Invoice Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading invoice details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading invoice details</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {invoice && !loading && !error && (
            <div className="space-y-6">
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">Account: {invoice.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium text-gray-900">{invoice.user.name}</p>
                    <p className="text-sm text-gray-600">{invoice.user.email}</p>
                    <p className="text-sm text-gray-600">{invoice.user.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(invoice.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Balance</p>
                    <p className={`text-lg font-semibold ${invoice.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(invoice.remainingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.paymentStatus === 'fully_paid' 
                        ? 'bg-green-100 text-green-800' 
                        : invoice.paymentStatus === 'partially_paid'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.paymentStatus === 'fully_paid' ? 'Fully Paid' : 
                       invoice.paymentStatus === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Issue Date:</span>
                      <span className="ml-2 text-gray-900">{formatDate(invoice.issuedDate)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Due Date:</span>
                      <span className="ml-2 text-gray-900">{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Billing Period:</span>
                      <span className="ml-2 text-gray-900">
                        {formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                
                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount Allocated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Payment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoice.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDateTime(payment.paidAt || payment.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                                  <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div>
                                  {payment.mpesaReceiptNumber && (
                                    <div className="font-medium">{payment.mpesaReceiptNumber}</div>
                                  )}
                                  <div className="text-xs text-gray-500">{payment.transactionId}</div>
                                  {payment.phoneNumber && (
                                    <div className="text-xs text-gray-500">{payment.phoneNumber}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium text-green-600">
                                  {formatCurrency(payment.allocatedAmount || payment.amount)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(payment.amount)}
                                {payment.invoiceIds && payment.invoiceIds.length > 1 && (
                                  <div className="text-xs text-blue-600">
                                    Split across {payment.invoiceIds.length} invoices
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadge(payment.status)}`}>
                                  {formatPaymentStatus(payment.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Payment History</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This invoice has not received any payments yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};