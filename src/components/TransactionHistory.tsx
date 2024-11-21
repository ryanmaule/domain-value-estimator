import React from 'react';
import { format } from 'date-fns';
import type { Transaction } from '../services/stripeService';

interface Props {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<Props> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: transaction.currency.toUpperCase()
                  }).format(transaction.amount / 100)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium text-gray-900">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </div>
              <span className={`px-2 text-xs leading-5 font-semibold rounded-full
                ${transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {transaction.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {transaction.description}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: transaction.currency.toUpperCase()
              }).format(transaction.amount / 100)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;