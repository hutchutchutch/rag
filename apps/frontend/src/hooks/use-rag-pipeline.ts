import { useState } from 'react';
import { EmbeddingConfig, uploadDocument, searchDocuments, sendChatMessage, ChatMessage } from '@lib/rag';

interface Chunk {
  chunk_index: number;
  text: string;
  page_number?: number;
  metadata?: Record<string, any>;
}

export function useRagPipeline() {
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [currentChunk, setCurrentChunk] = useState<Chunk | null>(null);
  const [allChunks, setAllChunks] = useState<Chunk[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Chunk[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  /**
   * Upload a document and process it through the RAG pipeline
   */
  const processDocument = async (file: File, config: EmbeddingConfig) => {
    setIsPreparing(true);
    try {
      // Step 1: Upload document
      setCurrentStep('Uploading document');
      const result = await uploadDocument(file);
      setDocumentId(result.documentId);
      
      // Step 2: Simulate chunking step (in reality, this happens on the backend)
      setCurrentStep('Processing document');
      
      // Step 3: Create embeddings (in backend)
      setCurrentStep('Creating embeddings');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Storing vectors (in backend)
      setCurrentStep('Storing vectors');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample search to get some chunks
      setCurrentStep('Retrieving sample chunks');
      const sampleSearch = await searchDocuments(file.name.split('.')[0], 5);
      
      const chunks: Chunk[] = sampleSearch.results.map((result, index) => ({
        chunk_index: index,
        text: result.text,
        metadata: result.metadata
      }));
      
      setAllChunks(chunks);
      if (chunks.length > 0) {
        setCurrentChunk(chunks[0]);
      }
      
      setCurrentStep(null);
      setIsPreparing(false);
      
      return result.documentId;
    } catch (error) {
      console.error('Error processing document:', error);
      setIsPreparing(false);
      setCurrentStep(null);
      throw error;
    }
  };

  /**
   * Navigate between document chunks
   */
  const navigateToChunk = (direction: number) => {
    if (!allChunks.length || !currentChunk) return;
    
    const currentIndex = allChunks.findIndex(chunk => 
      chunk.chunk_index === currentChunk.chunk_index);
    const nextIndex = (currentIndex + direction + allChunks.length) % allChunks.length;
    setCurrentChunk(allChunks[nextIndex]);
  };

  /**
   * Search for relevant document chunks
   */
  const search = async (query: string, limit: number = 5) => {
    setIsSearching(true);
    try {
      const results = await searchDocuments(query, limit);
      
      const chunks: Chunk[] = results.results.map((result, index) => ({
        chunk_index: index,
        text: result.text,
        metadata: result.metadata
      }));
      
      setSearchResults(chunks);
      setIsSearching(false);
      return chunks;
    } catch (error) {
      console.error('Error searching documents:', error);
      setIsSearching(false);
      throw error;
    }
  };

  /**
   * Send a message to the chat interface
   */
  const sendMessage = async (message: string) => {
    setIsChatting(true);
    try {
      // Add user message to history right away for UI feedback
      const updatedHistory: ChatMessage[] = [
        ...chatHistory,
        { type: 'human', content: message }
      ];
      
      // Send message to backend
      const response = await sendChatMessage(message, chatHistory);
      
      // Update with the complete history returned from backend
      setChatHistory(response.history);
      setIsChatting(false);
      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      setIsChatting(false);
      throw error;
    }
  };

  /**
   * Clear chat history
   */
  const clearChat = () => {
    setChatHistory([]);
  };

  return {
    isPreparing,
    isSearching,
    isChatting,
    currentStep,
    currentChunk,
    allChunks,
    documentId,
    searchResults,
    chatHistory,
    processDocument,
    navigateToChunk,
    search,
    sendMessage,
    clearChat
  };
}