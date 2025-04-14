import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { Database, Shield, Zap, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VectorDbSectionProps {
  form: UseFormReturn<FormValues>;
}

const VECTOR_DBS = [
  {
    value: "pgvector",
    label: "PostgreSQL + pgvector",
    description: "Fast similarity search within your PostgreSQL database with no additional infrastructure.",
    icon: Database,
    tag: "Popular",
    currently_supported: true,
    max_dimensions: 2000,
    chunk_size_limits: 8192
  },
  {
    value: "neo4j",
    label: "Neo4j Vector Index",
    description: "Combine powerful graph queries with vector similarity search in a single database.",
    icon: Network,
    tag: "Graph DB",
    currently_supported: false,
    max_dimensions: 4096,
    chunk_size_limits: 1024
  },
  {
    value: "surrealdb",
    label: "SurrealDB",
    description: "Multi-model database with native vector indexing and real-time capabilities.",
    icon: Zap,
    tag: "Real-time",
    currently_supported: false,
    max_dimensions: 1024,
    chunk_size_limits: 1024
  },
  {
    value: "weaviate",
    label: "Weaviate",
    description: "Open-source vector database with advanced filtering and multi-modal capabilities.",
    icon: Shield,
    tag: "Multi-modal",
    currently_supported: false,
    max_dimensions: 1536,
    chunk_size_limits: 1024
  },
];

export function VectorDbSection({ form }: VectorDbSectionProps) {
  // Get selected vector db
  const selectedVectorDb = form.watch('vectorDb');

  return (
    <div className="w-full space-y-2">
      {VECTOR_DBS.map(db => (
        <div
          key={db.value}
          onClick={() => db.currently_supported ? form.setValue('vectorDb', db.value as any) : null}
          className={`p-3 rounded-md ${db.currently_supported ? 'cursor-pointer hover:border-primary-500' : 'opacity-60 cursor-not-allowed'} bg-dark-800 border border-dark-700 ${
            selectedVectorDb === db.value ? 'border-primary-500 bg-dark-700' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <db.icon className={`h-5 w-5 ${db.currently_supported ? 'text-primary-500' : 'text-neutral-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-neutral-200">{db.label}</div>
                {db.currently_supported ? (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] h-5 font-normal bg-dark-900 text-neutral-300 border-dark-600"
                  >
                    {db.tag}
                  </Badge>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] h-5 font-normal bg-dark-900 text-neutral-500 border-dark-800"
                  >
                    Coming soon
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {db.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 