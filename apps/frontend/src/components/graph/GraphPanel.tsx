import React from 'react';
import KnowledgeGraphEditor from './KnowledgeGraphEditor';

export function GraphPanel() {
  return (
    <div className="h-full">
      <KnowledgeGraphEditor standalone={true} />
    </div>
  );
}