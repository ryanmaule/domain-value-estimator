import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/account');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (user) {
    return null;
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Domain Value Estimator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Started with Domain Value Estimator
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose your plan to access our domain valuation tools
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-lg px-6 py-3 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span>View Pricing Plans</span>
            </button>

            <p className="mt-4 text-sm text-center text-gray-600">
              By continuing, you agree to our{' '}
              <button onClick={() => navigate('/terms')} className="text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </button>{' '}
              and{' '}
              <button onClick={() => navigate('/privacy')} className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupPage;