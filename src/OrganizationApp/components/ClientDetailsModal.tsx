import React, { useState, useEffect } from 'react';
import { organizationService } from '../../services/organizationService';

interface ClientDetailsModalProps {
  clientId: string;
  onClose: () => void;
}

interface ClientDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  route: {
    _id: string;
    name: string;
    path: string;
  };
  pickUpDay: string;
  isActive: boolean;
  monthlyRate: number;
  clientType: string;
  serviceStartDate: string;
  accountNumber: string;
  createdAt: string;
  gracePeriod: number;
}

interface Payment {
  _id: string;
  accountNumber: string;
  amount: number;
  paymentMethod: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  transactionId: string;
  status: string;
  allocationStatus?: string;
  allocatedAmount?: number;
  remainingAmount?: number;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  accountNumber: string;
  totalAmount: number;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  status: string;
  paymentStatus?: string;
  dueStatus?: string;
  dueDate: string;
  issuedDate: string;
  createdAt: string;
  emailSent: boolean;
  emailSentAt: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ clientId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'payments' | 'invoices'>('details');
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState({
    client: true,
    payments: false,
    invoices: false
  });

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  useEffect(() => {
    if (activeTab === 'payments' && payments.length === 0) {
      fetchClientPayments();
    } else if (activeTab === 'invoices' && invoices.length === 0) {
      fetchClientInvoices();
    }
  }, [activeTab]);

  const fetchClientDetails = async () => {
    try {
      setLoading(prev => ({ ...prev, client: true }));
      const response = await organizationService.getClientDetails(clientId);
      setClient(response.data.client);
    } catch (error) {
      console.error('Failed to fetch client details:', error);
    } finally {
      setLoading(prev => ({ ...prev, client: false }));
    }
  };

  const fetchClientPayments = async () => {
    if (!client?.accountNumber) return;
    
    try {
      setLoading(prev => ({ ...prev, payments: true }));
      const response = await organizationService.getClientPayments(clientId);
      console.log('Fetched payments:', response.data.payments);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch client payments:', error);
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const fetchClientInvoices = async () => {
    if (!client?.accountNumber) return;
    
    try {
      setLoading(prev => ({ ...prev, invoices: true }));
      const response = await organizationService.getClientInvoices(clientId);
      console.log('Fetched invoices:', response.data.invoices);
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch client invoices:', error);
    } finally {
      setLoading(prev => ({ ...prev, invoices: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };
  
  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fully_paid':
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'partially_paid':
      case 'partial':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'unpaid':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  const getDueStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'due':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  const formatPaymentStatus = (status: string) => {
    switch (status.toLowerCase()) {
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
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };
  
  const formatDueStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'due':
        return 'Due';
      case 'overdue':
        return 'Overdue';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };
  
  const getAllocationBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fully_allocated':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'partially_allocated':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'unallocated':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  const formatAllocationStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fully_allocated':
        return 'Fully Allocated';
      case 'partially_allocated':
        return 'Partially Allocated';
      case 'unallocated':
        return 'Unallocated';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  if (loading.client) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Client Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {client && (
          <>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xl mr-4">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {client.name}
                </h4>
                <p className="text-gray-600">
                  {client.email} • {client.phone}
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      client.isActive
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        client.isActive ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></div>
                    {client.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                    {client.clientType}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "payments"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "invoices"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Invoices
                </button>
              </nav>
            </div>

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Account Number
                    </h5>
                    <p className="text-base font-medium text-gray-900">
                      {client.accountNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Address
                    </h5>
                    <p className="text-base text-gray-900">{client.address}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Route</h5>
                    <p className="text-base text-gray-900">
                      {client.route?.name
                        ? `${client.route.name} - ${client.route.path}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Pickup Day
                    </h5>
                    <p className="text-base text-gray-900 capitalize">
                      {client.pickUpDay}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Monthly Rate
                    </h5>
                    <p className="text-base font-medium text-green-600">
                      KSH {client.monthlyRate?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Service Start Date
                    </h5>
                    <p className="text-base text-gray-900">
                      {client.serviceStartDate
                        ? formatDate(client.serviceStartDate)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Grace Period
                    </h5>
                    <p className="text-base text-gray-900">
                      {client.gracePeriod || 5} days
                      <span className="text-xs text-gray-500 block mt-1">
                        Days after billing period before invoice is marked overdue
                      </span>
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Client Since
                    </h5>
                    <p className="text-base text-gray-900">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div>
                {loading.payments ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Receipt/Ref
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allocation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              KSH {payment.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {payment.paymentMethod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.mpesaReceiptNumber ||
                                payment.transactionId ||
                                "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {payment.allocationStatus ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAllocationBadgeClass(
                                    payment.allocationStatus
                                  )}`}
                                >
                                  {formatAllocationStatus(payment.allocationStatus)}
                                  {payment.allocatedAmount !== undefined && (
                                    <span className="block text-xs mt-1">
                                      {payment.allocatedAmount}/{payment.amount} KES
                                    </span>
                                  )}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No payment history
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This client has not made any payments yet.
                    </p>
                  </div>
                )}
              </div>
            )}

                {activeTab === "invoices" && (
                  <div>
                    {loading.invoices ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                      </div>
                    ) : invoices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Billing Period
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount Paid
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remaining Balance
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                              <tr key={invoice._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                  {invoice.invoiceNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {invoice.accountNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(
                                    invoice.issuedDate || invoice.createdAt
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(invoice.dueDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {invoice.billingPeriod
                                    ? `${formatDate(
                                        invoice.billingPeriod.start
                                      )} - ${formatDate(invoice.billingPeriod.end)}`
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  KSH {invoice.totalAmount || invoice.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  KSH {invoice.amountPaid || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                                  KSH{" "}
                                  {invoice.remainingBalance ||
                                    (invoice.totalAmount || invoice.amount) -
                                      (invoice.amountPaid || 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col space-y-1">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(
                                        invoice.paymentStatus || invoice.status
                                      )}`}
                                    >
                                      {formatPaymentStatus(invoice.paymentStatus || invoice.status)}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDueStatusBadgeClass(
                                        invoice.dueStatus || (invoice.status === 'overdue' ? 'overdue' : 'due')
                                      )}`}
                                    >
                                      {formatDueStatus(invoice.dueStatus || (invoice.status === 'overdue' ? 'overdue' : 'due'))}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      invoice.emailSent
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {invoice.emailSent ? "Sent" : "Not Sent"}
                                  </span>
                                  {invoice.emailSent && invoice.emailSentAt && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatDate(invoice.emailSentAt)}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No invoices found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          This client has no invoices yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsModal;