import React, { useState, useMemo } from 'react';
import { Award, Clock, Database, Coins, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface EmbeddingModelSectionProps {
  form: UseFormReturn<FormValues>;
}

// Embedding models data with enhanced metadata
const EMBEDDING_MODELS = [
  {
    id: 'text-embedding-ada-002' as const,
    name: 'OpenAI Ada 002',
    description: 'Legacy model',
    quality: 88,
    speed: '4,000 tokens/s',
    speedValue: 4000,
    storage: '1536d',
    storageValue: 1536,
    cost: '$$',
    costValue: 2,
    bestFor: 'Legacy',
    provider: 'OpenAI'
  },
  {
    id: 'text-embedding-3-large' as const,
    name: 'OpenAI 3-large',
    description: 'High accuracy',
    quality: 94,
    speed: '3,500 tokens/s',
    speedValue: 3500,
    storage: '3072d',
    storageValue: 3072,
    cost: '$$$',
    costValue: 3,
    bestFor: 'Accuracy',
    provider: 'OpenAI'
  },
  {
    id: 'text-embedding-3-small' as const,
    name: 'OpenAI 3-small',
    description: 'Best value',
    quality: 90,
    speed: '4,800 tokens/s',
    speedValue: 4800,
    storage: '1536d',
    storageValue: 1536,
    cost: '$$',
    costValue: 2,
    bestFor: 'Value',
    provider: 'OpenAI'
  },
  {
    id: 'embed-english-v3.0' as const,
    name: 'Cohere English v3',
    description: 'Fast & accurate',
    quality: 92,
    speed: '5,000 tokens/s',
    speedValue: 5000,
    storage: '1024d',
    storageValue: 1024,
    cost: '$$',
    costValue: 2,
    bestFor: 'English',
    provider: 'Cohere'
  },
  {
    id: 'all-MiniLM-L6-v2' as const,
    name: 'MiniLM-L6-v2',
    description: 'Compact OSS',
    quality: 81,
    speed: '12,000 tokens/s',
    speedValue: 12000,
    storage: '384d',
    storageValue: 384,
    cost: 'Free',
    costValue: 0,
    bestFor: 'Local',
    provider: 'SBERT'
  }
] as const;

// Helper for quality color using our design tokens
const getQualityColor = (score: number) => {
  if (score >= 90) return 'bg-success-500';
  if (score >= 80) return 'bg-primary-500';
  if (score >= 70) return 'bg-warning-500';
  return 'bg-error-500';
};

// Helper for cost display using our design tokens
const getCostDisplay = (cost: string) => {
  switch (cost) {
    case '$$$':
      return <span className="text-error-500 font-medium">{cost}</span>;
    case '$$':
      return <span className="text-warning-500 font-medium">{cost}</span>;
    case '$':
      return <span className="text-success-500 font-medium">{cost}</span>;
    case 'Free':
      return <span className="text-success-600 font-medium">{cost}</span>;
    default:
      return cost;
  }
};

export function EmbeddingModelSection({ form }: EmbeddingModelSectionProps) {
  const [sortBy, setSortBy] = useState('quality');

  // Sort models based on the selected tab
  const sortedModels = useMemo(() => {
    switch (sortBy) {
      case 'quality':
        return [...EMBEDDING_MODELS].sort((a, b) => b.quality - a.quality);
      case 'cost':
        return [...EMBEDDING_MODELS].sort((a, b) => a.costValue - b.costValue);
      case 'speed':
        return [...EMBEDDING_MODELS].sort((a, b) => b.speedValue - a.speedValue);
      default:
        return EMBEDDING_MODELS;
    }
  }, [sortBy]);

  // Get selected model details
  const selectedModel = form.watch('embeddingModel');
  const selectedModelDetails = EMBEDDING_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="w-full space-y-3">
      <Tabs defaultValue="quality" className="w-full" onValueChange={setSortBy}>
        <TabsList className="w-full grid grid-cols-3 bg-dark-900 p-0 h-9">
          <TabsTrigger 
            value="quality" 
            className="text-xs data-[state=active]:bg-dark-800"
          >
            Best Quality
          </TabsTrigger>
          <TabsTrigger 
            value="cost" 
            className="text-xs data-[state=active]:bg-dark-800"
          >
            Lowest Cost
          </TabsTrigger>
          <TabsTrigger 
            value="speed" 
            className="text-xs data-[state=active]:bg-dark-800"
          >
            Fastest
          </TabsTrigger>
        </TabsList>

        <TabsContent value={sortBy} className="m-0">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <div className="p-2 space-y-2">
              {sortedModels.map(model => (
                <div
                  key={model.id}
                  onClick={() => form.setValue('embeddingModel', model.id)}
                  className={`p-3 rounded-md cursor-pointer bg-dark-800 border border-dark-700 hover:border-primary-500 ${
                    selectedModel === model.id ? 'border-primary-500 bg-dark-700' : ''
                  }`}
                >
                  <div className="space-y-2">
                    {/* Model name and provider */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-neutral-200">{model.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-xs text-neutral-400">{model.description}</p>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] h-5 font-normal bg-dark-900 text-neutral-300 border-dark-600"
                          >
                            {model.provider}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Quality bar */}
                    <div className="w-full flex items-center gap-1">
                      <Award className="h-3 w-3 text-warning-500" />
                      <div className="flex-1 bg-dark-600 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${getQualityColor(model.quality)}`} 
                          style={{ width: `${model.quality}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-300">{model.quality}</span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary-500" />
                        <span className="text-neutral-400">Speed:</span>
                        <span className="font-medium text-neutral-300">{model.speed}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-secondary-500" />
                        <span className="text-neutral-400">Dimensions:</span>
                        <span className="font-medium text-neutral-300">{model.storage}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-success-500" />
                        <span className="text-neutral-400">Cost:</span>
                        {getCostDisplay(model.cost)}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-error-500" />
                        <span className="text-neutral-400">Best For:</span>
                        <span className="font-medium text-neutral-300">{model.bestFor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-2 flex justify-between items-center">
        <div className="text-xs text-neutral-400">
          {selectedModel 
            ? `${selectedModelDetails?.name} selected` 
            : 'No model selected'}
        </div>
        
        <Button 
          size="sm" 
          variant="ghost"
          className="text-xs h-7 px-2 text-primary-400 hover:text-primary-300 hover:bg-dark-700"
        >
          Done
        </Button>
      </div>
    </div>
  );
} 