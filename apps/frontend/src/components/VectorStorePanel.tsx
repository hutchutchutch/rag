import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBookContext } from "@/contexts/book-context";
import { useRagPipeline } from "@/hooks/use-rag-pipeline";
import { ChunkingStrategy, CleanerType, EmbeddingConfig } from "@/lib/rag";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const embeddingFormSchema = z.object({
  vectorDb: z.string(),
  embeddingModel: z.string(),
  chunkSize: z.coerce.number().min(100).max(8000),
  overlap: z.coerce.number().min(0).max(1000),
  cleaner: z.string(),
  strategy: z.string(),
  model: z.string(),
});

type FormValues = z.infer<typeof embeddingFormSchema>;

const VectorStorePanel: React.FC = () => {
  const { selectedBook } = useBookContext();
  const { isPreparing, currentStep, prepareRagPipeline } = useRagPipeline();
  const [expandedSections, setExpandedSections] = useState({
    textProcessing: false,
    embeddingConfig: false,
    metadata: false,
    advanced: false,
    system: false,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(embeddingFormSchema),
    defaultValues: {
      vectorDb: "pgvector",
      embeddingModel: "openai",
      chunkSize: 1024,
      overlap: 200,
      cleaner: "simple",
      strategy: "fixed",
      model: "gpt-3.5-turbo",
    },
  });

  const progressPercentage = 91; // This would be calculated based on form completion

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] text-gray-100">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Vector Store Creation</h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400">Configuration Progress</span>
            <span className="text-sm font-medium text-gray-300">{progressPercentage}%</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <FormProvider {...methods}>
          <Form {...methods}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300">Primary Options</h3>
                  <span className="text-xs text-gray-500">2/2 selected</span>
                </div>

                <div className="space-y-4">
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
                              <SelectValue placeholder="PostgreSQL (pgvector)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pgvector">PostgreSQL (pgvector)</SelectItem>
                            <SelectItem value="neo4j">Neo4j</SelectItem>
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
                              <SelectValue placeholder="OpenAI" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="cohere">Cohere</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 bg-[#252525] rounded-lg p-3 border border-gray-700 flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <p className="text-sm text-gray-400">
                    Document type will be automatically detected from your uploaded file.
                  </p>
                </div>
              </div>

              {/* Additional sections would be added here */}
              {/* Text Processing, Embedding Configuration, etc. */}

              <button
                type="submit"
                className="w-full bg-[#252525] text-gray-200 py-3 rounded-lg hover:bg-[#303030] transition-colors"
                disabled={isPreparing}
              >
                Create Vector Store
              </button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
};

export default VectorStorePanel;