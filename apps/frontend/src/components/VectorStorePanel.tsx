import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBookContext } from "@/contexts/book-context";
import { useRagPipeline } from "@/hooks/use-rag-pipeline";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { embeddingFormSchema, FormValues } from "./vector-store/types";
import { useState } from "react";
import { CollapsibleSection } from "./vector-store/CollapsibleSection";
import { 
  EmbeddingModelSection, 
  VectorDbSection, 
  ChunkingSection 
} from "./vector-store";
import { Upload, CheckCircle } from "lucide-react";

export default function VectorStorePanel() {
  const { selectedBook } = useBookContext();
  const { toast } = useToast();
  const { isPreparing, processDocument: prepareRagPipeline } = useRagPipeline();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const validExtensions = [".md", ".markdown", ".txt", ".pdf"];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      toast({
        title: "Invalid file format",
        description: "Please upload a markdown, text, or PDF file",
        variant: "destructive"
      });
      return;
    }
    
    // Add to document list and set as selected book
    const newBook = {
      id: file.name,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      path: URL.createObjectURL(file)
    };
    
    // Set the selected book in the context
    const { setSelectedBook } = useBookContext();
    setSelectedBook(newBook);
  };
  const [openSections, setOpenSections] = useState({
    database: true,
    embedding: false,
    chunking: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(embeddingFormSchema),
    defaultValues: {
      embeddingModel: "text-embedding-ada-002",
      vectorDb: "pgvector",
      chunkSize: 1024,
      chunkOverlap: 20,
      chunkingMethod: "recursive",
      extractMetadata: ["page-numbers", "section-titles"],
      textCleaning: ["remove-special-chars", "remove-extra-whitespace"],
      removeStopwords: true,
      useLemmatization: true,
    },
  });

  // Watch for selected embedding model
  const selectedEmbeddingModel = form.watch('embeddingModel');

  const handleCreateVectorStore = async (values: FormValues) => {
    if (!selectedBook) {
      toast({
        title: "No book selected",
        description: "Please upload or select a book first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert form values to EmbeddingConfig
      const embeddingConfig = {
        chunkSize: values.chunkSize,
        overlap: values.chunkOverlap,
        cleaner: 'advanced' as const, // Always use advanced cleaning
        strategy: values.chunkingMethod === 'recursive' 
          ? 'recursive' as const 
          : values.chunkingMethod === 'paragraph' 
            ? 'semantic' as const 
            : 'fixed' as const,
        model: values.embeddingModel
      };
      
      const file = new File([""], selectedBook.id);
      await prepareRagPipeline(file, embeddingConfig);
      
      toast({
        title: "Processing complete",
        description: "Vector store created successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred during vector store creation",
        variant: "destructive",
      });
    }
  };

  const handleToggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-dark-600">
        <h2 className="text-lg font-semibold text-white">Vector Store Configuration</h2>
      </div>
      <div className="p-3 border-b border-dark-600">
        {!selectedBook ? (
          <Button 
            variant="default" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isPreparing}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        ) : (
          <div className="bg-dark-900 p-2 rounded-md border border-dark-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-white">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm truncate max-w-[190px]">
                  {selectedBook.title}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 h-7 text-xs"
              >
                Change
              </Button>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.markdown,.txt,.pdf"
          className="hidden"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateVectorStore)}>
            <div className="space-y-3 mb-4">
              <CollapsibleSection
                title="Vector Database"
                sectionKey="database"
                isOpen={openSections.database}
                onToggle={handleToggleSection}
                completedOptions={1}
                optionsCount={1}
              >
                <VectorDbSection form={form} />
              </CollapsibleSection>
              
              <CollapsibleSection
                title="Embedding Model"
                sectionKey="embedding"
                isOpen={openSections.embedding}
                onToggle={handleToggleSection}
                completedOptions={selectedEmbeddingModel ? 1 : 0}
                optionsCount={1}
              >
                <EmbeddingModelSection form={form} />
              </CollapsibleSection>
              
              <CollapsibleSection
                title="Chunking"
                sectionKey="chunking"
                isOpen={openSections.chunking}
                onToggle={handleToggleSection}
                completedOptions={3}
                optionsCount={3}
              >
                <ChunkingSection form={form} />
              </CollapsibleSection>
            </div>
            
            <div className="mt-6 sticky bottom-3 z-10">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPreparing || !selectedBook || !form.watch('embeddingModel') || !form.watch('vectorDb')}
              >
                {isPreparing ? "Processing..." : "Create Vector Store"}
              </Button>
              {!selectedBook && (
                <p className="text-sm text-red-500 mt-2 text-center">Please select a document first</p>
              )}
              {selectedBook && !form.watch('embeddingModel') && (
                <p className="text-sm text-amber-500 mt-2 text-center">Select an embedding model</p>
              )}
              {selectedBook && !form.watch('vectorDb') && (
                <p className="text-sm text-amber-500 mt-2 text-center">Select a vector database</p>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
