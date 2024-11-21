import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Globe, Gauge, BrainCircuit, Search, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DomainInput from '../components/DomainInput';
import UserMenu from '../components/UserMenu';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, searchesRemaining } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Domain Value",
    "applicationCategory": "Business Tool",
    "description": "AI-powered domain valuation tool providing instant, accurate domain appraisals based on multiple factors.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <Helmet>
        <title>Domain Value - AI-Powered Domain Appraisals</title>
        <meta name="description" content="Get instant, accurate domain valuations using AI technology. Analyze domain age, SEO metrics, and market trends for reliable domain appraisals." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

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

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
            <div className="text-center space-y-8 sm:space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Discover Your Domain's Value
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Get an instant AI-powered value estimation
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-2xl mx-auto">
                <DomainInput 
                  isAdvancedMode={false}
                  isLoading={isAnalyzing}
                />
                <div className="mt-4 flex flex-col items-center space-y-2">
                  {user ? (
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-indigo-600" />
                      <span>Pro Account: Unlimited Domain Analysis</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600">
                        {searchesRemaining} of 5 free domain analysis remaining today
                      </div>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Upgrade to Pro for bulk domain analysis →
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Gauge className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Our AI evaluates domain age, SEO metrics, and market trends to provide accurate valuations you can trust.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <BrainCircuit className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Advanced algorithms analyze vast amounts of data to provide accurate value estimations and market insights.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Search className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Get comprehensive reports with detailed insights into all factors affecting your domain's value.
                  </p>
                </div>
              </div>

              {!user && (
                <div className="bg-indigo-600 text-white rounded-xl p-6 sm:p-8 shadow-lg max-w-5xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Unlock Pro Features</h3>
                      <p className="text-sm sm:text-base text-indigo-100">
                        Get unlimited searches, bulk analysis, and detailed PDF reports
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full md:w-auto whitespace-nowrap px-6 sm:px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-base sm:text-lg font-semibold"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;