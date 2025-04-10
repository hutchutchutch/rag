import * as React from "react";
import { 
  Loader2, 
  FileText, 
  FileQuestion, 
  LogIn, 
  RefreshCw, 
  CloudOff, 
  Download 
} from "lucide-react";
import { getGoogleDriveAuthUrl, listGoogleDriveFiles, importGoogleDriveFile } from "../lib/rag";
import { useRagPipeline } from "../hooks/use-rag-pipeline";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  imported?: boolean;
}

export function GoogleDrivePanel() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [files, setFiles] = React.useState<DriveFile[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [importingFileId, setImportingFileId] = React.useState<string | null>(null);
  
  // Use the current URL to check if we've just returned from OAuth flow
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get("auth") === "success";
    
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
      setError(err.message || "Failed to get authorization URL");
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
      setError(err.message || "Failed to list files");
      
      // If we get an auth error, set authenticated to false
      if (err.message.includes("Not authenticated") || err.message.includes("401")) {
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
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-dark-700 p-4">
          <h2 className="text-lg font-semibold text-dark-50">Google Drive</h2>
        </div>
        
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-dark-300">
          <CloudOff className="h-16 w-16 text-dark-400" />
          <p className="text-center">Connect to your Google Drive to import documents</p>
          
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center gap-2"
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
          </Button>
          
          {error && (
            <p className="mt-4 text-sm text-error-400">{error}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-dark-700 p-4">
        <h2 className="text-lg font-semibold text-dark-50">Google Drive</h2>
        
        <Button
          onClick={fetchFiles}
          disabled={isLoading}
          variant="ghost"
          size="icon"
          title="Refresh file list"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh files</span>
        </Button>
      </div>
      
      {error && (
        <div className="m-4 rounded-md border border-error-500/30 bg-error-500/10 p-3">
          <p className="text-sm text-error-400">{error}</p>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        {isLoading && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-dark-300">
            <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
            <p>Loading files from Google Drive...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-dark-300">
            <FileQuestion className="h-10 w-10 text-dark-400" />
            <p>No markdown files found in your Google Drive</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className={`flex items-center justify-between p-3 transition-colors hover:bg-dark-800 ${
                  file.imported ? "border-success-500/50 bg-success-500/10" : ""
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 shrink-0 text-dark-300" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-dark-100">{file.name}</p>
                    <p className="text-xs text-dark-400">
                      Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleImport(file.id)}
                  disabled={importingFileId === file.id || file.imported}
                  size="sm"
                  variant={file.imported ? "success" : "default"}
                  className="ml-2 shrink-0"
                >
                  {importingFileId === file.id ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : file.imported ? (
                    <span>Imported</span>
                  ) : (
                    <>
                      <Download className="mr-1 h-3 w-3" />
                      <span>Import</span>
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}