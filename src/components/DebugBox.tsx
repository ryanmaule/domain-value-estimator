import React from 'react';

interface Props {
  title: string;
  data: any;
}

const DebugBox: React.FC<Props> = ({ title, data }) => {
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DebugBox;