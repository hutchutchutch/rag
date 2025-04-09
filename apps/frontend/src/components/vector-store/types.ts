import { z } from "zod";
import { ChunkingStrategy, CleanerType, EmbeddingConfig as LibEmbeddingConfig } from "@/lib/rag";

export type EmbeddingConfig = LibEmbeddingConfig;

export const embeddingFormSchema = z.object({
  // Embedding Model Options
  embeddingModel: z.enum([
    "text-embedding-ada-002",
    "text-embedding-3-small",
    "text-embedding-3-large",
    "embed-english-v3.0",
    "embed-multilingual-v3.0",
    "all-MiniLM-L6-v2",
    "all-mpnet-base-v2",
    "bge-large-en",
    "e5-large-v2",
    "gte-large",
    "instructor-xl",
    "jina-embeddings-v2-base-en",
    "jina-embeddings-v2-small-en"
  ]),
  
  // Vector Database Options
  vectorDb: z.enum([
    "pinecone",
    "weaviate",
    "chroma",
    "milvus",
    "qdrant",
    "faiss",
    "pgvector"
  ]),
  
  // Chunking Options
  chunkSize: z.number().min(100).max(8000),
  chunkOverlap: z.number().min(0).max(50),
  chunkingMethod: z.enum([
    "recursive",
    "fixed-size",
    "sentence",
    "paragraph"
  ]),
  extractMetadata: z.array(z.enum([
    "page-numbers",
    "section-titles",
    "timestamps",
    "urls",
    "entities"
  ])).default([]),
  
  // Pre-processing Options
  textCleaning: z.array(z.enum([
    "remove-special-chars",
    "remove-extra-whitespace",
    "remove-urls",
    "remove-email-addresses",
    "remove-phone-numbers"
  ])).default([]),
  removeStopwords: z.boolean().default(false),
  useLemmatization: z.boolean().default(false),
});

export type FormValues = z.infer<typeof embeddingFormSchema>;

// Section configuration to track completion
export interface SectionConfig {
  title: string;
  optionsCount: number;
  completedOptions: number;
  key: string;
}

export interface CollapsibleSectionProps {
  title: string;
  sectionKey: string;
  isOpen: boolean;
  onToggle: (section: string) => void;
  completedOptions: number;
  optionsCount: number;
  children: React.ReactNode;
}

export interface Chunk {
  chunk_index: number;
  text: string;
  page_number?: number;
  metadata?: Record<string, any>;
}
