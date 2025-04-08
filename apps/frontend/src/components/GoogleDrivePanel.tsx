import React, { useState, useEffect } from 'react';
import { Loader2, FileText, FileQuestion, LogIn, RefreshCw, CloudOff, Download } from 'lucide-react';
import { getGoogleDriveAuthUrl, listGoogleDriveFiles, importGoogleDriveFile } from '../lib/rag';
import { useRagPipeline } from '../hooks/use-rag-pipeline';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const GoogleDrivePanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  
  // Use the current URL to check if we've just returned from OAuth flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth') === 'success';
    
    if (authSuccess) {
      setIsAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch files
      fetchFiles();
    }
  }, []);
  
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authUrl = await getGoogleDriveAuthUrl();
      // Redirect to Google auth
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to get authorization URL');
      setIsLoading(false);
    }
  };
  
  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filesList = await listGoogleDriveFiles();
      setFiles(filesList);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to list files');
      
      // If we get an auth error, set authenticated to false
      if (err.message.includes('Not authenticated') || err.message.includes('401')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImport = async (fileId: string) => {
    setImportingFileId(fileId);
    setError(null);
    
    try {
      await importGoogleDriveFile(fileId);
      // Update the file list to show it's been imported
      setFiles(files.map(file => 
        file.id === fileId 
          ? { ...file, imported: true } 
          : file
      ));
    } catch (err: any) {
      setError(`Failed to import file: ${err.message}`);
    } finally {
      setImportingFileId(null);
    }
  };
  
  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Google Drive Import</h3>
        
        <div className="text-center py-8">
          <CloudOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-300 mb-6">Connect to your Google Drive to import markdown documents</p>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Connect to Google Drive</span>
              </>
            )}
          </button>
          
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Google Drive Files</h3>
        
        <button
          onClick={fetchFiles}
          disabled={isLoading}
          className="p-2 hover:bg-dark-700 rounded-md text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh file list"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {isLoading && files.length === 0 ? (
        <div className="py-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500 mb-4" />
          <p className="text-gray-400">Loading files from Google Drive...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="py-10 text-center">
          <FileQuestion className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-400">No markdown files found in your Google Drive</p>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-md hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-center">
                <FileText size={16} className="text-gray-400 mr-3 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-gray-400 text-xs">
                    Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleImport(file.id)}
                disabled={importingFileId === file.id}
                className="ml-2 p-2 bg-primary-700 hover:bg-primary-600 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {importingFileId === file.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Import</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleDrivePanel;