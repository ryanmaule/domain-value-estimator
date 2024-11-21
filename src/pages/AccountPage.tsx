import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, User, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import UserMenu from '../components/UserMenu';
import SubscriptionDetails from '../components/SubscriptionDetails';
import stripeService from '../services/stripeService';
import type { SubscriptionDetails as SubscriptionDetailsType } from '../services/stripeService';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionDetailsType | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signup');
    }

    // Handle Stripe redirect
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      toast.success('Successfully upgraded to Pro!');
      // Remove the session_id from URL
      navigate('/account', { replace: true });
    }
  }, [user, loading, navigate, searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoadingData(true);
      try {
        const subDetails = await stripeService.getSubscriptionDetails();
        setSubscription(subDetails);
      } catch (error) {
        console.error('Failed to fetch account data:', error);
        toast.error('Failed to load account data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // Generate API key based on email
  const generateApiKey = (email: string) => {
    const base64Email = btoa(email);
    return `dve_${base64Email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading account..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const apiKey = generateApiKey(user.email);

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

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 sm:w-16 h-12 sm:h-16 rounded-full" />
              ) : (
                <User className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400" />
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user.displayName}</h2>
                <p className="text-sm sm:text-base text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-indigo-50 px-3 sm:px-4 py-2 rounded-lg">
              <Crown className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
              <span className="text-sm sm:text-base text-indigo-600 font-medium">Pro Account</span>
            </div>
          </div>

          <div className="space-y-8">
            {subscription && (
              <SubscriptionDetails 
                subscription={subscription} 
                onUpdate={() => stripeService.getSubscriptionDetails().then(setSubscription)} 
              />
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">API Access</h3>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your API Key
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <code className="flex-1 p-3 bg-gray-100 rounded text-sm font-mono break-all">
                        {apiKey}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          toast.success('API key copied to clipboard');
                        }}
                        className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-lg sm:whitespace-nowrap"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Use this key to authenticate your API requests. Never share your API key publicly.</p>
                    <p className="mt-2">
                      View the{' '}
                      <a
                        href="https://documenter.getpostman.com/view/39857847/2sAYBRGEcT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        API documentation
                      </a>
                      {' '}for usage examples.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountPage;