import React from 'react';
import { ChevronLeft, ChevronRight, Upload, File, Settings, Loader2 } from 'lucide-react';
import { useRagPipeline } from '../hooks/use-rag-pipeline';

interface SidebarProps {
  position: 'left' | 'right';
  title: string;
  children?: React.ReactNode;
}

const defaultConfig = {
  chunkSize: 1000,
  overlap: 200,
  cleaner: 'simple' as const,
  strategy: 'fixed' as const,
  model: 'gemini',
};

const Sidebar: React.FC<SidebarProps> = ({ position, title, children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { processDocument, isPreparing, currentStep } = useRagPipeline();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is markdown
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      alert('Please upload a markdown file');
      return;
    }
    
    // Process document
    processDocument(file, defaultConfig)
      .then(docId => {
        console.log('Document processed:', docId);
      })
      .catch(error => {
        console.error('Error processing document:', error);
        alert('Failed to process document. Please try again.');
      });
  };

  if (collapsed) {
    return (
      <div className={`sidebar transition-all duration-300 w-16 bg-dark-800 h-screen ${position === 'left' ? 'border-r' : 'border-l'} border-dark-600`}>
        <div className="flex flex-col items-center pt-6 gap-6">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            {position === 'left' 
              ? <ChevronRight size={20} />
              : <ChevronLeft size={20} />
            }
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            <Upload size={20} />
          </button>
          <button
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            <Settings size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.markdown"
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`sidebar transition-all duration-300 w-80 bg-dark-800 h-screen flex flex-col ${
        position === 'left' ? 'border-r' : 'border-l'
      } border-dark-600`}
    >
      <div className="flex items-center justify-between p-4 border-b border-dark-600">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-300 hover:text-white"
        >
          {position === 'left' 
            ? <ChevronLeft size={20} />
            : <ChevronRight size={20} />
          }
        </button>
      </div>
      
      <div className="p-4">
        <div className="bg-dark-700 p-4 rounded-lg mb-4">
          <h3 className="text-white font-medium mb-2">Upload Document</h3>
          <p className="text-gray-300 text-sm mb-4">
            Upload a markdown file to process through the RAG pipeline.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPreparing}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
              isPreparing
                ? 'bg-dark-600 text-gray-400 cursor-not-allowed'
                : 'bg-primary-700 hover:bg-primary-600 text-white'
            }`}
          >
            {isPreparing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{currentStep || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Select File</span>
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.markdown"
            className="hidden"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* List of uploaded documents - for now just show ansi.md by default */}
        <h3 className="text-white font-medium mb-2">Documents</h3>
        <div className="space-y-2">
          <div className="bg-dark-700 hover:bg-dark-600 p-3 rounded-md transition-colors cursor-pointer flex items-center gap-2">
            <File size={16} className="text-gray-300" />
            <span className="text-gray-300">ansi.md</span>
          </div>
        </div>
        
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
};

export default Sidebar;