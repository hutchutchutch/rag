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
  ChunkingSection, 
  PreprocessingSection 
} from "./vector-store";

export default function VectorStorePanel() {
  const { selectedBook } = useBookContext();
  const { toast } = useToast();
  const { isPreparing, processDocument: prepareRagPipeline } = useRagPipeline();
  const [openSections, setOpenSections] = useState({
    embedding: true,
    database: false,
    chunking: false,
    preprocessing: false,
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
      removeStopwords: false,
      useLemmatization: false,
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
        cleaner: 'simple' as const,
        strategy: values.chunkingMethod === 'recursive' ? 'recursive' as const : 'fixed' as const,
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
      <div className="flex-1 overflow-y-auto p-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateVectorStore)}>
            <div className="space-y-3 mb-4">
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
                title="Chunking"
                sectionKey="chunking"
                isOpen={openSections.chunking}
                onToggle={handleToggleSection}
                completedOptions={3}
                optionsCount={4}
              >
                <ChunkingSection form={form} />
              </CollapsibleSection>
              
              <CollapsibleSection
                title="Text Processing"
                sectionKey="preprocessing"
                isOpen={openSections.preprocessing}
                onToggle={handleToggleSection}
                completedOptions={2}
                optionsCount={3}
              >
                <PreprocessingSection form={form} />
              </CollapsibleSection>
            </div>
            
            <div className="mt-6 sticky bottom-3 z-10">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPreparing || !selectedBook}
              >
                {isPreparing ? "Processing..." : "Create Vector Store"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
