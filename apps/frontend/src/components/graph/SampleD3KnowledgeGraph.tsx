import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface Entity {
  id: string;
  name: string;
  label: string;
}

interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface SampleD3KnowledgeGraphProps {
  entities: Entity[];
  relationships: Relationship[];
  width?: number;
  height?: number;
}

const NODE_RADIUS = 28;

export const SampleD3KnowledgeGraph: React.FC<SampleD3KnowledgeGraphProps> = ({
  entities,
  relationships,
  width = 420,
  height = 260,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = React.useState<{visible: boolean, x: number, y: number, data?: Entity}>({visible: false, x: 0, y: 0});

  useEffect(() => {
    if (!svgRef.current) return;
    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // D3 simulation
    const simulation = d3.forceSimulation(entities as any)
      .force('link', d3.forceLink(relationships as any).id((d: any) => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    const svg = d3.select(svgRef.current);
    svg.append('g')
      .attr('stroke', '#5E30DA')
      .attr('stroke-width', 2)
      .selectAll('line')
      .data(relationships)
      .join('line')
      .attr('marker-end', 'url(#arrow)');

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(entities)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', '#5E30DA')
      .attr('stroke', '#5E30DA')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 6)
      .attr('fill', '#FFFFFF')
      .attr('class', 'font-semibold text-xs')
      .text(d => d.label);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 22)
      .attr('fill', '#FFFFFF')
      .attr('class', 'text-[10px]')
      .text(d => d.name);

    // Draw relationship labels
    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(relationships)
      .join('text')
      .attr('fill', '#FFFFFF')
      .attr('class', 'text-[10px]')
      .attr('text-anchor', 'middle')
      .text(d => d.type);

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#5E30DA');

    simulation.on('tick', () => {
      svg.selectAll('line')
        .attr('x1', d => (d as any).source.x)
        .attr('y1', d => (d as any).source.y)
        .attr('x2', d => (d as any).target.x)
        .attr('y2', d => (d as any).target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      linkLabel
        .attr('x', d => ((d as any).source.x + (d as any).target.x) / 2)
        .attr('y', d => ((d as any).source.y + (d as any).target.y) / 2 - 8);
    });

    node.on('mouseover', (event, d) => {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        data: d
      });
    })
    .on('mousemove', (event) => {
      setTooltip(t => ({ ...t, x: event.clientX, y: event.clientY }));
    })
    .on('mouseout', () => {
      setTooltip(t => ({ ...t, visible: false }));
    });

    return () => {
      simulation.stop();
    };
  }, [entities, relationships, width, height]);

  return (
    <>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto bg-background rounded shadow-primary-glow"
      />
      {tooltip.visible && tooltip.data && (
        <div
          className="fixed z-50 bg-background rounded shadow-lg px-3 py-2 text-xs text-primary-900 border border-primary-200"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12, pointerEvents: 'none' }}
        >
          <div><span className="font-semibold">ID:</span> {tooltip.data.id}</div>
          <div><span className="font-semibold">Name:</span> {tooltip.data.name}</div>
          <div><span className="font-semibold">Label:</span> {tooltip.data.label}</div>
          <div className="mt-2 font-semibold">Relationships:</div>
          <ul className="list-disc pl-4">
            {relationships
              .filter(rel => rel.source === tooltip.data!.id || rel.target === tooltip.data!.id)
              .map(rel => {
                const isSource = rel.source === tooltip.data!.id;
                const otherId = isSource ? rel.target : rel.source;
                const other = entities.find(e => e.id === otherId);
                return (
                  <li key={rel.id}>
                    {isSource ? '→' : '←'} <span className="font-bold">{rel.type}</span>{' '}
                    {other ? (
                      <span>
                        {other.label} <span className="text-dark-400">({other.name})</span>
                      </span>
                    ) : (
                      <span className="text-red-500">[Unknown]</span>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </>
  );
};

export default SampleD3KnowledgeGraph; 