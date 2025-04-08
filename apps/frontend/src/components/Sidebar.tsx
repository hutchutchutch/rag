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
      <div className={`w-16 bg-[#1A1A1A] h-screen flex flex-col items-center pt-6 ${position === 'left' ? 'border-r' : 'border-l'} border-gray-800`}>
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 hover:bg-[#252525] rounded-lg transition-colors text-gray-400 hover:text-gray-200"
        >
          {position === 'left' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-[#252525] rounded-lg transition-colors text-gray-400 hover:text-gray-200"
            title="Upload Document"
          >
            <Upload size={20} />
          </button>
          
          <button
            className="p-2 hover:bg-[#252525] rounded-lg transition-colors text-gray-400 hover:text-gray-200"
            title="Settings"
          >
            <Settings size={20} />
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
    <div className={`w-80 bg-[#1A1A1A] h-screen flex flex-col ${position === 'left' ? 'border-r' : 'border-l'} border-gray-800`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="p-2 hover:bg-[#252525] rounded-lg transition-colors text-gray-400 hover:text-gray-200"
        >
          {position === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;