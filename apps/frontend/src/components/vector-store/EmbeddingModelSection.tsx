import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface EmbeddingModelSectionProps {
  form: UseFormReturn<FormValues>;
}

const EMBEDDING_MODELS = {
  "OpenAI": [
    { value: "text-embedding-ada-002", label: "Ada 002" },
    { value: "text-embedding-3-small", label: "3 Small" },
    { value: "text-embedding-3-large", label: "3 Large" }
  ],
  "Cohere": [
    { value: "embed-english-v3.0", label: "English v3.0" },
    { value: "embed-multilingual-v3.0", label: "Multilingual v3.0" }
  ],
  "Sentence Transformers": [
    { value: "all-MiniLM-L6-v2", label: "MiniLM-L6-v2" },
    { value: "all-mpnet-base-v2", label: "MPNet Base v2" }
  ],
  "Open Source": [
    { value: "bge-large-en", label: "BGE Large" },
    { value: "e5-large-v2", label: "E5 Large v2" },
    { value: "gte-large", label: "GTE Large" },
    { value: "instructor-xl", label: "INSTRUCTOR XL" }
  ],
  "Jina": [
    { value: "jina-embeddings-v2-base-en", label: "Base v2" },
    { value: "jina-embeddings-v2-small-en", label: "Small v2" }
  ]
};

export function EmbeddingModelSection({ form }: EmbeddingModelSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="embeddingModel"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-base">Select Embedding Model</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-6"
              >
                {Object.entries(EMBEDDING_MODELS).map(([category, models]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-400">{category}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {models.map(model => (
                        <FormItem key={model.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={model.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {model.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormDescription>
              Choose an embedding model based on your needs for accuracy, speed, and language support.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
} 