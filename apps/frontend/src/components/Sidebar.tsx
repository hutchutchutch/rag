import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, File, Settings, Loader2, ChevronDown, Database, Search } from 'lucide-react';
import { useRagPipeline } from '../hooks/use-rag-pipeline';

interface SidebarProps {
  position: 'left' | 'right';
  title: string;
  children?: React.ReactNode;
}

interface DropdownMenuProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-dark-700 hover:bg-dark-600 p-3 rounded-t-md transition-colors cursor-pointer text-white"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="bg-dark-700 p-3 rounded-b-md border-t border-dark-600 w-full">
          {children}
        </div>
      )}
    </div>
  );
};

const defaultConfig = {
  chunkSize: 1000,
  overlap: 200,
  cleaner: 'simple' as const,
  strategy: 'fixed' as const,
  model: 'gemini',
};

const Sidebar: React.FC<SidebarProps> = ({ position, title, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { processDocument, isPreparing, currentStep, search, isSearching } = useRagPipeline();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    search(searchQuery)
      .then(results => {
        console.log('Search results:', results);
      })
      .catch(error => {
        console.error('Error searching:', error);
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
      
      <div className="flex-1 overflow-y-auto p-4">
        <DropdownMenu 
          title="Upload Document" 
          icon={<Upload size={18} />}
          defaultOpen={true}
        >
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
        </DropdownMenu>
        
        <DropdownMenu 
          title="Documents" 
          icon={<File size={18} />}
          defaultOpen={true}
        >
          <div className="space-y-2 w-full">
            <div className="bg-dark-600 hover:bg-dark-500 p-3 rounded-md transition-colors cursor-pointer flex items-center gap-2 w-full">
              <File size={16} className="text-gray-300 shrink-0" />
              <span className="text-gray-300 truncate">ansi.md</span>
            </div>
          </div>
        </DropdownMenu>
        
        <DropdownMenu 
          title="Vector Stores" 
          icon={<Database size={18} />}
        >
          <div className="space-y-3 w-full">
            <div className="bg-dark-600 p-3 rounded-md">
              <h4 className="text-sm font-medium text-white mb-2">Neo4j</h4>
              <div className="text-xs text-gray-400">
                <p>Status: Connected</p>
                <p>Vectors: 12</p>
              </div>
            </div>
            
            <div className="bg-dark-600 p-3 rounded-md">
              <h4 className="text-sm font-medium text-white mb-2">PostgreSQL</h4>
              <div className="text-xs text-gray-400">
                <p>Status: Connected</p>
                <p>Vectors: 12</p>
              </div>
            </div>
          </div>
        </DropdownMenu>
        
        <DropdownMenu 
          title="Search" 
          icon={<Search size={18} />}
        >
          <form onSubmit={handleSearch} className="w-full">
            <div className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search term..."
                className="w-full p-2 bg-dark-600 text-white rounded-md border border-dark-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
                isSearching || !searchQuery.trim()
                  ? 'bg-dark-600 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-700 hover:bg-primary-600 text-white'
              }`}
            >
              {isSearching ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
        </DropdownMenu>
        
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
};

export default Sidebar;