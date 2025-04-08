import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, Settings } from 'lucide-react';
import { useRagPipeline } from "@/hooks/use-rag-pipeline";

interface SidebarProps {
  position: 'left' | 'right';
  title: string;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ position, title, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { processDocument, isPreparing } = useRagPipeline();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      alert('Please upload a markdown file');
      return;
    }
    
    processDocument(file, {
      chunkSize: 1024,
      overlap: 200,
      cleaner: 'simple',
      strategy: 'fixed',
      model: 'gpt-3.5-turbo'
    }).catch(error => {
      console.error('Error processing document:', error);
      alert('Failed to process document. Please try again.');
    });
  };

  if (collapsed) {
    return (
      <div className={`sidebar w-16 elevation-2 ${position === 'left' ? 'border-r' : 'border-l'} border-dark-700`}>
        <div className="flex justify-center py-6">
          <button
            onClick={() => setCollapsed(false)}
            className="btn btn-icon-sm"
            aria-label={position === 'left' ? 'Expand sidebar' : 'Expand sidebar'}
          >
            {position === 'left' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-icon-sm glow-hover-primary"
            title="Upload Document"
          >
            <Upload size={18} />
          </button>
          
          <button
            className="btn btn-icon-sm glow-hover-primary"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.markdown"
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`sidebar w-80 elevation-2 ${position === 'left' ? 'border-r' : 'border-l'} border-dark-700`}>
      <div className="sidebar-header">
        <h2 className="text-lg font-semibold text-dark-50">{title}</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="btn btn-icon-sm"
          aria-label={position === 'left' ? 'Collapse sidebar' : 'Collapse sidebar'}
        >
          {position === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;