import * as React from 'react';
import { Button } from './ui/button';
import { Upload, FileDown, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRagPipeline } from '../hooks/use-rag-pipeline';

interface HeaderProps {
  backendStatus: string;
}

interface Document {
  id: string;
  title: string;
}

export function Header({ backendStatus }: HeaderProps) {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { processDocument, isPreparing } = useRagPipeline();

  // This would typically fetch documents from the API
  // Since we don't have a "list documents" endpoint, we'll simulate it
  React.useEffect(() => {
    // Placeholder for demo purposes
    const mockDocuments = [
      { id: 'doc1', title: 'Sample Document 1' },
      { id: 'doc2', title: 'Machine Learning Basics' },
      { id: 'doc3', title: 'Vector Database Guide' }
    ];
    setDocuments(mockDocuments);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const validExtensions = [".md", ".markdown", ".txt", ".pdf"];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      alert("Please upload a markdown, text, or PDF file");
      return;
    }
    
    processDocument(file, {
      chunkSize: 1024,
      overlap: 200,
      cleaner: "simple",
      strategy: "fixed",
      model: "gpt-3.5-turbo"
    }).then(docId => {
      // Add the new document to the list with a mock title
      const newDoc = {
        id: docId || 'unknown',
        title: file.name.replace(/\.[^/.]+$/, '') // Remove extension
      };
      setDocuments(prev => [...prev, newDoc]);
      setSelectedDocument(newDoc.id);
    }).catch(error => {
      console.error("Error processing document:", error);
      alert("Failed to process document. Please try again.");
    });
  };

  const handleSelectDocument = (value: string) => {
    setSelectedDocument(value);
    // Here you would typically load the selected document's context
    console.log(`Selected document: ${value}`);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-dark-50">RAG Explorer</h1>
        <span className={`px-2 py-1 text-xs rounded-full ${backendStatus.includes('Connected') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {backendStatus}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {documents.length > 0 && (
          <Select value={selectedDocument} onValueChange={handleSelectDocument}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map(doc => (
                <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Button 
          variant="default" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isPreparing}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.markdown,.txt,.pdf"
          className="hidden"
        />
      </div>
    </div>
  );
}
