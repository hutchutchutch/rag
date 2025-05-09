import { useState } from 'react';
import { 
  EmbeddingConfig, 
  uploadDocument, 
  searchDocuments, 
  sendChatMessage, 
  submitKnowledgeGraph,
  ChatMessage,
  KnowledgeGraph,
  Entity,
  Relationship
} from '@lib/rag';

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
  
  // Knowledge graph state
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [isSubmittingGraph, setIsSubmittingGraph] = useState(false);

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
  const search = async (query: string, limit: number = 5, buildKg: boolean = false) => {
    setIsSearching(true);
    try {
      const results = await searchDocuments(query, limit, buildKg);
      
      const chunks: Chunk[] = results.results.map((result, index) => ({
        chunk_index: index,
        text: result.text,
        metadata: result.metadata
      }));
      
      setSearchResults(chunks);
      
      // Set knowledge graph data if available
      if (results.knowledgeGraph) {
        setKnowledgeGraph(results.knowledgeGraph);
        if (results.extractionId) {
          setExtractionId(results.extractionId);
        }
      } else {
        setKnowledgeGraph(null);
        setExtractionId(null);
      }
      
      setIsSearching(false);
      return chunks;
    } catch (error) {
      console.error('Error searching documents:', error);
      setIsSearching(false);
      throw error;
    }
  };
  
  /**
   * Submit knowledge graph to Neo4j
   */
  const saveKnowledgeGraph = async (entities: Entity[], relationships: Relationship[]) => {
    if (!extractionId) {
      throw new Error("No extraction ID available");
    }
    
    setIsSubmittingGraph(true);
    try {
      const result = await submitKnowledgeGraph(extractionId, { entities, relationships });
      
      // Reset after successful submission
      setKnowledgeGraph(null);
      setExtractionId(null);
      setIsSubmittingGraph(false);
      
      return result;
    } catch (error) {
      console.error('Error submitting knowledge graph:', error);
      setIsSubmittingGraph(false);
      throw error;
    }
  };
  
  /**
   * Update knowledge graph entities
   */
  const updateKnowledgeGraphEntities = (entities: Entity[]) => {
    if (knowledgeGraph) {
      setKnowledgeGraph({
        ...knowledgeGraph,
        entities
      });
    }
  };
  
  /**
   * Update knowledge graph relationships
   */
  const updateKnowledgeGraphRelationships = (relationships: Relationship[]) => {
    if (knowledgeGraph) {
      setKnowledgeGraph({
        ...knowledgeGraph,
        relationships
      });
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
    isSubmittingGraph,
    currentStep,
    currentChunk,
    allChunks,
    documentId,
    searchResults,
    chatHistory,
    knowledgeGraph,
    extractionId,
    processDocument,
    navigateToChunk,
    search,
    sendMessage,
    clearChat,
    saveKnowledgeGraph,
    updateKnowledgeGraphEntities,
    updateKnowledgeGraphRelationships
  };
}