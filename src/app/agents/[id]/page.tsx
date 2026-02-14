"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { agents, marketIntelligenceFlow, sampleTrace } from "@/data/mock";
import type { TraceStep, IntegrationSource } from "@/data/mock";
import {
  ArrowLeft,
  Play,
  FlaskConical,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  SkipForward,
  StopCircle,
  BadgeCheck,
  GitFork,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const nodeTypeColors: Record<string, string> = {
  trigger: "#60a5fa",
  model: "#a78bfa",
  tool: "#2dd4bf",
  condition: "#fbbf24",
  security: "#f97316",
  action: "#34d399",
  human: "#f472b6",
  agent: "#e8622c",
};

const nodeTypeLabels: Record<string, string> = {
  trigger: "Trigger",
  model: "Model",
  tool: "Tool",
  condition: "Condition",
  security: "Security",
  action: "Action",
  human: "Human",
  agent: "Agent",
};

const CustomNode = ({ data }: NodeProps) => {
  const color = nodeTypeColors[data.nodeType as string] ?? "#999";

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-bg-elevated !border !border-border-default"
      />
      <div
        className="bg-bg-elevated border border-border-default rounded-lg pl-0 pr-4 py-2.5 min-w-[160px] flex items-center gap-3 shadow-lg"
        style={{ borderLeftWidth: 4, borderLeftColor: color }}
      >
        <div className="pl-3 flex flex-col gap-0.5">
          <span
            className="text-[9px] font-mono uppercase tracking-wider"
            style={{ color }}
          >
            {nodeTypeLabels[data.nodeType as string] ?? data.nodeType}
          </span>
          <span className="text-[12px] text-text-primary font-medium leading-tight">
            {data.label as string}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-bg-elevated !border !border-border-default"
      />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const sourceConfig: Record<
  IntegrationSource,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  kraken: { label: "Verified", icon: BadgeCheck, className: "text-accent" },
  community: {
    label: "Community",
    icon: GitFork,
    className: "text-text-secondary",
  },
  custom: {
    label: "Custom",
    icon: Terminal,
    className: "text-text-secondary",
  },
};

const SourceBadge = ({
  source,
  detail,
}: {
  source: IntegrationSource;
  detail?: string;
}) => {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={10} className={config.className} />
      <span
        className={cn(
          "text-[10px] font-mono",
          source === "kraken" ? "text-accent/70" : "text-text-muted"
        )}
      >
        {detail ?? config.label}
      </span>
    </span>
  );
};

const agent = agents[0];

const rfNodes: Node[] = marketIntelligenceFlow.nodes.map((n) => ({
  id: n.id,
  position: { x: n.x, y: n.y },
  data: { label: n.label, nodeType: n.type },
  type: "custom",
}));

const rfEdges: Edge[] = marketIntelligenceFlow.edges.map((e) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  label: e.label,
  style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
  labelStyle: {
    fill: "#999",
    fontSize: 10,
    fontFamily: "var(--font-mono), monospace",
  },
  labelBgStyle: {
    fill: "#111",
    fillOpacity: 0.9,
  },
  labelBgPadding: [6, 3] as [number, number],
  labelBgBorderRadius: 4,
}));

const statusIcons: Record<TraceStep["status"], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  running: Clock,
  skipped: SkipForward,
};

const statusColors: Record<TraceStep["status"], string> = {
  success: "text-success",
  error: "text-error",
  running: "text-warning",
  skipped: "text-text-muted",
};

const TraceStepRow = ({ step }: { step: TraceStep }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = statusIcons[step.status];
  const color = nodeTypeColors[step.nodeType] ?? "#999";

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[13px] text-text-primary flex-1 font-medium">
          {step.nodeLabel}
        </span>
        <Icon
          size={14}
          className={cn("shrink-0", statusColors[step.status])}
        />
        <span className="text-[11px] font-mono text-text-muted w-16 text-right shrink-0">
          {step.duration >= 1000
            ? `${(step.duration / 1000).toFixed(1)}s`
            : `${step.duration}ms`}
        </span>
        {expanded ? (
          <ChevronDown size={14} className="text-text-muted shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-text-muted shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {step.input && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                Input
              </div>
              <div className="text-[12px] font-mono text-text-secondary bg-bg-primary rounded-md px-3 py-2 border border-border-subtle">
                {step.input}
              </div>
            </div>
          )}
          {step.output && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                Output
              </div>
              <div className="text-[12px] font-mono text-text-secondary bg-bg-primary rounded-md px-3 py-2 border border-border-subtle">
                {step.output}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AgentDetailPage = () => {
  const [activeTab, setActiveTab] = useState<"builder" | "runs">("builder");

  const onInit = useCallback(() => {}, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-medium text-text-primary">
              {agent.name}
            </h1>
            <span className="text-[10px] font-mono text-text-muted border border-border-subtle rounded px-1.5 py-0.5">
              v{agent.version}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 rounded px-1.5 py-0.5">
              Published
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Running
            </span>
            <SourceBadge
              source={agent.source}
              detail={agent.sourceDetail}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-red-500/30 text-red-400 rounded-lg px-3.5 py-1.5 text-[13px] font-medium hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
            <StopCircle size={14} />
            Kill
          </button>
          <button className="flex items-center gap-2 border border-border-default text-text-secondary rounded-lg px-3.5 py-1.5 text-[13px] font-medium hover:text-text-primary hover:border-border-default transition-colors">
            <FlaskConical size={14} />
            Dry Run
          </button>
          <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors">
            <Play size={14} />
            Run Now
          </button>
          <button className="border border-border-default text-text-muted rounded-lg p-1.5 hover:text-text-secondary transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border-subtle mb-6">
        <button
          onClick={() => setActiveTab("builder")}
          className={cn(
            "text-[13px] font-medium pb-2.5 -mb-px transition-colors",
            activeTab === "builder"
              ? "text-text-primary border-b-2 border-accent"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Builder
        </button>
        <button
          onClick={() => setActiveTab("runs")}
          className={cn(
            "text-[13px] font-medium pb-2.5 -mb-px transition-colors",
            activeTab === "runs"
              ? "text-text-primary border-b-2 border-accent"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Runs
        </button>
      </div>

      {/* Builder Tab */}
      {activeTab === "builder" && (
        <div className="space-y-6">
          <div
            className="rounded-xl border border-border-subtle overflow-hidden"
            style={{ height: 520 }}
          >
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              onInit={onInit}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnScroll
              zoomOnScroll
              minZoom={0.5}
              maxZoom={1.5}
            >
              <Background
                variant={"dots" as never}
                gap={20}
                size={1}
                color="rgba(255,255,255,0.05)"
              />
              <Controls
                showInteractive={false}
                position="bottom-right"
              />
              <MiniMap
                nodeColor={() => "rgba(255,255,255,0.15)"}
                maskColor="rgba(0,0,0,0.7)"
                position="bottom-left"
              />
            </ReactFlow>
          </div>

          {/* Node Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(nodeTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] font-mono text-text-muted capitalize">
                  {type}
                </span>
              </div>
            ))}
          </div>

          {/* Agent Properties */}
          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
            <h3 className="text-[13px] font-medium text-text-primary mb-4">
              Agent Properties
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Trigger
                </div>
                <div className="text-[13px] text-text-primary">
                  {agent.triggers.join(", ")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Success Rate
                </div>
                <div className="text-[13px] font-mono text-text-primary">
                  {agent.successRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Total Runs
                </div>
                <div className="text-[13px] font-mono text-text-primary">
                  {agent.totalRuns.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Avg Latency
                </div>
                <div className="text-[13px] font-mono text-text-primary">
                  {(agent.avgLatency / 1000).toFixed(1)}s
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Permissions
                </div>
                <div className="text-[13px] text-text-primary">
                  Workflow-defined
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Concurrency
                </div>
                <div className="text-[13px] font-mono text-text-primary">
                  1 (sequential)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Runs Tab */}
      {activeTab === "runs" && (
        <div className="space-y-4">
          {/* Run summary */}
          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-medium text-text-primary">
                Latest Execution
              </h3>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-success">
                  <CheckCircle2 size={13} />
                  Success
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Total: 2.85s
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-bg-primary rounded-lg border border-border-subtle overflow-hidden">
              {sampleTrace.map((step) => (
                <TraceStepRow key={step.id} step={step} />
              ))}
            </div>
          </div>

          {/* Recent runs list */}
          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
            <h3 className="text-[13px] font-medium text-text-primary mb-4">
              Run History
            </h3>
            <div className="space-y-2">
              {[
                {
                  id: "run-003",
                  time: "14:15",
                  status: "success" as const,
                  duration: "2.34s",
                  tokens: "6,200",
                },
                {
                  id: "run-005",
                  time: "13:15",
                  status: "error" as const,
                  duration: "4.50s",
                  tokens: "3,100",
                },
                {
                  id: "run-prev1",
                  time: "12:15",
                  status: "success" as const,
                  duration: "2.18s",
                  tokens: "5,800",
                },
                {
                  id: "run-prev2",
                  time: "11:15",
                  status: "success" as const,
                  duration: "2.52s",
                  tokens: "6,400",
                },
                {
                  id: "run-prev3",
                  time: "10:15",
                  status: "success" as const,
                  duration: "2.01s",
                  tokens: "5,200",
                },
              ].map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-bg-primary border border-border-subtle"
                >
                  {run.status === "success" ? (
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-error shrink-0" />
                  )}
                  <span className="text-[12px] font-mono text-text-secondary w-12">
                    {run.time}
                  </span>
                  <span className="text-[12px] text-text-primary flex-1">
                    Market Intelligence
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {run.duration}
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {run.tokens} tokens
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetailPage;
