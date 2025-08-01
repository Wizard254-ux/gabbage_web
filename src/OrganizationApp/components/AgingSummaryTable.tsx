import React from 'react';

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

            {/* Aging Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age Range (Days Overdue)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Outstanding
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visual Distribution
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agingBuckets.map((bucket, index) => {
                    const colors = getColorClasses(index, bucket.count > 0);
                    return (
                      <tr key={bucket.range} className={colors.rowClass}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${colors.indicatorClass}`}></div>
                            <div className={`text-sm font-medium ${colors.textClass}`}>
                              {bucket.range}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm ${colors.textClass}`}>
                            {bucket.count}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${colors.textClass}`}>
                            {formatCurrency(bucket.totalAmount)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm ${colors.textClass}`}>
                            {bucket.percentage.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${colors.indicatorClass}`}
                              style={{ width: `${bucket.percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      Total Outstanding
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {totalCount}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {formatCurrency(totalUnpaidAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      100.0%
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Collection Priority Alert */}
            {agingBuckets[3] && agingBuckets[3].count > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      High Priority Collection Required
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      You have {agingBuckets[3].count} invoice(s) overdue by more than 90 days, 
                      totaling {formatCurrency(agingBuckets[3].totalAmount)}. 
                      These require immediate attention for debt recovery.
                    </div>
                  </div>
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