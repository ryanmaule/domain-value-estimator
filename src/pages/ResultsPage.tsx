import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResultsView from '../components/ResultsView';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import UserMenu from '../components/UserMenu';
import { analyzeDomain } from '../services/domainAnalyzer';
import { validateDomain } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import type { DomainAnalysis } from '../types';

const ResultsPage: React.FC = () => {
  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { decrementSearches } = useAuth();
  const [analysis, setAnalysis] = useState<DomainAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const fetchAnalysis = useCallback(async (domainToAnalyze: string) => {
    if (!domainToAnalyze || hasAnalyzed) {
      return;
    }

    const validDomain = validateDomain(domainToAnalyze);
    if (!validDomain) {
      navigate('/', { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      const result = await analyzeDomain(validDomain);
      setAnalysis(result);
      decrementSearches();
      setHasAnalyzed(true);
    } catch (error) {
      console.error('Domain analysis failed:', error);
      toast.error('Failed to analyze domain. Please try again.');
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, decrementSearches, hasAnalyzed]);

  useEffect(() => {
    // Reset hasAnalyzed when the URL changes
    setHasAnalyzed(false);
  }, [location.pathname]);

  useEffect(() => {
    if (domain && !hasAnalyzed) {
      fetchAnalysis(domain);
    }
  }, [domain, fetchAnalysis, hasAnalyzed]);

  const handleReset = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
        <header className="w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={handleReset}
              >
                <Globe className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Domain Value Estimator</h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="large" message="Analyzing domain..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {analysis && (
        <Helmet>
          <title>{`${analysis.domain} Value Analysis - Domain Value Estimator`}</title>
          <meta 
            name="description" 
            content={`Domain valuation report for ${analysis.domain}. Estimated value: $${analysis.estimatedValue.toLocaleString()}. Includes SEO metrics, domain age, and market analysis.`}
          />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Report",
              "name": `Domain Value Analysis for ${analysis.domain}`,
              "dateCreated": new Date().toISOString(),
              "abstract": `Domain valuation and analysis report for ${analysis.domain}`,
              "author": {
                "@type": "Organization",
                "name": "Domain Value Estimator"
              },
              "valueEstimate": {
                "@type": "MonetaryAmount",
                "value": analysis.estimatedValue,
                "currency": "USD"
              }
            })}
          </script>
        </Helmet>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
        <header className="w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={handleReset}
              >
                <Globe className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Domain Value Estimator</h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 py-12">
          {analysis && <ResultsView analysis={analysis} onReset={handleReset} />}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ResultsPage;