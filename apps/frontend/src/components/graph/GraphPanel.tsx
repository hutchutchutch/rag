import React, { useState, useEffect } from 'react';
import { Network, Share2, ZoomIn, ZoomOut, Filter, Save, Edit, Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraphNode } from './GraphNode';

interface Entity {
  id?: string;
  name: string;
  label: string;
  isNew?: boolean;
}

interface Relationship {
  id?: string;
  source: string;
  target: string;
  type: string;
}

interface SchemaElement {
  type: string; // 'entity_label' or 'relationship_type'
  value: string;
}

interface KnowledgeGraphData {
  entities: Entity[];
  relationships: Relationship[];
  newSchemaElements?: SchemaElement[];
  extractionId?: string;
}

import KnowledgeGraphEditor from './KnowledgeGraphEditor';

export function GraphPanel() {
  // Using the standalone KnowledgeGraphEditor component
  return (
    <div className="h-full">
      <KnowledgeGraphEditor standalone={true} />
    </div>
  );
  
  // The original graph visualization code is kept below but not used
  function OriginalGraphPanel() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [schemaElements, setSchemaElements] = useState<SchemaElement[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [availableEntityTypes, setAvailableEntityTypes] = useState<string[]>(["Entity", "Concept", "Document", "Topic"]);
  const [availableRelationshipTypes, setAvailableRelationshipTypes] = useState<string[]>(["RELATED_TO", "CONTAINS", "MENTIONS"]);
  const [extractionId, setExtractionId] = useState<string | undefined>(undefined);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphData | null>(null);
  
  // New entity/relationship form states
  const [newEntity, setNewEntity] = useState<{name: string, label: string}>({name: '', label: 'Entity'});
  const [newRelationship, setNewRelationship] = useState<{source: string, target: string, type: string}>({
    source: '', target: '', type: 'RELATED_TO'
  });
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would come from the search results via props
    const mockData: KnowledgeGraphData = {
      entities: [
        { id: "e1", name: "Knowledge Graph", label: "Concept", isNew: true },
        { id: "e2", name: "Neo4j", label: "Database", isNew: false },
        { id: "e3", name: "LangGraph", label: "Framework", isNew: true }
      ],
      relationships: [
        { id: "r1", source: "e3", target: "e1", type: "BUILDS" },
        { id: "r2", source: "e2", target: "e1", type: "STORES" }
      ],
      newSchemaElements: [
        { type: "entity_label", value: "Framework" },
        { type: "relationship_type", value: "BUILDS" }
      ],
      extractionId: `kg-mock-${Date.now()}`
    };
    
    setKnowledgeGraph(mockData);
    setEntities(mockData.entities);
    setRelationships(mockData.relationships);
    setSchemaElements(mockData.newSchemaElements || []);
    setExtractionId(mockData.extractionId);
    
    // Update available types with new schema elements
    if (mockData.newSchemaElements) {
      const newEntityTypes = mockData.newSchemaElements
        .filter(el => el.type === 'entity_label')
        .map(el => el.value);
        
      const newRelTypes = mockData.newSchemaElements
        .filter(el => el.type === 'relationship_type')
        .map(el => el.value);
        
      setAvailableEntityTypes(prev => [...new Set([...prev, ...newEntityTypes])]);
      setAvailableRelationshipTypes(prev => [...new Set([...prev, ...newRelTypes])]);
    }
  }, []);
  
  const handleSaveKnowledgeGraph = () => {
    if (!extractionId) return;
    
    // This would call the backend API to save the knowledge graph
    console.log('Saving knowledge graph with ID:', extractionId);
    console.log('Entities:', entities);
    console.log('Relationships:', relationships);
    
    // API call would go here
    // fetch('/api/documents/knowledge-graph/' + extractionId, {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({entities, relationships})
    // })
    
    // Return to view mode
    setMode('view');
  };
  
  const addEntity = () => {
    if (!newEntity.name.trim()) return;
    
    const entityToAdd = {
      id: `entity-${Date.now()}`,
      name: newEntity.name,
      label: newEntity.label,
      isNew: true
    };
    
    setEntities(prev => [...prev, entityToAdd]);
    setNewEntity({name: '', label: 'Entity'});
  };
  
  const addRelationship = () => {
    if (!newRelationship.source || !newRelationship.target) return;
    
    const relationshipToAdd = {
      id: `rel-${Date.now()}`,
      source: newRelationship.source,
      target: newRelationship.target,
      type: newRelationship.type
    };
    
    setRelationships(prev => [...prev, relationshipToAdd]);
    setNewRelationship({source: '', target: '', type: 'RELATED_TO'});
  };
  
  const removeEntity = (entityId: string) => {
    setEntities(prev => prev.filter(e => e.id !== entityId));
    
    // Also remove relationships that use this entity
    setRelationships(prev => 
      prev.filter(r => r.source !== entityId && r.target !== entityId)
    );
    
    if (selectedEntity?.id === entityId) {
      setSelectedEntity(null);
    }
  };
  
  const removeRelationship = (relationshipId: string) => {
    setRelationships(prev => prev.filter(r => r.id !== relationshipId));
    
    if (selectedRelationship?.id === relationshipId) {
      setSelectedRelationship(null);
    }
  };
  
  const updateEntity = (id: string, field: keyof Entity, value: string) => {
    setEntities(prev => 
      prev.map(e => e.id === id ? {...e, [field]: value} : e)
    );
    
    if (selectedEntity?.id === id) {
      setSelectedEntity(prev => prev ? {...prev, [field]: value} : null);
    }
  };
  
  // If no knowledgeGraph is available yet, show placeholder
  if (!knowledgeGraph) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <Card className="flex-1 rounded-md bg-dark-800 p-6">
          <CardContent className="w-full h-full flex items-center justify-center p-6">
            <div className="text-dark-300 text-center">
              <p className="text-sm">Search with 'buildKnowledgeGraph=true' to extract entities and relationships</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-primary-500" />
          <span className="text-sm font-medium text-dark-50">Knowledge Graph</span>
        </div>
        <div className="flex gap-1">
          {mode === 'view' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('edit')}
              className="text-xs"
            >
              <Edit size={14} className="mr-1" /> Edit
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveKnowledgeGraph}
              className="text-xs"
            >
              <Save size={14} className="mr-1" /> Save to Neo4j
            </Button>
          )}
        </div>
      </div>
      
      {/* Entity List */}
      <Card className="p-4">
        <CardHeader className="px-0 pt-0 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-dark-50">Entities</CardTitle>
            {mode === 'edit' && (
              <span className="text-xs text-dark-400">{entities.length} entities</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 py-2">
          <ScrollArea className="h-28">
            {entities.length === 0 ? (
              <p className="text-xs text-dark-400 text-center py-2">No entities extracted</p>
            ) : (
              <div className="space-y-1">
                {entities.map((entity) => (
                  <div 
                    key={entity.id || entity.name} 
                    className={`flex justify-between items-center p-1.5 rounded text-xs ${
                      selectedEntity?.id === entity.id ? 'bg-primary-100 dark:bg-primary-950' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    } cursor-pointer`}
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entity.name}</span>
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                        {entity.label}
                      </span>
                      {entity.isNew && (
                        <span className="text-2xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          New
                        </span>
                      )}
                    </div>
                    {mode === 'edit' && (
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEntity(entity.id!);
                        }}
                        className="h-6 w-6"
                      >
                        <Trash size={12} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {mode === 'edit' && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <div className="flex items-center gap-2">
                <Input
                  value={newEntity.name}
                  onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                  placeholder="Entity name"
                  className="h-7 text-xs"
                />
                <Select
                  value={newEntity.label}
                  onValueChange={(value) => setNewEntity({...newEntity, label: value})}
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEntityTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEntity}
                  className="h-7 text-xs"
                  disabled={!newEntity.name.trim()}
                >
                  <Plus size={12} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Relationships List */}
      <Card className="p-4">
        <CardHeader className="px-0 pt-0 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-dark-50">Relationships</CardTitle>
            {mode === 'edit' && (
              <span className="text-xs text-dark-400">{relationships.length} relationships</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 py-2">
          <ScrollArea className="h-28">
            {relationships.length === 0 ? (
              <p className="text-xs text-dark-400 text-center py-2">No relationships extracted</p>
            ) : (
              <div className="space-y-1">
                {relationships.map((rel) => (
                  <div 
                    key={rel.id || `${rel.source}-${rel.type}-${rel.target}`} 
                    className={`flex justify-between items-center p-1.5 rounded text-xs ${
                      selectedRelationship?.id === rel.id ? 'bg-primary-100 dark:bg-primary-950' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    } cursor-pointer`}
                    onClick={() => setSelectedRelationship(rel)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">
                        {entities.find(e => e.id === rel.source || e.name === rel.source)?.name || rel.source}
                      </span>
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                        {rel.type}
                      </span>
                      <span className="font-medium">
                        {entities.find(e => e.id === rel.target || e.name === rel.target)?.name || rel.target}
                      </span>
                    </div>
                    {mode === 'edit' && (
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRelationship(rel.id!);
                        }}
                        className="h-6 w-6"
                      >
                        <Trash size={12} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {mode === 'edit' && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <div className="flex items-center gap-1.5">
                <Select
                  value={newRelationship.source}
                  onValueChange={(value) => setNewRelationship({...newRelationship, source: value})}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map(entity => (
                      <SelectItem key={entity.id || entity.name} value={entity.id || entity.name} className="text-xs">
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={newRelationship.type}
                  onValueChange={(value) => setNewRelationship({...newRelationship, type: value})}
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRelationshipTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={newRelationship.target}
                  onValueChange={(value) => setNewRelationship({...newRelationship, target: value})}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue placeholder="Target" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map(entity => (
                      <SelectItem key={entity.id || entity.name} value={entity.id || entity.name} className="text-xs">
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRelationship}
                  className="h-7 text-xs"
                  disabled={!newRelationship.source || !newRelationship.target}
                >
                  <Plus size={12} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* New Schema Elements */}
      {schemaElements.length > 0 && (
        <Card className="p-4">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-sm font-medium text-dark-50">New Schema Elements</CardTitle>
            <CardDescription className="text-xs">
              These new types were suggested by the LLM
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 py-2">
            <div className="space-y-1">
              {schemaElements.map((element, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center p-1.5 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{element.value}</span>
                    <span className="text-2xs px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                      {element.type === 'entity_label' ? 'Entity Type' : 'Relationship Type'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Details panel for selected entity/relationship */}
      {(selectedEntity || selectedRelationship) && (
        <Card className="p-4">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-sm font-medium text-dark-50">
              {selectedEntity ? 'Entity Details' : 'Relationship Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-2">
            {selectedEntity && (
              <div className="space-y-2">
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <label className="text-xs text-dark-400">Name:</label>
                  {mode === 'edit' ? (
                    <Input
                      value={selectedEntity.name}
                      onChange={(e) => updateEntity(selectedEntity.id!, 'name', e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <span className="text-xs">{selectedEntity.name}</span>
                  )}
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <label className="text-xs text-dark-400">Type:</label>
                  {mode === 'edit' ? (
                    <Select
                      value={selectedEntity.label}
                      onValueChange={(value) => updateEntity(selectedEntity.id!, 'label', value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEntityTypes.map(type => (
                          <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs">{selectedEntity.label}</span>
                  )}
                </div>
                {selectedEntity.isNew !== undefined && (
                  <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                    <label className="text-xs text-dark-400">Status:</label>
                    <span className={`text-xs ${selectedEntity.isNew ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedEntity.isNew ? 'New entity' : 'Existing in Neo4j'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {selectedRelationship && (
              <div className="space-y-2">
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <label className="text-xs text-dark-400">Source:</label>
                  <span className="text-xs">
                    {entities.find(e => e.id === selectedRelationship.source || e.name === selectedRelationship.source)?.name || selectedRelationship.source}
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <label className="text-xs text-dark-400">Type:</label>
                  <span className="text-xs">{selectedRelationship.type}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <label className="text-xs text-dark-400">Target:</label>
                  <span className="text-xs">
                    {entities.find(e => e.id === selectedRelationship.target || e.name === selectedRelationship.target)?.name || selectedRelationship.target}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Instructions for user */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-dark-400">
          {extractionId && <span>Extraction ID: {extractionId}</span>}
        </div>
        {mode === 'edit' && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-dark-400">
              Edit before saving to Neo4j
            </span>
          </div>
        )}
      </div>
    </div>
  );
}