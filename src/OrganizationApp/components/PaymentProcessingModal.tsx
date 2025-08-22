import React, { useState } from 'react';
import { organizationService } from '../../services/organizationService';

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    paymentMethod: 'mpesa',
    phoneNumber: '',
    mpesaReceiptNumber: '',
    chequeNumber: '',
    bankName: '',
    transferReference: '',
    rtgsReference: '',
    transactionId: ''
  });

  const paymentMethods = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'rtgs', label: 'RTGS' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentData = {
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        ...(formData.paymentMethod === 'mpesa' && {
          phoneNumber: formData.phoneNumber,
          mpesaReceiptNumber: formData.mpesaReceiptNumber
        }),
        ...(formData.paymentMethod === 'cheque' && {
          chequeNumber: formData.chequeNumber,
          bankName: formData.bankName
        }),
        ...(formData.paymentMethod === 'bank_transfer' && {
          transferReference: formData.transferReference,
          bankName: formData.bankName
        }),
        ...(formData.paymentMethod === 'rtgs' && {
          rtgsReference: formData.rtgsReference,
          bankName: formData.bankName
        }),
        ...(formData.paymentMethod === 'cash' && {
          transactionId: `CASH-${Date.now()}`
        })
      };

      await organizationService.processPayment(paymentData);
      
      // Reset form
      setFormData({
        accountNumber: '',
        amount: '',
        paymentMethod: 'mpesa',
        phoneNumber: '',
        mpesaReceiptNumber: '',
        chequeNumber: '',
        bankName: '',
        transferReference: '',
        rtgsReference: '',
        transactionId: ''
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodFields = () => {
    switch (formData.paymentMethod) {
      case 'mpesa':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="254712345678"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Receipt Number *</label>
              <input
                type="text"
                value={formData.mpesaReceiptNumber}
                onChange={(e) => setFormData({ ...formData, mpesaReceiptNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="QHX12345678"
                required
              />
            </div>
          </>
        );
      
      case 'cheque':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Number *</label>
              <input
                type="text"
                value={formData.chequeNumber}
                onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="123456"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="KCB Bank"
                required
              />
            </div>
          </>
        );
      
      case 'bank_transfer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Reference *</label>
              <input
                type="text"
                value={formData.transferReference}
                onChange={(e) => setFormData({ ...formData, transferReference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="TXN123456789"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Equity Bank"
                required
              />
            </div>
          </>
        );
      
      case 'rtgs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RTGS Reference *</label>
              <input
                type="text"
                value={formData.rtgsReference}
                onChange={(e) => setFormData({ ...formData, rtgsReference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="RTGS123456789"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Standard Chartered"
                required
              />
            </div>
          </>
        );
      
      case 'cash':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                Cash payment will be recorded with an auto-generated transaction ID.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Process Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="RES123456"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1000.00"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading}
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {renderPaymentMethodFields()}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};