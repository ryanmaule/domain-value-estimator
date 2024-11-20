import React from 'react';
import { RotateCcw, Download, TrendingUp, Globe, Clock, Search, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import { toast } from 'react-hot-toast';
import type { DomainAnalysis } from '../types';
import DebugBox from './DebugBox';
import { getLastDebugResponse } from '../services/openaiService';

interface Props {
  analysis: DomainAnalysis;
  onReset: () => void;
}

const ResultsView: React.FC<Props> = ({ analysis, onReset }) => {
  const { toPDF, targetRef } = usePDF({filename: `${analysis.domain}-valuation.pdf`});
  const navigate = useNavigate();
  const isPro = false; // TODO: Replace with actual Pro status check
  const openaiDebug = getLastDebugResponse();
  const showDebug = import.meta.env.VITE_SHOW_DEBUG === 'true';

  const handleDownloadPDF = () => {
    if (isPro) {
      toPDF();
    } else {
      toast.error('PDF export is a Pro feature');
      navigate('/pricing');
    }
  };

  return (
    <div ref={targetRef} className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Domain Analysis Results</h2>
          <h1 className="text-4xl font-bold text-indigo-600 mt-2">{analysis.domain}</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleDownloadPDF}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isPro 
                ? 'text-indigo-600 hover:bg-indigo-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {isPro ? (
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

      {!isPro && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              <p className="text-gray-700">
                Upgrade to Pro for detailed PDF reports and unlimited domain analysis
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Estimated Value</h3>
          <div className="text-4xl font-bold">${analysis.estimatedValue.toLocaleString()}</div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="text-indigo-200">Confidence Score:</div>
            <div className="font-semibold">{analysis.confidenceScore}%</div>
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
              <div className="text-xl font-semibold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Suggested Keywords</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.suggestedKeywords.map((keyword, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{keyword.keyword}</div>
                <div className="text-sm text-gray-600">
                  <span>Volume: {keyword.searchVolume}</span>
                  <span className="mx-2">•</span>
                  <span>Difficulty: {keyword.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-line">{analysis.detailedAnalysis}</p>
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