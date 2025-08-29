import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { organizationService } from '../../shared/services/services/organizationService';

interface Payment {
  id: number;
  trans_id: string;
  first_name: string;
  amount: string;
  payment_method: string;
  status: string;
  created_at: string;
}

interface InvoiceDetails {
  id: number;
  invoice_number: string;
  type: string;
  title: string;
  client_id: number;
  organization_id: number;
  amount: string;
  due_date: string;
  description: string;
  status: string;
  payment_ids: number[] | null;
  paid_amount: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
    adress: string;
    role: string;
    documents: string[];
  };
  payments: Payment[];
}

interface InvoiceDetailsProps {
  invoiceId: string | null;
  onNavigate?: (tab: string, params?: {invoiceId?: string}) => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoiceId, onNavigate }) => {
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails(invoiceId);
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await organizationService.getInvoiceDetails(id);
      console.log('Invoice details response:', response);
      console.log('Invoice details response.data:', response.data);
      
      if (response.data.status) {
        setInvoice(response.data.data.invoice);
      } else {
        setError('Failed to fetch invoice details');
      }
    } catch (err: unknown) {
      setError(err + 'An error occurred while fetching invoice details');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGoBack = () => {
    if (onNavigate) {
      onNavigate('invoices');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading invoice details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
        <div className="mt-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            ← Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">Invoice not found</div>
        <div className="text-center">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            ← Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Invoices
            </button>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
            <p className="text-sm text-gray-600">View comprehensive invoice and payment information</p>
          </div>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Summary</h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{invoice.invoice_number}</h3>
              <p className="text-sm text-gray-600">Client ID: {invoice.client.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-medium text-gray-900">{invoice.client.name}</p>
              <p className="text-sm text-gray-600">{invoice.client.email}</p>
              <p className="text-sm text-gray-600">{invoice.client.phone}</p>
              {invoice.client.adress && (
                <p className="text-sm text-gray-600">{invoice.client.adress}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(invoice.amount))}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(parseFloat(invoice.paid_amount))}</p>
            </div>
            <div className={`p-4 rounded-lg ${(parseFloat(invoice.amount) - parseFloat(invoice.paid_amount)) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-sm font-medium text-gray-600">Remaining Balance</p>
              <p className={`text-2xl font-bold ${(parseFloat(invoice.amount) - parseFloat(invoice.paid_amount)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(parseFloat(invoice.amount) - parseFloat(invoice.paid_amount))}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                invoice.payment_status === 'fully_paid' 
                  ? 'bg-green-100 text-green-800' 
                  : invoice.payment_status === 'partially_paid'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.payment_status === 'fully_paid' ? 'Fully Paid' : 
                 invoice.payment_status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Issue Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(invoice.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Due Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(invoice.due_date)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Billing Period:</span>
                <span className="ml-2 text-gray-900">
                  {invoice.type === 'monthly' ? 'Monthly Service' : 'Custom'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="p-6">
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.trans_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(parseFloat(payment.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
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
    </div>
  );
};