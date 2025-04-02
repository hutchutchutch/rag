import { useState } from 'react';
import { EmbeddingConfig } from '../lib/rag';

interface Chunk {
  chunk_index: number;
  text: string;
  page_number?: number;
}

export function useRagPipeline() {
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [currentChunk, setCurrentChunk] = useState<Chunk | null>(null);
  const [allChunks, setAllChunks] = useState<Chunk[]>([]);

  const prepareRagPipeline = async (config: EmbeddingConfig, bookId: string) => {
    setIsPreparing(true);
    try {
      // Simulated pipeline steps
      setCurrentStep('Preparing document');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('Chunking text');
      const chunks: Chunk[] = [
        { chunk_index: 0, text: 'Example chunk 1', page_number: 1 },
        { chunk_index: 1, text: 'Example chunk 2', page_number: 1 }
      ];
      setAllChunks(chunks);
      setCurrentChunk(chunks[0]);
      
      setCurrentStep('Creating embeddings');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('Storing vectors');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep(null);
      setIsPreparing(false);
    } catch (error) {
      setIsPreparing(false);
      setCurrentStep(null);
      throw error;
    }
  };

  const navigateToChunk = (direction: number) => {
    if (!allChunks.length || !currentChunk) return;
    
    const currentIndex = currentChunk.chunk_index;
    const nextIndex = (currentIndex + direction + allChunks.length) % allChunks.length;
    setCurrentChunk(allChunks[nextIndex]);
  };

  return {
    isPreparing,
    currentStep,
    currentChunk,
    allChunks,
    prepareRagPipeline,
    navigateToChunk
  };
}