import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, User, LogOut, Crown, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../services/stripeService';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, logout } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    try {
      setIsUpgrading(true);
      await redirectToCheckout(user.uid);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading account..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <Globe className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Domain Value Estimator</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-4 mb-8">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full" />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Free Plan</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Upgrade to Pro for unlimited searches and advanced features
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  {isUpgrading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Upgrade to Pro</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates and reports</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-500">
                    Coming Soon
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="font-medium text-gray-900">API Access</h4>
                    <p className="text-sm text-gray-600">Developer API configuration</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-500">
                    Upgrade Required
                  </button>
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