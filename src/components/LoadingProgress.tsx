import React from 'react';
import { Globe, History, Search, Calculator, BarChart } from 'lucide-react';
import type { AnalysisStage } from '../types';

interface Props {
  domain: string;
  completedStages: Set<AnalysisStage>;
  progress: number;
}

const stages: AnalysisStage[] = ['whois', 'traffic', 'keywords', 'seo', 'valuation'];

const stageInfo = {
  whois: {
    icon: History,
    title: 'Domain History',
    message: 'Checking domain age and registration details...'
  },
  traffic: {
    icon: Globe,
    title: 'Traffic Analysis',
    message: 'Analyzing historical traffic patterns and trends...'
  },
  keywords: {
    icon: Search,
    title: 'Keyword Research',
    message: 'Identifying valuable keyword opportunities...'
  },
  seo: {
    icon: BarChart,
    title: 'SEO Analysis',
    message: 'Evaluating search engine optimization metrics...'
  },
  valuation: {
    icon: Calculator,
    title: 'Value Estimation',
    message: 'Processing market data for precise valuation...'
  }
};

const LoadingProgress: React.FC<Props> = ({ domain, completedStages, progress }) => {
  // Get current active stage for message display
  const currentStage = stages.find(stage => !completedStages.has(stage)) || stages[stages.length - 1];
  const currentMessage = stageInfo[currentStage].message;

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
          {stages.map((stage) => {
            const StageIcon = stageInfo[stage].icon;
            const isCompleted = completedStages.has(stage);
            const isValuation = stage === 'valuation';
            
            // A stage is active if it's not completed and either:
            // - it's not the valuation stage (all initial stages run in parallel)
            // - or it's the valuation stage and all other stages are complete
            const isActive = !isCompleted && (!isValuation || completedStages.size === stages.length - 1);
            
            // Only dim the valuation stage when it can't start yet
            const isDimmed = isValuation && completedStages.size < stages.length - 1;
            
            return (
              <div 
                key={stage}
                className={`flex flex-col items-center ${
                  isDimmed ? 'text-gray-300' : 'text-indigo-600'
                }`}
              >
                <div className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-indigo-100' : isCompleted ? 'bg-indigo-50' : 'bg-gray-50'}
                  transition-colors duration-300
                `}>
                  {/* Pulsing outline for active stage */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-full animate-[ping_1.5s_ease-in-out_infinite] bg-indigo-400/30" />
                      <div className="absolute inset-0 rounded-full animate-[ping_1.5s_ease-in-out_infinite_0.5s] bg-indigo-400/20" />
                    </>
                  )}
                  <StageIcon className={`w-5 h-5 sm:w-6 sm:h-6 relative ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                <div className="mt-2 text-xs sm:text-sm font-medium hidden sm:block">
                  {stageInfo[stage].title}
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

        <div className="rounded-lg p-4 bg-indigo-50">
          <p className="text-sm sm:text-base font-medium text-indigo-700">
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingProgress;