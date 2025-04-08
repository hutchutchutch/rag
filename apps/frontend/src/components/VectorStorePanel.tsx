import React, { useState } from 'react';
import { Upload, FileText, Trash2, Search, Settings, ChevronDown, Info } from 'lucide-react';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBookContext } from "@contexts/book-context";
import { useRagPipeline } from "@hooks/use-rag-pipeline";
import { ChunkingStrategy, CleanerType, EmbeddingConfig } from "@lib/rag";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import { Progress } from "@ui/progress";
import { Card, CardContent } from "@ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { useToast } from "@hooks/use-toast";

const embeddingFormSchema = z.object({
  chunkSize: z.coerce.number().min(100).max(8000),
  overlap: z.coerce.number().min(0).max(1000),
  cleaner: z.string(),
  strategy: z.string(),
  model: z.string(),
  vectorDb: z.string(),
  embeddingModel: z.string(),
  specialContentHandling: z.string().optional(),
  documentPreprocessing: z.array(z.string()).optional(),
  modelDimensions: z.string().optional(),
  contextualSetting: z.string().optional(),
  batchSize: z.coerce.number().optional(),
  metadataExtraction: z.array(z.string()).optional(),
  storeOriginalText: z.boolean().optional(),
  documentStructure: z.string().optional(),
  languageProcessing: z.string().optional(),
  qualityControl: z.array(z.string()).optional(),
  dimensionReduction: z.string().optional(),
  contentEnrichment: z.array(z.string()).optional(),
  distanceMetric: z.string().optional(),
  processingAllocation: z.string().optional(),
  parallelThreads: z.coerce.number().optional(),
  errorHandling: z.string().optional(),
});

type FormValues = z.infer<typeof embeddingFormSchema>;

interface SectionConfig {
  title: string;
  optionsCount: number;
  completedOptions: number;
  key: string;
}

const VectorStorePanel: React.FC = () => {
  const { selectedBook } = useBookContext();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    textProcessing: false,
    embeddingConfig: false,
    metadata: false,
    advanced: false,
    system: false,
  });
  
  const { 
    isPreparing, 
    currentStep, 
    prepareRagPipeline,
    currentChunk,
    allChunks,
    navigateToChunk,
  } = useRagPipeline();

  const methods = useForm<FormValues>({
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
      processingAllocation: "cpu",
      parallelThreads: 4,
      errorHandling: "skip-problematic",
    },
  });

  const sections: SectionConfig[] = [
    {
      title: "Primary Options",
      key: "primary",
      optionsCount: 2,
      completedOptions: [
        methods.watch("vectorDb"),
        methods.watch("embeddingModel")
      ].filter(Boolean).length
    },
    {
      title: "Text Processing",
      key: "textProcessing",
      optionsCount: 5,
      completedOptions: [
        methods.watch("chunkSize"),
        methods.watch("overlap"),
        methods.watch("strategy"),
        methods.watch("specialContentHandling"),
        methods.watch("documentPreprocessing")?.length
      ].filter(Boolean).length
    },
    {
      title: "Embedding Configuration",
      key: "embeddingConfig",
      optionsCount: 3,
      completedOptions: [
        methods.watch("modelDimensions"),
        methods.watch("contextualSetting"),
        methods.watch("batchSize")
      ].filter(Boolean).length
    },
    {
      title: "Metadata Options",
      key: "metadata",
      optionsCount: 4,
      completedOptions: [
        methods.watch("metadataExtraction")?.length,
        methods.watch("storeOriginalText") !== undefined,
        methods.watch("documentStructure")
      ].filter(Boolean).length
    },
    {
      title: "Advanced Settings",
      key: "advanced",
      optionsCount: 5,
      completedOptions: [
        methods.watch("languageProcessing"),
        methods.watch("qualityControl")?.length,
        methods.watch("dimensionReduction"),
        methods.watch("contentEnrichment")?.length,
        methods.watch("distanceMetric")
      ].filter(Boolean).length
    },
    {
      title: "System Settings",
      key: "system",
      optionsCount: 3,
      completedOptions: [
        methods.watch("processingAllocation"),
        methods.watch("parallelThreads"),
        methods.watch("errorHandling")
      ].filter(Boolean).length
    }
  ];

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
      const config: EmbeddingConfig = {
        chunkSize: values.chunkSize,
        overlap: values.overlap,
        cleaner: values.cleaner as CleanerType,
        strategy: values.strategy as ChunkingStrategy,
        model: values.model
      };
      
      await prepareRagPipeline(config, selectedBook.id);
      toast({
        title: "Processing complete",
        description: "Vector store created successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] text-gray-100">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
          Vector Store Creation
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Configuration Progress</span>
            <span className="text-xs font-medium text-gray-300">{progressPercentage}%</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleCreateVectorStore)} className="space-y-4">
            {/* Primary Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Primary Options</h3>
                <span className="text-xs text-gray-500">2/2 selected</span>
              </div>

              <FormField
                name="vectorDb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Vector Database</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#252525] border-gray-700 text-gray-200">
                          <SelectValue placeholder="Select vector database" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#252525] border-gray-700">
                        <SelectItem value="pgvector">PostgreSQL (pgvector)</SelectItem>
                        <SelectItem value="pinecone">Pinecone</SelectItem>
                        <SelectItem value="weaviate">Weaviate</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="embeddingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Embedding Model</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#252525] border-gray-700 text-gray-200">
                          <SelectValue placeholder="Select embedding model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#252525] border-gray-700">
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="cohere">Cohere</SelectItem>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="bg-[#252525] rounded-lg p-3 border border-gray-700 flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <p className="text-sm text-gray-400">
                  Document type will be automatically detected from your uploaded file.
                </p>
              </div>
            </div>

            {/* Collapsible Sections */}
            {sections.slice(1).map((section) => (
              <Collapsible
                key={section.key}
                open={expandedSections[section.key]}
                onOpenChange={() => toggleSection(section.key)}
                className="border border-gray-800 rounded-lg"
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between p-3 text-left hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-sm font-medium text-gray-300">{section.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {section.completedOptions}/{section.optionsCount} selected
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedSections[section.key] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-[#1E1E1E] border-t border-gray-800">
                  {/* Section specific fields would go here */}
                  <div className="space-y-3">
                    {/* Add the specific fields for each section */}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            <button
              type="submit"
              className="w-full bg-[#252525] text-gray-200 py-3 rounded-lg hover:bg-[#303030] transition-colors"
              disabled={isPreparing}
            >
              Create Vector Store
            </button>
          </form>
        </FormProvider>

        {currentChunk ? (
          <div className="mt-4">
            <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {currentChunk.text}
              </pre>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Card className="bg-[#252525] border-gray-700">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-400">
                  Configure options and create a vector store to see chunks here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VectorStorePanel;