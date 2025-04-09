import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBookContext } from "@/contexts/book-context";
import { useRagPipeline } from "@/hooks/use-rag-pipeline";
import { ChunkingStrategy, CleanerType } from "@/lib/rag";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { embeddingFormSchema, FormValues, SectionConfig, EmbeddingConfig } from "./types";
import { PrimaryOptionsSection } from "./PrimaryOptionsSection";
import { TextProcessingSection } from "./TextProcessingSection";
import { EmbeddingConfigSection } from "./EmbeddingConfigSection";
import { MetadataOptionsSection } from "./MetadataOptionsSection";
import { AdvancedSettingsSection } from "./AdvancedSettingsSection";
import { ChunkPreviewSection } from "./ChunkPreviewSection";
import { CollapsibleSection } from "./CollapsibleSection";

export function VectorStoreCreator() {
  const { selectedBook } = useBookContext();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    primary: true,
    textProcessing: false,
    embeddingConfig: false,
    metadata: false,
    advanced: false,
  });
  
  const { 
    isPreparing, 
    currentStep, 
    processDocument: prepareRagPipeline,
    currentChunk,
    allChunks,
    navigateToChunk,
  } = useRagPipeline();

  const form = useForm<FormValues>({
    resolver: zodResolver(embeddingFormSchema),
    defaultValues: {
      chunkSize: 1024,
      overlap: 200,
      cleaner: "simple",
      strategy: "recursive",
      model: "text-embedding-ada-002",
      vectorDb: "pgvector",
      embeddingModel: "openai",
      specialContentHandling: "keep-tables",
      documentPreprocessing: ["clean-formatting"],
      modelDimensions: "1536",
      contextualSetting: "with-context",
      batchSize: 32,
      metadataExtraction: ["page-numbers", "section-titles"],
      storeOriginalText: true,
      documentStructure: "preserve-hierarchy",
      languageProcessing: "auto-detect",
      qualityControl: ["remove-duplicates"],
      dimensionReduction: "none",
      contentEnrichment: [],
      distanceMetric: "cosine",
    },
  } as const);

  // Track form completion by section
  const sections: SectionConfig[] = [
    {
      title: "Primary Options",
      key: "primary",
      optionsCount: 2,
      completedOptions: [
        form.watch("vectorDb"),
        form.watch("embeddingModel")
      ].filter(Boolean).length
    },
    {
      title: "Text Processing",
      key: "textProcessing",
      optionsCount: 5,
      completedOptions: [
        form.watch("chunkSize"),
        form.watch("overlap"),
        form.watch("strategy"),
        form.watch("specialContentHandling"),
        form.watch("documentPreprocessing")?.length
      ].filter(Boolean).length
    },
    {
      title: "Embedding Configuration",
      key: "embeddingConfig",
      optionsCount: 3,
      completedOptions: [
        form.watch("modelDimensions"),
        form.watch("contextualSetting"),
        form.watch("batchSize")
      ].filter(Boolean).length
    },
    {
      title: "Metadata Options",
      key: "metadata",
      optionsCount: 4,
      completedOptions: [
        form.watch("metadataExtraction")?.length,
        form.watch("storeOriginalText") !== undefined,
        form.watch("documentStructure")
      ].filter(Boolean).length
    },
    {
      title: "Advanced Settings",
      key: "advanced",
      optionsCount: 5,
      completedOptions: [
        form.watch("languageProcessing"),
        form.watch("qualityControl")?.length,
        form.watch("dimensionReduction"),
        form.watch("contentEnrichment")?.length,
        form.watch("distanceMetric")
      ].filter(Boolean).length
    }
  ];

  // Calculate overall progress
  const totalOptions = sections.reduce((acc, section) => acc + section.optionsCount, 0);
  const completedOptions = sections.reduce((acc, section) => acc + section.completedOptions, 0);
  const progressPercentage = Math.round((completedOptions / totalOptions) * 100);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      // Convert to EmbeddingConfig type
      const config: EmbeddingConfig = {
        chunkSize: values.chunkSize,
        overlap: values.overlap,
        cleaner: values.cleaner as CleanerType,
        strategy: values.strategy as ChunkingStrategy,
        model: values.model
      };
      
      // Using File object for the first parameter as expected by the hook
      const file = new File([""], selectedBook.id);
      await prepareRagPipeline(file, config);
      
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-2 text-white">Vector Store Creation</h2>
        
        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Configuration Progress</span>
            <span className="text-xs font-medium text-gray-300">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Form Sections */}
        <Form 
          form={form} 
          onSubmit={form.handleSubmit(handleCreateVectorStore)} 
          className="space-y-4"
        >
          {/* Primary Options (Always Visible) */}
          <PrimaryOptionsSection 
            form={form} 
            completedOptions={sections[0].completedOptions} 
            optionsCount={sections[0].optionsCount} 
          />
          
          {/* Text Processing */}
          <CollapsibleSection
            title={sections[1].title}
            sectionKey={sections[1].key}
            isOpen={expandedSections.textProcessing}
            onToggle={toggleSection}
            completedOptions={sections[1].completedOptions}
            optionsCount={sections[1].optionsCount}
          >
            <TextProcessingSection form={form} />
          </CollapsibleSection>
          
          {/* Embedding Configuration */}
          <CollapsibleSection
            title={sections[2].title}
            sectionKey={sections[2].key}
            isOpen={expandedSections.embeddingConfig}
            onToggle={toggleSection}
            completedOptions={sections[2].completedOptions}
            optionsCount={sections[2].optionsCount}
          >
            <EmbeddingConfigSection form={form} />
          </CollapsibleSection>
          
          {/* Metadata Options */}
          <CollapsibleSection
            title={sections[3].title}
            sectionKey={sections[3].key}
            isOpen={expandedSections.metadata}
            onToggle={toggleSection}
            completedOptions={sections[3].completedOptions}
            optionsCount={sections[3].optionsCount}
          >
            <MetadataOptionsSection form={form} />
          </CollapsibleSection>
          
          {/* Advanced Settings */}
          <CollapsibleSection
            title={sections[4].title}
            sectionKey={sections[4].key}
            isOpen={expandedSections.advanced}
            onToggle={toggleSection}
            completedOptions={sections[4].completedOptions}
            optionsCount={sections[4].optionsCount}
          >
            <AdvancedSettingsSection form={form} />
          </CollapsibleSection>
          
          {/* Create Vector Store Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#303030] hover:bg-[#404040] text-white animated-border"
            disabled={isPreparing || !selectedBook}
          >
            {isPreparing ? "Processing..." : "Create Vector Store"}
          </Button>
        </Form>
      </div>
      
      {/* Chunk Preview (show when processing is complete) */}
      <div className="flex-1 overflow-auto p-4">
        <ChunkPreviewSection 
          currentChunk={currentChunk} 
          allChunks={allChunks} 
          navigateToChunk={navigateToChunk} 
        />
      </div>
    </div>
  );
}
