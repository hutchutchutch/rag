import { Card, CardContent } from "@/components/ui/card";
import { Chunk } from "./types";

interface ChunkPreviewSectionProps {
  currentChunk: Chunk | null;
  allChunks: Chunk[] | null;
  navigateToChunk: (direction: number) => void;
}

export function ChunkPreviewSection({ 
  currentChunk, 
  allChunks, 
  navigateToChunk 
}: ChunkPreviewSectionProps) {
  if (!currentChunk) {
    return (
      <Card className="bg-[#252525] border border-gray-700">
        <CardContent className="pt-6">
          <p className="text-gray-400 text-sm text-center">
            Configure options and create a vector store to see chunks here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm uppercase tracking-wider text-gray-400">Chunk Preview</h3>
        <div className="flex space-x-2">
          <button 
            className="text-gray-400 hover:text-white" 
            title="Previous Chunk"
            onClick={() => navigateToChunk(-1)}
            disabled={!allChunks || allChunks.length <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <span className="text-xs text-gray-400">
            Chunk {currentChunk.chunk_index + 1} of {allChunks?.length || 0}
          </span>
          <button 
            className="text-gray-400 hover:text-white" 
            title="Next Chunk"
            onClick={() => navigateToChunk(1)}
            disabled={!allChunks || allChunks.length <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="bg-[#252525] border border-gray-700 rounded-md">
        <div className="p-3 bg-[#202020] text-sm max-h-[300px] overflow-auto">
          <div className="code-block text-gray-300 whitespace-pre-wrap font-mono text-xs">
            {currentChunk.text}
          </div>
        </div>
        
        <div className="border-t border-gray-700 p-3 flex justify-between">
          <div className="text-xs text-gray-400">
            Page: {currentChunk.page_number || 'N/A'} • 
            Words: {currentChunk.text.split(/\s+/).length} • 
            Characters: {currentChunk.text.length}
          </div>
        </div>
      </div>
    </div>
  );
}
