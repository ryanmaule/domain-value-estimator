import React, { useState, useCallback } from 'react';
import { ArrowRight, Plus, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { validateDomain } from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isAdvancedMode: boolean;
  isLoading: boolean;
}

const DomainInput: React.FC<Props> = ({ isAdvancedMode, isLoading }) => {
  const [domains, setDomains] = useState<string[]>(['']);
  const [bulkMode, setBulkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    
    let domainsToAnalyze: string[] = [];
    
    if (bulkMode) {
      domainsToAnalyze = domains[0]
        .split('\n')
        .map(d => d.trim())
        .filter(d => d !== '');
    } else {
      domainsToAnalyze = domains.filter(domain => domain.trim() !== '');
    }

    if (domainsToAnalyze.length === 0) {
      toast.error('Please enter at least one domain name');
      setIsSubmitting(false);
      return;
    }

    const domain = domainsToAnalyze[0];
    const validDomain = validateDomain(domain);
    
    if (validDomain) {
      navigate(`/${validDomain}`, { 
        state: { bulkDomains: domainsToAnalyze },
        replace: true 
      });
    }
    
    setIsSubmitting(false);
  }, [domains, bulkMode, isSubmitting, isLoading, navigate]);

  const addDomain = useCallback(() => {
    setDomains(prev => [...prev, '']);
  }, []);

  const removeDomain = useCallback((index: number) => {
    setDomains(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateDomain = useCallback((index: number, value: string) => {
    setDomains(prev => {
      const newDomains = [...prev];
      newDomains[index] = value;
      return newDomains;
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {bulkMode ? (
            <div className="mb-3">
              <textarea
                value={domains[0]}
                onChange={(e) => updateDomain(0, e.target.value)}
                placeholder="Enter domain names (one per line)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={5}
                required
                disabled={isSubmitting || isLoading}
              />
            </div>
          ) : (
            domains.map((domain, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => updateDomain(index, e.target.value)}
                    placeholder="Enter domain name (e.g., example.com)"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isSubmitting || isLoading}
                    required
                  />
                  {!isAdvancedMode && (
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={`flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        (isSubmitting || isLoading) ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {(isSubmitting || isLoading) ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          <span>Analyze</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                  {isAdvancedMode && domains.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDomain(index)}
                      disabled={isSubmitting || isLoading}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {user && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBulkMode(!bulkMode)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {bulkMode ? 'Single Mode' : 'Bulk Mode'}
              </button>
            </div>
          )}

          {isAdvancedMode && !bulkMode && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={addDomain}
                disabled={isSubmitting || isLoading}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add Domain</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (isSubmitting || isLoading) ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {(isSubmitting || isLoading) ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <span>Analyze All</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {bulkMode && (
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isSubmitting || isLoading) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {(isSubmitting || isLoading) ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <span>Analyze All</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DomainInput;