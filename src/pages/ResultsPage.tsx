import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResultsView from '../components/ResultsView';
import Footer from '../components/Footer';
import LoadingProgress from '../components/LoadingProgress';
import UserMenu from '../components/UserMenu';
import BulkSearchNav from '../components/BulkSearchNav';
import { analyzeDomain } from '../services/domainAnalyzer';
import { validateDomain } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import type { DomainAnalysis } from '../types';
import type { AnalysisStage } from '../components/LoadingProgress';

const ResultsPage: React.FC = () => {
  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { decrementSearches } = useAuth();
  const [analysis, setAnalysis] = useState<DomainAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<AnalysisStage>('whois');
  const [bulkDomains, setBulkDomains] = useState<string[]>([]);

  // Get bulk domains from location state
  useEffect(() => {
    if (location.state?.bulkDomains) {
      setBulkDomains(location.state.bulkDomains);
    } else if (domain) {
      setBulkDomains([domain]);
    }
  }, [location.state, domain]);

  // Memoize the analysis function to prevent unnecessary re-renders
  const fetchAnalysis = useCallback(async (domainToAnalyze: string) => {
    if (!domainToAnalyze) return;

    const validDomain = validateDomain(domainToAnalyze);
    if (!validDomain) {
      navigate('/', { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      const result = await analyzeDomain(validDomain, setLoadingStage);
      setAnalysis(result);
      decrementSearches();
    } catch (error) {
      console.error('Domain analysis failed:', error);
      toast.error('Failed to analyze domain. Please try again.');
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, decrementSearches]);

  // Only fetch analysis when domain changes
  useEffect(() => {
    if (domain) {
      fetchAnalysis(domain);
    }
  }, [domain, fetchAnalysis]);

  const handleReset = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  const handleDomainSelect = useCallback((selectedDomain: string) => {
    navigate(`/${selectedDomain}`, { 
      state: { bulkDomains },
      replace: true 
    });
  }, [navigate, bulkDomains]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
        <header className="w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" 
                onClick={handleReset}
              >
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Domain Value</h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <LoadingProgress domain={domain || ''} stage={loadingStage} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" 
              onClick={handleReset}
            >
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Domain Value</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {bulkDomains.length > 1 && domain && (
          <BulkSearchNav
            domains={bulkDomains}
            currentDomain={domain}
            onSelect={handleDomainSelect}
          />
        )}
        {analysis && <ResultsView analysis={analysis} onReset={handleReset} />}
      </main>

      <Footer />
    </div>
  );
};

export default ResultsPage;