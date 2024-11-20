import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Globe, Gauge, BrainCircuit, Search } from 'lucide-react';
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
    "name": "Domain Value Estimator",
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
        <title>Domain Value Estimator - AI-Powered Domain Appraisals</title>
        <meta name="description" content="Get instant, accurate domain valuations using AI technology. Analyze domain age, SEO metrics, and market trends for reliable domain appraisals." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
        <header className="w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Domain Value Estimator</h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center space-y-12">
              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900">
                  Discover Your Domain's Value
                </h2>
                <p className="text-xl text-gray-600">
                  Get an instant AI-powered valuation
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                <DomainInput 
                  isAdvancedMode={false}
                  isLoading={isAnalyzing}
                />
                {!user && (
                  <div className="text-sm text-gray-600 mt-4">
                    Free Analysis: {searchesRemaining} of 5 searches remaining today
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Gauge className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
                  <p className="text-gray-600">
                    Our AI evaluates domain age, SEO metrics, and market trends to provide accurate valuations you can trust.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <BrainCircuit className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">
                    Advanced algorithms analyze vast amounts of data to provide accurate value estimations and market insights.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Search className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                  <p className="text-gray-600">
                    Get comprehensive reports with detailed insights into all factors affecting your domain's value.
                  </p>
                </div>
              </div>

              {!user && (
                <div className="bg-indigo-600 text-white rounded-xl p-8 shadow-lg max-w-5xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Unlock Pro Features</h3>
                      <p className="text-indigo-100">
                        Get unlimited searches, bulk analysis, and detailed PDF reports
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="whitespace-nowrap px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-lg font-semibold"
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