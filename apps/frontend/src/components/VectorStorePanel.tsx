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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="sidebar-content">
      <div className="panel">
        <div className="panel-header">
          <h2 className="text-lg font-semibold text-dark-50">Vector Store Creation</h2>
          <button className="btn btn-icon-sm">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="panel-content">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-dark-300">Configuration Progress</span>
              <span className="text-sm font-medium text-dark-100">{progressPercentage}%</span>
            </div>
            <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300 shadow-glow-xs"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <FormProvider {...methods}>
            <Form {...methods}>
              <div className="space-y-6">
                <Card className="elevation-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-dark-100">Primary Options</CardTitle>
                      <span className="text-xs text-dark-400">2/2 selected</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <FormField
                        name="vectorDb"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark-300">Vector Database</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="select">
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
                            <FormLabel className="text-dark-300">Embedding Model</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="select">
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

                    <div className="mt-4 bg-dark-700 rounded-lg p-3 border border-dark-600 flex items-start gap-2">
                      <Info className="w-5 h-5 text-primary-400 mt-0.5" />
                      <p className="text-sm text-dark-300">
                        Document type will be automatically detected from your uploaded file.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional sections would be added here */}
                {/* Text Processing, Embedding Configuration, etc. */}

                <button
                  type="submit"
                  className="btn btn-primary w-full glow-hover-primary"
                  disabled={isPreparing}
                >
                  Create Vector Store
                </button>
              </div>
            </Form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default VectorStorePanel;