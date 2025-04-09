import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectItem } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/components/vector-store/types";

interface PrimaryOptionsSectionProps {
  form: UseFormReturn<FormValues>;
  completedOptions: number;
  optionsCount: number;
}

export function PrimaryOptionsSection({ form, completedOptions, optionsCount }: PrimaryOptionsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Primary Options</h3>
        <span className="text-xs text-gray-400">{completedOptions}/{optionsCount} selected</span>
      </div>
      
      <FormField
        control={form.control}
        name="vectorDb"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Vector Database</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectItem value="pgvector">PostgreSQL (pgvector)</SelectItem>
                <SelectItem value="pinecone">Pinecone</SelectItem>
                <SelectItem value="weaviate">Weaviate</SelectItem>
                <SelectItem value="qdrant">Qdrant</SelectItem>
                <SelectItem value="chroma">Chroma</SelectItem>
                <SelectItem value="milvus">Milvus</SelectItem>
                <SelectItem value="supabase">Supabase Vector</SelectItem>
              </Select>
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="embeddingModel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Embedding Model</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
                <SelectItem value="huggingface">Hugging Face models</SelectItem>
                <SelectItem value="opensource">Open source models</SelectItem>
              </Select>
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      {/* Document type info */}
      <div className="bg-gray-800 rounded-md p-3 border border-gray-700 mt-2">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-300">
            Document type will be automatically detected from your uploaded file.
          </p>
        </div>
      </div>
    </div>
  );
}
