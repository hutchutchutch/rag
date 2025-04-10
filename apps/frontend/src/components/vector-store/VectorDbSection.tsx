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
    tag: "Popular"
  },
  {
    value: "neo4j",
    label: "Neo4j Vector Index",
    description: "Combine powerful graph queries with vector similarity search in a single database.",
    icon: Network,
    tag: "Graph DB"
  },
  {
    value: "surrealdb",
    label: "SurrealDB",
    description: "Multi-model database with native vector indexing and real-time capabilities.",
    icon: Zap,
    tag: "Real-time"
  },
  {
    value: "weaviate",
    label: "Weaviate",
    description: "Open-source vector database with advanced filtering and multi-modal capabilities.",
    icon: Shield,
    tag: "Multi-modal"
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
          onClick={() => form.setValue('vectorDb', db.value)}
          className={`p-3 rounded-md cursor-pointer bg-dark-800 border border-dark-700 hover:border-primary-500 ${
            selectedVectorDb === db.value ? 'border-primary-500 bg-dark-700' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <db.icon className="h-5 w-5 text-primary-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-neutral-200">{db.label}</div>
                <Badge 
                  variant="outline" 
                  className="text-[10px] h-5 font-normal bg-dark-900 text-neutral-300 border-dark-600"
                >
                  {db.tag}
                </Badge>
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