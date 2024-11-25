import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { redirectToCheckout } from '../services/stripeService';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    { name: 'Domain Value Estimation', free: true, pro: true },
    { name: 'Domain Age Analysis', free: true, pro: true },
    { name: 'SEO Metrics', free: true, pro: true },
    { name: 'Daily Searches', free: '5 searches', pro: 'Unlimited Searches' },
    { name: 'Bulk Domain Analysis', free: false, pro: true },
    { name: 'Detailed PDF Reports', free: false, pro: true },
    { name: 'API Access', free: false, pro: true }
  ];

  React.useEffect(() => {
    if (searchParams.get('canceled')) {
      toast('Checkout canceled', { icon: '❌' });
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await redirectToCheckout();
    } catch (error) {
      // Error is already handled in stripeService
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <Globe className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Domain Value</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Get more insights with our Pro plan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border-2 border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$0</p>
              <p className="text-gray-500">Limited features</p>
            </div>
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className={`h-5 w-5 mr-3 ${feature.free ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-gray-600">
                    {typeof feature.free === 'string' ? feature.free : feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-indigo-600 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                RECOMMENDED
              </span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$19.95</p>
              <p className="text-gray-500">per month</p>
            </div>
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">
                    {typeof feature.pro === 'string' ? feature.pro : feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Upgrade Now'
              )}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Questions? Contact our sales team at{' '}
            <a href="mailto:sales@domainvalue.dev" className="text-indigo-600 hover:text-indigo-500">
              sales@domainvalue.dev
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;