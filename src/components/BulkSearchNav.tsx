import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  domains: string[];
  currentDomain: string;
  onSelect: (domain: string) => void;
}

const BulkSearchNav: React.FC<Props> = ({ domains, currentDomain, onSelect }) => {
  const currentIndex = domains.indexOf(currentDomain);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSelect(domains[currentIndex - 1])}
          disabled={currentIndex === 0}
          className="p-2 text-gray-600 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 px-4">
          <select
            value={currentDomain}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 text-center mt-1">
            Domain {currentIndex + 1} of {domains.length}
          </div>
        </div>

        <button
          onClick={() => onSelect(domains[currentIndex + 1])}
          disabled={currentIndex === domains.length - 1}
          className="p-2 text-gray-600 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BulkSearchNav;