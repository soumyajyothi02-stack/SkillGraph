import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import { api } from '../../services/api';
import { GraphNode, GraphLink, NodeType } from '../../types/graph';
import { Badge } from '../Common/Badge';
import { TabType } from '../Sidebar';
import { useTheme } from '../../context/ThemeContext';

interface InteractiveGraphViewProps {
  initialFocusNodeId?: string;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const InteractiveGraphView: React.FC<InteractiveGraphViewProps> = ({
  initialFocusNodeId,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { themeConfig } = useTheme();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialFocusNodeId || '');
  const [activeTypes, setActiveTypes] = useState<Record<NodeType, boolean>>({
    Skill: true,
    Technology: true,
    JobRole: true,
    Company: true,
  });
  const [activeCypher, setActiveCypher] = useState<{ query: string; params: any } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  const nodeColors = themeConfig.graph.nodeColors;

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const activeTypeNames = Object.entries(activeTypes)
        .filter(([_, active]) => active)
        .map(([type]) => type);

      const res = await api.getGraph(activeTypeNames, searchQuery);
      setNodes(res.nodes);
      setLinks(res.links);
      if (res.cypher) setActiveCypher(res.cypher);

      if (initialFocusNodeId) {
        const found = res.nodes.find((n) => n.id.toLowerCase() === initialFocusNodeId.toLowerCase());
        if (found) setSelectedNode(found);
      }
    } catch (err) {
      console.error('Failed to load graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFocusNodeId) {
      setSearchQuery(initialFocusNodeId);
    }
  }, [initialFocusNodeId]);

  useEffect(() => {
    fetchGraphData();
  }, [activeTypes, searchQuery]);

  // Render D3 Force Simulation with Editorial Design Tokens
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 650;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Define Arrow Marker Defs
    const defs = svg.append('defs');

    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', themeConfig.graph.linkStroke);

    defs
      .append('marker')
      .attr('id', 'arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', themeConfig.graph.linkHighlight);

    const g = svg.append('g').attr('class', 'graph-container');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    const simNodes: any[] = nodes.map((d) => ({ ...d }));
    const simLinks: any[] = links.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        'link',
        d3
          .forceLink(simLinks)
          .id((d: any) => d.id)
          .distance((l: any) => {
            if (l.type === 'REQUIRED_FOR') return 100;
            if (l.type === 'USED_WITH') return 85;
            if (l.type === 'HIRED_BY') return 105;
            return 90;
          })
      )
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(36).iterations(2));

    simulationRef.current = simulation;

    // Create links
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', themeConfig.graph.linkStroke)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Link label texts
    const linkText = linkGroup
      .selectAll('.link-label')
      .data(simLinks)
      .join('text')
      .attr('class', 'link-label')
      .attr('font-size', '8.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', themeConfig.graph.linkLabel)
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text((d: any) => d.type || '');

    // Drag behavior
    const drag = (sim: d3.Simulation<any, any>) => {
      function dragstarted(event: any, d: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: any, d: any) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    // Create nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation) as any);

    // Node outer halo
    node
      .append('circle')
      .attr('r', 16)
      .attr('fill', (d: any) => nodeColors[d.label as NodeType]?.bg || 'rgba(200, 121, 65, 0.15)')
      .attr('stroke', (d: any) => nodeColors[d.label as NodeType]?.stroke || '#C87941')
      .attr('stroke-width', 1.2);

    // Node inner core
    node
      .append('circle')
      .attr('r', 8.5)
      .attr('fill', (d: any) => nodeColors[d.label as NodeType]?.fill || '#C87941');

    // Node text labels
    node
      .append('text')
      .text((d: any) => d.name || d.title || d.id)
      .attr('x', 0)
      .attr('y', 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .attr('fill', themeConfig.graph.nodeText)
      .attr('stroke', themeConfig.graph.nodeStrokeContrast)
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke')
      .attr('pointer-events', 'none');

    // Node interactions
    node
      .on('click', (event: any, d: any) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .on('mouseenter', (_: any, d: any) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      });

    // Background deselect
    svg.on('click', () => {
      setSelectedNode(null);
    });

    // Active neighbor highlighting
    const activeTargetId = selectedNode?.id || hoveredNode?.id;
    if (activeTargetId) {
      const neighborIds = new Set<string>([activeTargetId]);
      simLinks.forEach((l: any) => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === activeTargetId) neighborIds.add(tId);
        if (tId === activeTargetId) neighborIds.add(sId);
      });

      node.style('opacity', (d: any) => (neighborIds.has(d.id) ? 1 : 0.15));
      link
        .attr('stroke', (l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return sId === activeTargetId || tId === activeTargetId
            ? themeConfig.graph.linkHighlight
            : '#22221F';
        })
        .attr('stroke-width', (l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return sId === activeTargetId || tId === activeTargetId ? 2 : 0.8;
        })
        .attr('marker-end', (l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return sId === activeTargetId || tId === activeTargetId ? 'url(#arrow-highlight)' : 'url(#arrow)';
        })
        .style('opacity', (l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return sId === activeTargetId || tId === activeTargetId ? 1 : 0.08;
        });

      linkText.style('opacity', (l: any) => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        return sId === activeTargetId || tId === activeTargetId ? 1 : 0;
      });
    }

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNode, hoveredNode, themeConfig]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const toggleType = (type: NodeType) => {
    setActiveTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C87941]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Property Graph Engine</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            Interactive Graph Visualizer
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Live D3 force simulation of multi-hop openCypher ontology traversals across skills, technologies, roles, and organizations.
          </p>
        </div>

        {activeCypher && (
          <button
            onClick={() =>
              onOpenCypherInspector(
                activeCypher.query,
                activeCypher.params,
                'Full Graph Query (openCypher)',
                'Retrieves all nodes and edges in a single traversal, populating the interactive D3 force engine.'
              )
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#D8C7A5] hover:text-[#F2EFE7] bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C87941]" />
            <span>Inspect openCypher Query</span>
          </button>
        )}
      </div>

      {/* Control Bar: Search, Type Filters, Zoom Controls */}
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6E6A62] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter active nodes..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-[#11110F] border border-[#2E2E2A] rounded text-[#F2EFE7] placeholder:text-[#6E6A62] focus:outline-none focus:border-[#C87941] transition-colors"
          />
        </div>

        {/* Node Type Toggles / Legend */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleType('Skill')}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTypes.Skill
                ? 'bg-[#C87941]/20 text-[#E08C50] border border-[#C87941]/40'
                : 'bg-[#11110F] text-[#6E6A62] border border-[#2E2E2A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C87941]"></span>
            <span>Skill</span>
          </button>

          <button
            onClick={() => toggleType('Technology')}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTypes.Technology
                ? 'bg-[#D8C7A5]/20 text-[#EAE0CD] border border-[#D8C7A5]/40'
                : 'bg-[#11110F] text-[#6E6A62] border border-[#2E2E2A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8C7A5]"></span>
            <span>Technology</span>
          </button>

          <button
            onClick={() => toggleType('JobRole')}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTypes.JobRole
                ? 'bg-[#7A9A7B]/20 text-[#92B293] border border-[#7A9A7B]/40'
                : 'bg-[#11110F] text-[#6E6A62] border border-[#2E2E2A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A9A7B]"></span>
            <span>Job Role</span>
          </button>

          <button
            onClick={() => toggleType('Company')}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTypes.Company
                ? 'bg-[#C0614E]/20 text-[#D47562] border border-[#C0614E]/40'
                : 'bg-[#11110F] text-[#6E6A62] border border-[#2E2E2A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0614E]"></span>
            <span>Company</span>
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-[#A7A39A] hover:text-[#F2EFE7] bg-[#11110F] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-[#A7A39A] hover:text-[#F2EFE7] bg-[#11110F] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-[#A7A39A] hover:text-[#F2EFE7] bg-[#11110F] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors"
            title="Reset Zoom / Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[620px] border border-[#2E2E2A] rounded-lg overflow-hidden transition-colors"
        style={{ backgroundColor: themeConfig.graph.background }}
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#11110F]/80 backdrop-blur-xs">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border border-[#C87941] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-[#A7A39A]">Evaluating openCypher Simulation...</p>
            </div>
          </div>
        )}

        {/* D3 Graph SVG */}
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Graph Meta Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-[#191917]/90 backdrop-blur-xs border border-[#2E2E2A] px-3 py-1.5 rounded text-[11px] font-mono text-[#A7A39A] flex items-center gap-3">
          <span>
            Nodes: <strong className="text-[#F2EFE7] font-semibold">{nodes.length}</strong>
          </span>
          <span className="text-[#6E6A62]">•</span>
          <span>
            Edges: <strong className="text-[#F2EFE7] font-semibold">{links.length}</strong>
          </span>
        </div>

        {/* Selected Node Details Inspector Drawer (Right Side) */}
        {selectedNode && (
          <div className="absolute top-3 right-3 z-20 w-80 bg-[#191917]/95 backdrop-blur-xs border border-[#2E2E2A] rounded-lg p-5 shadow-xl space-y-4 animate-fade-in max-h-[92%] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  variant={
                    selectedNode.label === 'Skill'
                      ? 'skill'
                      : selectedNode.label === 'Technology'
                      ? 'tech'
                      : selectedNode.label === 'JobRole'
                      ? 'role'
                      : 'company'
                  }
                >
                  {selectedNode.label}
                </Badge>
                <h3 className="font-editorial text-lg text-[#F2EFE7] mt-1.5">
                  {selectedNode.name || selectedNode.title || selectedNode.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-[#6E6A62] hover:text-[#F2EFE7] hover:bg-[#22221F] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Properties List */}
            <div className="space-y-1.5 text-xs font-mono">
              {selectedNode.category && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Category:</span>
                  <span className="text-[#F2EFE7]">{selectedNode.category}</span>
                </div>
              )}
              {selectedNode.difficulty && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Difficulty:</span>
                  <span className="text-[#F2EFE7]">{selectedNode.difficulty}</span>
                </div>
              )}
              {selectedNode.type && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Type:</span>
                  <span className="text-[#F2EFE7]">{selectedNode.type}</span>
                </div>
              )}
              {selectedNode.experienceLevel && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Experience:</span>
                  <span className="text-[#F2EFE7]">{selectedNode.experienceLevel}</span>
                </div>
              )}
              {selectedNode.salaryRange && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Salary:</span>
                  <span className="text-[#7A9A7B]">{selectedNode.salaryRange}</span>
                </div>
              )}
              {selectedNode.industry && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Industry:</span>
                  <span className="text-[#F2EFE7]">{selectedNode.industry}</span>
                </div>
              )}
              {selectedNode.location && (
                <div className="flex justify-between py-1 border-b border-[#2E2E2A]">
                  <span className="text-[#6E6A62]">Location:</span>
                  <span className="text-[#F2EFE7]">{selectedNode.location}</span>
                </div>
              )}
              {selectedNode.description && (
                <p className="text-xs font-sans text-[#A7A39A] pt-1.5 leading-relaxed">{selectedNode.description}</p>
              )}
            </div>

            {/* Jump into Dedicated Explorer */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const name = selectedNode.name || selectedNode.title || selectedNode.id;
                  if (selectedNode.label === 'Skill') onNavigate('skills', name);
                  else if (selectedNode.label === 'Technology') onNavigate('technologies', name);
                  else if (selectedNode.label === 'JobRole') onNavigate('roles', name);
                  else if (selectedNode.label === 'Company') onNavigate('companies', name);
                  else onNavigate('connections', name);
                }}
                className="w-full py-2 px-3 text-xs font-mono text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Entity Inspector</span>
                <ExternalLink className="w-3 h-3 text-[#C87941]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
