import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import UserMenu from '../components/UserMenu';
import TransactionHistory from '../components/TransactionHistory';
import stripeService, { Transaction } from '../services/stripeService';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signup');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        const txHistory = await stripeService.getTransactionHistory();
        setTransactions(txHistory);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading transactions..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Domain Value</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
          <div className="flex items-center space-x-4 mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/account')}
              className="text-gray-600 hover:text-indigo-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction History</h2>
          </div>

          <TransactionHistory transactions={transactions} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TransactionsPage;