import * as React from "react";
import { Card } from "../ui/card";
import { GraphNode } from "./GraphNode";

interface GraphData {
  nodes: {
    id: string;
    title: string;
    similarity?: number;
  }[];
  edges: {
    source: string;
    target: string;
    weight?: number;
  }[];
}

export function GraphPanel() {
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  
  // This would come from the backend in a real implementation
  const mockGraphData: GraphData = {
    nodes: [
      { id: "n1", title: "Introduction", similarity: 0.8 },
      { id: "n2", title: "Chapter 1", similarity: 0.6 },
      { id: "n3", title: "Chapter 2", similarity: 0.4 },
      { id: "n4", title: "Appendix", similarity: 0.2 },
      { id: "n5", title: "References", similarity: 0.1 },
    ],
    edges: [
      { source: "n1", target: "n2", weight: 0.9 },
      { source: "n2", target: "n3", weight: 0.8 },
      { source: "n3", target: "n4", weight: 0.7 },
      { source: "n4", target: "n5", weight: 0.6 },
      { source: "n1", target: "n5", weight: 0.3 },
    ]
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Card className="flex-1 rounded-md bg-dark-800 p-6">
        <div className="h-full w-full">
          {/* In a real implementation, this would be a proper graph visualization,
              perhaps using a library like React Flow or Vis.js */}
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="flex gap-4">
              <GraphNode
                id="n1"
                title="Introduction"
                selected={selectedNode === "n1"}
                similarity={0.8}
                onClick={() => setSelectedNode(selectedNode === "n1" ? null : "n1")}
              />
              <GraphNode
                id="n2"
                title="Chapter 1"
                selected={selectedNode === "n2"}
                similarity={0.6}
                onClick={() => setSelectedNode(selectedNode === "n2" ? null : "n2")}
              />
            </div>
            <div className="flex gap-8">
              <GraphNode
                id="n3"
                title="Chapter 2"
                selected={selectedNode === "n3"}
                similarity={0.4}
                onClick={() => setSelectedNode(selectedNode === "n3" ? null : "n3")}
              />
              <GraphNode
                id="n4"
                title="Appendix"
                selected={selectedNode === "n4"}
                similarity={0.2}
                onClick={() => setSelectedNode(selectedNode === "n4" ? null : "n4")}
              />
              <GraphNode
                id="n5"
                title="References"
                selected={selectedNode === "n5"}
                similarity={0.1}
                onClick={() => setSelectedNode(selectedNode === "n5" ? null : "n5")}
              />
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-dark-300">
          {selectedNode ? (
            <div>
              <h3 className="mb-2 text-base font-medium text-dark-100">
                {mockGraphData.nodes.find(n => n.id === selectedNode)?.title}
              </h3>
              <p>
                Similarity: {mockGraphData.nodes.find(n => n.id === selectedNode)?.similarity?.toFixed(2)}
              </p>
              <p>
                Connected to: {
                  mockGraphData.edges
                    .filter(e => e.source === selectedNode || e.target === selectedNode)
                    .map(e => {
                      const connectedId = e.source === selectedNode ? e.target : e.source;
                      return mockGraphData.nodes.find(n => n.id === connectedId)?.title;
                    })
                    .join(", ")
                }
              </p>
            </div>
          ) : (
            <p>Select a node to see details</p>
          )}
        </div>
      </Card>
    </div>
  );
}