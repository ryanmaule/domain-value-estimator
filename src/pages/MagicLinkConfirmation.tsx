import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Mail, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const MagicLinkConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('pendingLoginEmail');

  if (!email) {
    navigate('/login');
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
              <h1 className="text-2xl font-bold text-gray-900">Domain Value</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a magic link to:
            </p>
            <p className="text-lg font-medium text-gray-900 mt-2 mb-4">
              {email}
            </p>
            <p className="text-sm text-gray-600">
              Click the link in the email to complete your login. The link will expire in 1 hour.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center space-x-2 p-2 text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </button>

            <p className="text-sm text-center text-gray-600">
              Didn't receive the email?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MagicLinkConfirmation;