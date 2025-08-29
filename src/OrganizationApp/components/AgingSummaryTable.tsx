import React from 'react';

interface AgingBucket {
  range: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

interface ClientAging {
  clientId: number;
  clientName: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  total: number;
}

interface AgingSummary {
  totalUnpaidAmount: number;
  totalInvoices: number;
  overdueCount: number;
  overdueAmount: number;
  dueCount: number;
  dueAmount: number;
  agingBuckets: AgingBucket[];
  clientAging?: ClientAging[];
  gracePeriodDays: number;
  message?: string;
}

interface AgingSummaryTableProps {
  summary: AgingSummary | null;
}

export const AgingSummaryTable: React.FC<AgingSummaryTableProps> = ({
  summary
}) => {

  const formatCurrency = (amount: number): string => {
    return `KES ${amount.toLocaleString()}`;
  };

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          Aging Summary - Outstanding Receivables
        </div>
        <div className="p-4">
          <div className="text-center py-8 text-gray-500">
            Loading aging summary...
          </div>
        </div>
      </div>
    );
  }

  const { agingBuckets, totalUnpaidAmount, gracePeriodDays, message } = summary;
  const totalCount = agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0);

  const getColorClasses = (index: number, hasData: boolean) => {
    const colorMaps = [
      { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', indicator: 'bg-yellow-400' },
      { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', indicator: 'bg-orange-400' },
      { bg: 'bg-red-50 border-red-200', text: 'text-red-800', indicator: 'bg-red-400' },
      { bg: 'bg-red-100 border-red-300', text: 'text-red-900', indicator: 'bg-red-600' }
    ];
    
    return {
      rowClass: hasData ? colorMaps[index].bg : 'bg-white',
      textClass: hasData ? colorMaps[index].text : 'text-gray-900',
      indicatorClass: colorMaps[index].indicator
    };
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
        Aging Summary - Outstanding Receivables
      </div>
      
      <div className="p-4">
        {totalUnpaidAmount === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">🎉 No Outstanding Receivables</div>
            <div className="text-sm">All invoices are either paid or still within grace period.</div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <div className="text-sm text-gray-600">Total Overdue Invoices</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalUnpaidAmount)}</div>
                <div className="text-sm text-red-700">Total Outstanding Amount</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalCount > 0 ? formatCurrency(Math.round(totalUnpaidAmount / totalCount)) : 'KES 0'}
                </div>
                <div className="text-sm text-blue-700">Average Outstanding</div>
              </div>
            </div>

            {/* Client Aging Details Table */}
            {summary.clientAging && summary.clientAging.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Aging Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Client
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Current
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          1-30 Days
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          31-60 Days
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          61-90 Days
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          90 Days
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {summary.clientAging.map((client) => (
                        <tr key={client.clientId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                            {client.clientName}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 border-b">
                            {client.current > 0 ? formatCurrency(client.current) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-yellow-700 border-b">
                            {client.days1to30 > 0 ? formatCurrency(client.days1to30) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-orange-700 border-b">
                            {client.days31to60 > 0 ? formatCurrency(client.days31to60) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-700 border-b">
                            {client.days61to90 > 0 ? formatCurrency(client.days61to90) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-900 border-b font-semibold">
                            {client.days90plus > 0 ? formatCurrency(client.days90plus) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 border-b font-bold">
                            {formatCurrency(client.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 border-t">
                          TOTALS
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 border-t">
                          {formatCurrency(summary.clientAging.reduce((sum, c) => sum + c.current, 0))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-yellow-700 border-t">
                          {formatCurrency(summary.clientAging.reduce((sum, c) => sum + c.days1to30, 0))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-700 border-t">
                          {formatCurrency(summary.clientAging.reduce((sum, c) => sum + c.days31to60, 0))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-red-700 border-t">
                          {formatCurrency(summary.clientAging.reduce((sum, c) => sum + c.days61to90, 0))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-red-900 border-t">
                          {formatCurrency(summary.clientAging.reduce((sum, c) => sum + c.days90plus, 0))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 border-t">
                          {formatCurrency(summary.clientAging.reduce((sum, c) => sum + c.total, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}




          </>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          * {message || `Aging calculation starts after ${gracePeriodDays}-day grace period from due date`}
        </div>
      </div>
    </div>
  );
};