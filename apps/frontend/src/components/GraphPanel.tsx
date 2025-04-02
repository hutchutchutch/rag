import React from 'react';
import { Network, Share2, ZoomIn, ZoomOut, Filter } from 'lucide-react';

const GraphPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-primary-400" />
          <span className="text-sm font-medium text-gray-200">Knowledge Graph</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-gray-200">
            <ZoomIn size={18} />
          </button>
          <button className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-gray-200">
            <ZoomOut size={18} />
          </button>
          <button className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-gray-200">
            <Filter size={18} />
          </button>
          <button className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-gray-200">
            <Share2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-dark-700 rounded-lg border border-dark-600 p-4">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <p className="text-sm">Graph visualization will appear here</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
          <h4 className="text-sm font-medium text-gray-200 mb-2">Selected Node</h4>
          <p className="text-sm text-gray-400">No node selected</p>
        </div>
      </div>
    </div>
  );
};

export default GraphPanel;