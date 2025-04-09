import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface VectorDbSectionProps {
  form: UseFormReturn<FormValues>;
}

const VECTOR_DBS = [
  {
    value: "pinecone",
    label: "Pinecone",
    description: "Managed vector database with high scalability"
  },
  {
    value: "weaviate",
    label: "Weaviate",
    description: "Open-source vector search engine"
  },
  {
    value: "chroma",
    label: "Chroma",
    description: "Open-source embedding database"
  },
  {
    value: "milvus",
    label: "Milvus/Zilliz",
    description: "Cloud-native vector database"
  },
  {
    value: "qdrant",
    label: "Qdrant",
    description: "Vector database with extended filtering"
  },
  {
    value: "faiss",
    label: "FAISS",
    description: "In-memory vector similarity search"
  },
  {
    value: "pgvector",
    label: "PGVector",
    description: "PostgreSQL vector similarity extension"
  }
];

export function VectorDbSection({ form }: VectorDbSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="vectorDb"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-base">Select Vector Database</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {VECTOR_DBS.map(db => (
                    <FormItem key={db.value} className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={db.value} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-normal">
                          {db.label}
                        </FormLabel>
                        <p className="text-xs text-gray-400">
                          {db.description}
                        </p>
                      </div>
                    </FormItem>
                  ))}
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
} 