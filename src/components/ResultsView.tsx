import React from 'react';
import { RotateCcw, Download, TrendingUp, Globe, Clock, Search, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import { toast } from 'react-hot-toast';
import type { DomainAnalysis } from '../types';
import DebugBox from './DebugBox';
import { getLastDebugResponse } from '../services/openaiService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  analysis: DomainAnalysis;
  onReset: () => void;
}

const ResultsView: React.FC<Props> = ({ analysis, onReset }) => {
  const { toPDF, targetRef } = usePDF({filename: `${analysis.domain}-valuation.pdf`});
  const navigate = useNavigate();
  const { user } = useAuth();
  const showDebug = import.meta.env.VITE_SHOW_DEBUG === 'true';
  const openaiDebug = getLastDebugResponse();

  // Loading state component
  const LoadingPlaceholder = () => (
    <div className="animate-pulse bg-gray-100 rounded h-4 w-full"></div>
  );

  const handleDownloadPDF = () => {
    if (!user) {
      toast.error('Please upgrade to Pro to export PDF reports');
      navigate('/pricing');
      return;
    }

    if (!user.isPro) {
      toast.error('PDF export is a Pro feature');
      navigate('/pricing');
      return;
    }

    toPDF();
  };

  return (
    <div ref={targetRef} className="bg-white rounded-xl shadow-sm p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Domain Analysis Results</h2>
          <h1 className="text-2xl sm:text-4xl font-bold text-indigo-600 mt-2">{analysis.domain}</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            {user?.isPro ? (
              <Download className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
            <span>Export PDF</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <RotateCcw className="h-5 w-5" />
            <span>New Search</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Estimated Value</h3>
          <div className="text-3xl sm:text-4xl font-bold">
            {analysis.estimatedValue ? (
              `$${analysis.estimatedValue.toLocaleString()}`
            ) : (
              <LoadingPlaceholder />
            )}
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="text-indigo-200">Confidence Score:</div>
            <div className="font-semibold">
              {analysis.confidenceScore ? (
                `${analysis.confidenceScore}%`
              ) : (
                <LoadingPlaceholder />
              )}
            </div>
          </div>
          <div className="mt-3 text-xs text-indigo-100">
            * This is an AI-generated estimate based on multiple factors including domain age, 
            traffic, and market trends. Actual market value may vary.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: <Globe className="h-6 w-6 text-indigo-600" />,
              label: "Domain Age",
              value: analysis.domainAge
            },
            {
              icon: <TrendingUp className="h-6 w-6 text-indigo-600" />,
              label: "Monthly Traffic",
              value: typeof analysis.monthlyTraffic === 'number' 
                ? analysis.monthlyTraffic.toLocaleString()
                : analysis.monthlyTraffic
            },
            {
              icon: <Search className="h-6 w-6 text-indigo-600" />,
              label: "SEO Score",
              value: `${analysis.seoScore}/100`
            },
            {
              icon: <Clock className="h-6 w-6 text-indigo-600" />,
              label: "TLD Value",
              value: analysis.tldValue
            }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {stat.icon}
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <div className="text-base sm:text-xl font-semibold text-gray-900">
                {stat.value || <LoadingPlaceholder />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Suggested Keywords</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.suggestedKeywords.length > 0 ? (
              analysis.suggestedKeywords.map((keyword, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">{keyword.keyword}</div>
                  <div className="text-sm text-gray-600">
                    <span>Volume: {keyword.searchVolume}</span>
                    <span className="mx-2">•</span>
                    <span>Difficulty: {keyword.difficulty}</span>
                  </div>
                </div>
              ))
            ) : (
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <LoadingPlaceholder />
                  <div className="mt-2">
                    <LoadingPlaceholder />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Detailed Analysis</h3>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            {analysis.detailedAnalysis ? (
              <p className="text-gray-700 whitespace-pre-line">
                {analysis.detailedAnalysis}
              </p>
            ) : (
              <div className="space-y-2">
                <LoadingPlaceholder />
                <LoadingPlaceholder />
                <LoadingPlaceholder />
              </div>
            )}
          </div>
        </div>

        {showDebug && openaiDebug && (
          <DebugBox title="OpenAI Debug Info" data={openaiDebug} />
        )}

        {showDebug && analysis.debug && (
          <DebugBox title="API Debug Info" data={analysis.debug} />
        )}
      </div>
    </div>
  );
};

export default ResultsView;