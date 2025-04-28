import React, { useState, useEffect } from 'react';
import { Network, Save, Edit, Plus, Trash, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRagPipeline } from '@/hooks/use-rag-pipeline';
import { Entity, Relationship, SchemaElement } from '@/lib/rag';
import { useVectorStore } from '@/store/vectorStore';
import { vectorStores } from '@/mocks/vectorStores';
import SampleD3KnowledgeGraph from './SampleD3KnowledgeGraph';

interface KnowledgeGraphEditorProps {
  onClose?: () => void;
  standalone?: boolean;
}

const KnowledgeGraphEditor: React.FC<KnowledgeGraphEditorProps> = ({ onClose, standalone = false }) => {
  const {
    knowledgeGraph,
    extractionId,
    isSubmittingGraph,
    updateKnowledgeGraphEntities,
    updateKnowledgeGraphRelationships,
    saveKnowledgeGraph
  } = useRagPipeline();

  const { selected } = useVectorStore();
  const selectedStore = selected ? vectorStores.find(vs => vs.id === selected.id) : null;
  const hasGraph = selectedStore && selectedStore.knowledgeGraph;

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [schemaElements, setSchemaElements] = useState<SchemaElement[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [availableEntityTypes, setAvailableEntityTypes] = useState<string[]>(["Entity", "Concept", "Document", "Topic"]);
  const [availableRelationshipTypes, setAvailableRelationshipTypes] = useState<string[]>(["RELATED_TO", "CONTAINS", "MENTIONS"]);
  
  // New entity/relationship form states
  const [newEntity, setNewEntity] = useState<{name: string, label: string}>({name: '', label: 'Entity'});
  const [newRelationship, setNewRelationship] = useState<{source: string, target: string, type: string}>({
    source: '', target: '', type: 'RELATED_TO'
  });
  
  // Load knowledge graph data when it changes
  useEffect(() => {
    if (knowledgeGraph) {
      setEntities(knowledgeGraph.entities || []);
      setRelationships(knowledgeGraph.relationships || []);
      setSchemaElements(knowledgeGraph.newSchemaElements || []);
      
      // Update available types with new schema elements
      if (knowledgeGraph.newSchemaElements) {
        const newEntityTypes = knowledgeGraph.newSchemaElements
          .filter(el => el.type === 'entity_label')
          .map(el => el.value);
          
        const newRelTypes = knowledgeGraph.newSchemaElements
          .filter(el => el.type === 'relationship_type')
          .map(el => el.value);
          
        setAvailableEntityTypes(prev => [...new Set([...prev, ...newEntityTypes])]);
        setAvailableRelationshipTypes(prev => [...new Set([...prev, ...newRelTypes])]);
      }
    }
  }, [knowledgeGraph]);
  
  const handleSaveKnowledgeGraph = async () => {
    if (!extractionId) return;
    
    try {
      await saveKnowledgeGraph(entities, relationships);
      if (onClose) onClose();
      setMode('view');
    } catch (error) {
      console.error('Error saving knowledge graph:', error);
    }
  };
  
  const addEntity = () => {
    if (!newEntity.name.trim()) return;
    
    const entityToAdd = {
      id: `entity-${Date.now()}`,
      name: newEntity.name,
      label: newEntity.label,
      isNew: true
    };
    
    const updatedEntities = [...entities, entityToAdd];
    setEntities(updatedEntities);
    updateKnowledgeGraphEntities(updatedEntities);
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
    
    const updatedRelationships = [...relationships, relationshipToAdd];
    setRelationships(updatedRelationships);
    updateKnowledgeGraphRelationships(updatedRelationships);
    setNewRelationship({source: '', target: '', type: 'RELATED_TO'});
  };
  
  const removeEntity = (entityId: string) => {
    const updatedEntities = entities.filter(e => e.id !== entityId);
    setEntities(updatedEntities);
    updateKnowledgeGraphEntities(updatedEntities);
    
    // Also remove relationships that use this entity
    const updatedRelationships = relationships.filter(r => 
      r.source !== entityId && r.target !== entityId
    );
    setRelationships(updatedRelationships);
    updateKnowledgeGraphRelationships(updatedRelationships);
    
    if (selectedEntity?.id === entityId) {
      setSelectedEntity(null);
    }
  };
  
  const removeRelationship = (relationshipId: string) => {
    const updatedRelationships = relationships.filter(r => r.id !== relationshipId);
    setRelationships(updatedRelationships);
    updateKnowledgeGraphRelationships(updatedRelationships);
    
    if (selectedRelationship?.id === relationshipId) {
      setSelectedRelationship(null);
    }
  };
  
  const updateEntity = (id: string, field: keyof Entity, value: string) => {
    const updatedEntities = entities.map(e => 
      e.id === id ? {...e, [field]: value} : e
    );
    setEntities(updatedEntities);
    updateKnowledgeGraphEntities(updatedEntities);
    
    if (selectedEntity?.id === id) {
      setSelectedEntity(prev => prev ? {...prev, [field]: value} : null);
    }
  };
  
  if (hasGraph && selectedStore.knowledgeGraph) {
    const d3Entities = (selectedStore.knowledgeGraph.entities || []).map(e => ({
      id: e.id,
      name: e.name,
      label: e.label
    }));
    const d3Relationships = (selectedStore.knowledgeGraph.relationships || []).map(r => ({
      id: r.id,
      source: r.source,
      target: r.target,
      type: r.type
    }));
    return (
      <div className={`flex flex-col gap-4 p-4 ${standalone ? 'h-full' : ''}`}>
        <Card className="elevation-1">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-xs font-medium text-dark-50">Sample Knowledge Graph: {selectedStore.name}</CardTitle>
            <CardDescription className="text-xs">This is a demo graph you can paste into Neo4j or adapt for your own use.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="w-full flex justify-center items-center min-h-[200px]">
              <SampleD3KnowledgeGraph entities={d3Entities} relationships={d3Relationships} />
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold mb-2 text-dark-50">Nodes & Relationships</div>
              <div className="space-y-4">
                {d3Entities.map(entity => {
                  const outgoing = d3Relationships.filter(r => r.source === entity.id);
                  const incoming = d3Relationships.filter(r => r.target === entity.id);
                  return (
                    <div key={entity.id} className="bg-muted rounded p-3">
                      <div className="font-medium text-primary-700 dark:text-primary-200">
                        {entity.name}
                        <span className="ml-2 text-xs text-dark-400">({entity.label})</span>
                      </div>
                      {(outgoing.length > 0 || incoming.length > 0) ? (
                        <ul className="ml-4 mt-1 list-disc text-xs">
                          {outgoing.map(rel => {
                            const target = d3Entities.find(e => e.id === rel.target);
                            return (
                              <li key={rel.id + "-out"} className="text-dark-400">
                                <span className="font-semibold text-primary-600 dark:text-primary-300">{rel.type}</span>
                                {" → "}
                                <span className="text-dark-50">{target?.name || rel.target}</span>
                              </li>
                            );
                          })}
                          {incoming.map(rel => {
                            const source = d3Entities.find(e => e.id === rel.source);
                            return (
                              <li key={rel.id + "-in"} className="text-dark-400">
                                <span className="font-semibold text-primary-600 dark:text-primary-300">{rel.type}</span>
                                {" ← "}
                                <span className="text-dark-50">{source?.name || rel.source}</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="ml-4 text-xs text-dark-300">No relationships</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="default" size="sm">Add Node</Button>
                <Button variant="outline" size="sm">Add Relationship</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If no knowledgeGraph is available yet, show placeholder
  if (!knowledgeGraph) {
    return (
      <div className={`p-4 ${standalone ? 'h-full' : ''}`}>
        <Card className="elevation-1">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-dark-300 text-center">
              <p className="text-sm">No knowledge graph extraction available. Search with 'Extract Graph' to create one.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col gap-4 p-4 ${standalone ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-primary-500" />
          <span className="text-sm font-medium text-dark-50">Knowledge Graph</span>
        </div>
        <div className="flex gap-1">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <XCircle size={16} />
            </Button>
          )}
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
              disabled={isSubmittingGraph}
              className="text-xs"
            >
              {isSubmittingGraph ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={14} className="mr-1" /> Save to Neo4j
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Entity List */}
      <Card className="elevation-1">
        <CardHeader className="px-4 py-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs font-medium text-dark-50">Entities</CardTitle>
            {mode === 'edit' && (
              <span className="text-xs text-dark-400">{entities.length} entities</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <ScrollArea className={`${standalone ? 'h-40' : 'h-28'}`}>
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
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
      <Card className="elevation-1">
        <CardHeader className="px-4 py-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs font-medium text-dark-50">Relationships</CardTitle>
            {mode === 'edit' && (
              <span className="text-xs text-dark-400">{relationships.length} relationships</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <ScrollArea className={`${standalone ? 'h-40' : 'h-28'}`}>
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
                      <SelectItem key={entity.id || entity.name} value={entity.id || entity.name}>{entity.name}</SelectItem>
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
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                      <SelectItem key={entity.id || entity.name} value={entity.id || entity.name}>{entity.name}</SelectItem>
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
        <Card className="elevation-1">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-xs font-medium text-dark-50">New Schema Elements</CardTitle>
            <CardDescription className="text-xs">
              These new types were suggested by the LLM
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
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
        <Card className="elevation-1">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-xs font-medium text-dark-50">
              {selectedEntity ? 'Entity Details' : 'Relationship Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2">
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
                          <SelectItem key={type} value={type}>{type}</SelectItem>
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
          {extractionId && <span>ID: {extractionId.substring(0, 10)}...</span>}
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
};

export default KnowledgeGraphEditor;