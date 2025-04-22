import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    
    // Force a rerender to show the selected file
    // In a real application, we might save the file in a state
    const fileInput = event.target;
    setTimeout(() => {
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }, 10);
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
    if (!fileInputRef.current?.files?.length) {
      toast({
        title: "No file selected",
        description: "Please select a file to vectorize first",
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
      
      // Use the actual file selected by the user
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      
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
        <div className="mb-3">
          <h3 className="text-sm font-medium text-dark-100 mb-2">Step 1: Upload a document</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isPreparing}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".md,.markdown,.txt,.pdf"
              className="hidden"
            />
          </div>
          {fileInputRef.current?.files?.length ? (
            <div className="mt-2 text-xs text-blue-400">
              Selected: {fileInputRef.current.files[0].name}
            </div>
          ) : null}
        </div>
        <h3 className="text-sm font-medium text-dark-100 mb-2">Step 2: Configure Settings</h3>
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
            
            {/* Create Vector Store button now moved to the top section */}
          </form>
        </Form>
      </div>
        <div>
          <h3 className="text-sm font-medium text-dark-100 mb-2">Step 3: Vectorize</h3>
          <Button 
            variant="default" 
            className="w-full"
            onClick={form.handleSubmit(handleCreateVectorStore)}
            disabled={isPreparing || !fileInputRef.current?.files?.length || !form.watch('embeddingModel') || !form.watch('vectorDb')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Create Vector Store
          </Button>
          {isPreparing && (
            <div className="mt-2 text-xs text-amber-400 flex items-center animate-pulse">
              <span className="mr-1">●</span> Processing document...
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
