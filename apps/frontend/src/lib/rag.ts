export type CleanerType = 'simple' | 'advanced' | 'ocr-optimized';
export type ChunkingStrategy = 'fixed' | 'semantic' | 'sliding' | 'recursive';

export interface EmbeddingConfig {
  chunkSize: number;
  overlap: number;
  cleaner: CleanerType;
  strategy: ChunkingStrategy;
  model: string;
}