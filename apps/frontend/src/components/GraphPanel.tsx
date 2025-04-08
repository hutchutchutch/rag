import React from 'react';
import { Network, Share2, ZoomIn, ZoomOut, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GraphPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-primary-500" />
          <span className="text-sm font-medium text-dark-50">Knowledge Graph</span>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-icon-sm">
            <ZoomIn size={16} />
          </button>
          <button className="btn btn-icon-sm">
            <ZoomOut size={16} />
          </button>
          <button className="btn btn-icon-sm">
            <Filter size={16} />
          </button>
          <button className="btn btn-icon-sm">
            <Share2 size={16} />
          </button>
        </div>
      </div>
      
      <Card className="flex-1 elevation-2">
        <CardContent className="w-full h-full flex items-center justify-center">
          <div className="text-dark-300 text-center">
            <p className="text-sm">Graph visualization will appear here</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-dark-50">Selected Node</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-dark-400">No node selected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraphPanel;