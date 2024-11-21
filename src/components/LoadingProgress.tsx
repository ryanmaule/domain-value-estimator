import React from 'react';
import { Globe, History, Search, Calculator, BarChart } from 'lucide-react';

export type AnalysisStage = 
  | 'whois'
  | 'traffic'
  | 'keywords'
  | 'seo'
  | 'valuation';

interface Props {
  domain: string;
  stage: AnalysisStage;
  message?: string;
  retryCount?: number;
}

const stages: AnalysisStage[] = ['whois', 'traffic', 'keywords', 'seo', 'valuation'];

const stageInfo = {
  whois: {
    icon: History,
    title: 'Domain History',
    message: 'Checking domain age and registration details...',
    retryMessage: 'Retrying domain history check...'
  },
  traffic: {
    icon: Globe,
    title: 'Traffic Analysis',
    message: 'Analyzing historical traffic patterns and trends...',
    retryMessage: 'Retrying traffic analysis...'
  },
  keywords: {
    icon: Search,
    title: 'Keyword Research',
    message: 'Identifying valuable keyword opportunities...',
    retryMessage: 'Retrying keyword analysis...'
  },
  seo: {
    icon: BarChart,
    title: 'SEO Analysis',
    message: 'Evaluating search engine optimization metrics...',
    retryMessage: 'Retrying SEO analysis...'
  },
  valuation: {
    icon: Calculator,
    title: 'Value Estimation',
    message: 'Processing market data for precise valuation...',
    retryMessage: 'Retrying value estimation...'
  }
};

const LoadingProgress: React.FC<Props> = ({ domain, stage, message, retryCount = 0 }) => {
  const currentIndex = stages.indexOf(stage);
  const progress = ((currentIndex + 1) / stages.length) * 100;

  // Get appropriate message based on retry status
  const getStageMessage = () => {
    if (message) return message;
    if (retryCount > 0) return stageInfo[stage].retryMessage;
    return stageInfo[stage].message;
  };

  return (
    <div className="w-full max-w-2xl text-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Analyzing {domain}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-8">
          Our AI is analyzing multiple factors including domain age, traffic patterns,
          keyword potential, and market trends to generate an accurate valuation.
        </p>
        
        <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-8">
          {stages.map((s, index) => {
            const StageIcon = stageInfo[s].icon;
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isRetrying = isCurrent && retryCount > 0;
            
            return (
              <div 
                key={s}
                className={`flex flex-col items-center ${
                  isActive ? 'text-indigo-600' : 'text-gray-300'
                }`}
              >
                <div className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  ${isRetrying ? 'bg-yellow-100' : isCurrent ? 'bg-indigo-100' : isActive ? 'bg-indigo-50' : 'bg-gray-50'}
                  transition-colors duration-300
                `}>
                  {/* Pulsing outline for current stage */}
                  {isCurrent && (
                    <>
                      <div className="absolute inset-0 rounded-full animate-[ping_1.5s_ease-in-out_infinite] bg-indigo-400/30" />
                      <div className="absolute inset-0 rounded-full animate-[ping_1.5s_ease-in-out_infinite_0.5s] bg-indigo-400/20" />
                    </>
                  )}
                  <StageIcon className={`w-5 h-5 sm:w-6 sm:h-6 relative ${isRetrying ? 'animate-spin' : isCurrent ? 'animate-pulse' : ''}`} />
                </div>
                <div className="mt-2 text-xs sm:text-sm font-medium hidden sm:block">
                  {stageInfo[s].title}
                  {isRetrying && <span className="text-yellow-600"> (Retry {retryCount})</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`rounded-lg p-4 ${retryCount > 0 ? 'bg-yellow-50' : 'bg-indigo-50'}`}>
          <p className={`text-sm sm:text-base font-medium ${retryCount > 0 ? 'text-yellow-700' : 'text-indigo-700'}`}>
            {getStageMessage()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingProgress;