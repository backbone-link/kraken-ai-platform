"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  getSmoothStepPath,
  addEdge,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type NodeProps,
  type EdgeProps,
  type Connection,
  type ReactFlowInstance,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { agents, agentFlows, detailedAgentRuns } from "@/data/mock";
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
  OctagonX,
  Zap,
  Brain,
  Wrench,
  Send,
  GitBranch,
  Shield,
  User,
  Bot,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn, formatDuration } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  useExecutionSimulation,
  type NodeExecutionState,
} from "@/hooks/use-execution-simulation";

const nodeTypeColors: Record<string, string> = {
  trigger: "#60a5fa",
  model: "#a78bfa",
  tool: "#2dd4bf",
  condition: "#fbbf24",
  security: "#f97316",
  action: "#34d399",
  human: "#f472b6",
  agent: "#e8622c",
  report: "#ef4444",
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
  report: "Report",
};

const nodeTypeIcons: Record<string, typeof Zap> = {
  trigger: Zap,
  model: Brain,
  tool: Wrench,
  action: Send,
  condition: GitBranch,
  security: Shield,
  human: User,
  agent: Bot,
  report: FileText,
};

interface NodeConfig {
  title: string;
  model?: string;
  systemPrompt?: string;
  tools?: string[];
  skills?: string[];
}

const nodeCategories = [
  { type: "trigger", label: "Trigger", description: "Start the workflow", icon: Zap },
  { type: "model", label: "Model", description: "LLM inference step", icon: Brain },
  { type: "tool", label: "Tool", description: "External tool call", icon: Wrench },
  { type: "action", label: "Action", description: "Perform an operation", icon: Send },
  { type: "condition", label: "Condition", description: "Branch logic", icon: GitBranch },
  { type: "security", label: "Security", description: "Safety guardrail", icon: Shield },
  { type: "human", label: "Human", description: "Human-in-the-loop", icon: User },
  { type: "agent", label: "Agent", description: "Invoke sub-agent", icon: Bot },
  { type: "report", label: "Output", description: "Emit results", icon: FileText },
];

const availableModels = [
  { id: "gpt-5.2", name: "GPT-5.2", provider: "OpenAI" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI" },
  { id: "o4-mini", name: "o4-mini", provider: "OpenAI" },
  { id: "claude-opus-4.6", name: "Claude Opus 4.6", provider: "Anthropic" },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", provider: "Anthropic" },
  { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "Meta" },
  { id: "llama-4-scout", name: "Llama 4 Scout", provider: "Meta" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google" },
  { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "Google" },
];

const availableTools = [
  "Web Search",
  "Code Execution",
  "Data Analysis",
  "Image Generation",
  "Document Parsing",
  "API Integration",
  "Database Query",
  "File Management",
];

const availableAgentSkills = [
  "Competitor Deep Dive",
  "Report Builder",
  "Response Drafter",
  "Price Validator",
  "Inventory Reconciler",
  "Ticket Summarizer",
  "Bulk Updater",
  "Compliance Auditor",
];

const flowNodeConfigs: Record<string, Record<string, NodeConfig>> = {
  "agt-001": {
    n1: { title: "Cron: Every Hour" },
    n2: { title: "Input Validation" },
    n5: {
      title: "Analyze Trends",
      model: "gpt-5.2",
      systemPrompt:
        "You are a market intelligence analyst. Analyze real-time pricing data, competitor movements, and market trends across e-commerce platforms. Identify arbitrage opportunities where price differentials exceed 15% after fees. Flag anomalies and provide confidence scores for each recommendation.",
      tools: ["Web Search", "Data Analysis", "API Integration"],
      skills: ["Competitor Deep Dive", "Report Builder"],
    },
    n3: { title: "Fetch Market Data" },
    n4: { title: "Fetch Competitor Prices" },
    n7: { title: "Output Validation" },
    n6: { title: "Arbitrage Found?" },
    n10: { title: "Manager Approval" },
    n8: { title: "Send Slack Alert" },
    n9: { title: "Update Dashboard" },
  },
  "agt-002": {
    t1: { title: "Cron: Every 30m" },
    s1: { title: "Auth & Rate Check" },
    m1: {
      title: "Reconcile Inventory",
      model: "claude-sonnet-4.5",
      systemPrompt:
        "You are an inventory reconciliation specialist. Compare warehouse database levels against Shopify storefront quantities. Identify discrepancies, determine root causes (shrinkage, sync lag, returns processing), and generate corrective adjustment entries. Prioritize high-velocity SKUs.",
      tools: ["Database Query", "Data Analysis", "API Integration"],
      skills: ["Inventory Reconciler", "Bulk Updater"],
    },
    t2: { title: "Query Warehouse DB" },
    t3: { title: "Sync Shopify Levels" },
    s2: { title: "Data Integrity Check" },
    c1: { title: "Conflicts Found?" },
    a1: { title: "Push Inventory Updates" },
    a2: { title: "Notify Slack" },
    a3: { title: "Log: No Changes" },
  },
  "agt-003": {
    t1: { title: "Daily Schedule" },
    s1: { title: "Data Access Auth" },
    m1: {
      title: "Forecast Demand",
      model: "gpt-5.2",
      systemPrompt:
        "You are a demand forecasting engine. Analyze historical sales data, seasonal patterns, market signals, and external factors to generate 7-day and 30-day demand forecasts by product category. Use statistical methods combined with qualitative market intelligence. Output structured forecasts with confidence intervals.",
      tools: ["Data Analysis", "Code Execution", "Database Query"],
      skills: ["Report Builder", "Compliance Auditor"],
    },
    t2: { title: "Fetch Historical Sales" },
    t3: { title: "Fetch Market Signals" },
    s2: { title: "Output Audit" },
    a1: { title: "Write to Snowflake" },
  },
  "agt-004": {
    t1: { title: "Zendesk Webhook" },
    s1: { title: "Content Safety Check" },
    m1: {
      title: "Classify & Route",
      model: "gpt-5-mini",
      systemPrompt:
        "You are a customer support triage agent. Read incoming Zendesk tickets, classify priority (P1\u2013P4), identify product category, detect sentiment, and route to the appropriate team. For P1/P2 issues, extract key details for escalation. For P3+ issues, draft an initial response using the knowledge base. Never expose internal system details.",
      tools: ["Document Parsing", "API Integration", "Web Search"],
      skills: ["Ticket Summarizer", "Response Drafter"],
    },
    tl1: { title: "Zendesk: Read Ticket" },
    tl2: { title: "Knowledge Base Lookup" },
    s2: { title: "Response Safety Scan" },
    c1: { title: "Priority Level?" },
    a1: { title: "Update Zendesk Ticket" },
    a2: { title: "Escalate via Slack" },
    a3: { title: "Send Auto-Response" },
    r1: { title: "Incident Report" },
    a4: { title: "Alert #security-incidents" },
  },
  "agt-005": {
    t1: { title: "Schedule / Manual" },
    s1: { title: "Permission Check" },
    m1: {
      title: "Optimize Prices",
      model: "gpt-5.2",
      systemPrompt:
        "You are a pricing optimization engine. Analyze current product prices against competitor pricing, demand elasticity, inventory levels, and margin targets. Recommend price adjustments that maximize revenue while maintaining competitive positioning. Flag any changes that would breach minimum price floors or maximum discount thresholds.",
      tools: ["Data Analysis", "API Integration", "Code Execution"],
      skills: ["Price Validator", "Competitor Deep Dive"],
    },
    t2: { title: "Fetch Current Prices" },
    t3: { title: "Fetch Competitor Prices" },
    s2: { title: "Price Change Audit" },
    c1: { title: "Floor Hit?" },
    a1: { title: "Apply Price Changes" },
    h1: { title: "Manager Review" },
  },
};

interface TooltipData {
  runId: string;
  stepName: string;
  triggeredBy: string;
  model?: string;
  tokensUsed: number;
  elapsed: string;
  stepProgress: string;
}

const executionRingClass: Record<NodeExecutionState, string> = {
  idle: "",
  executing: "ring-2 ring-blue-400 node-executing",
  completed: "ring-1 ring-emerald-400/50 node-completed",
  error: "ring-1 ring-red-400/50 node-error",
};

const ExecutionBadge = ({ runId }: { runId: string }) => (
  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 run-id-badge flex items-center gap-1.5 bg-bg-elevated border border-border-default rounded-full px-2 py-0.5 whitespace-nowrap">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-gentle-pulse" />
    <span className="text-[9px] font-mono text-blue-400">{runId}</span>
  </div>
);

const ExecutionTooltip = ({ data }: { data: TooltipData }) => (
  <motion.div
    initial={{ opacity: 0, y: 4, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 4, scale: 0.96 }}
    transition={{ duration: 0.15 }}
    className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-50 bg-bg-elevated border border-border-default rounded-lg shadow-2xl px-3.5 py-2.5 min-w-[200px]"
  >
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-muted">Run ID</span>
        <span className="text-[10px] font-mono text-text-primary">{data.runId}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-muted">Step</span>
        <span className="text-[10px] font-mono text-text-primary">{data.stepName}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-muted">Triggered by</span>
        <span className="text-[10px] font-mono text-text-primary">{data.triggeredBy}</span>
      </div>
      {data.model && (
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-text-muted">Model</span>
          <span className="text-[10px] font-mono text-text-primary">{data.model}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-muted">Tokens</span>
        <span className="text-[10px] font-mono text-text-primary">{data.tokensUsed.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-muted">Elapsed</span>
        <span className="text-[10px] font-mono text-text-primary">{data.elapsed}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-muted">Progress</span>
        <span className="text-[10px] font-mono text-blue-400">{data.stepProgress}</span>
      </div>
    </div>
  </motion.div>
);

const CustomNode = ({ data }: NodeProps) => {
  const color = nodeTypeColors[data.nodeType as string] ?? "#999";
  const isSecurity = data.nodeType === "security";
  const execState = (data.executionState as NodeExecutionState | undefined) ?? "idle";
  const runId = data.runId as string | undefined;
  const isExecuting = execState === "executing";
  const isClickable = execState === "executing" || execState === "completed";
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (isClickable && runId && data.stepId) {
      router.push(`/?runId=${runId}&stepId=${data.stepId as string}`);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-bg-elevated !border !border-border-default"
      />
      <div
        className={cn(
          "bg-bg-elevated border border-border-default rounded-lg pl-0 pr-4 py-2.5 min-w-[160px] flex items-center gap-3 shadow-lg transition-shadow",
          executionRingClass[execState]
        )}
        style={{ borderLeftWidth: 4, borderLeftColor: color }}
      >
        <div className="pl-3 flex flex-col gap-0.5">
          <span
            className="text-[9px] font-mono uppercase tracking-wider flex items-center gap-1"
            style={{ color }}
          >
            {(() => {
              const Icon = nodeTypeIcons[data.nodeType as string];
              return Icon ? <Icon size={10} /> : null;
            })()}
            {nodeTypeLabels[data.nodeType as string] ?? data.nodeType}
          </span>
          <span className="text-[12px] text-text-primary font-medium leading-tight">
            {data.label as string}
          </span>
        </div>
        {execState === "completed" && (
          <CheckCircle2 size={12} className="text-emerald-400 shrink-0 ml-auto" />
        )}
        {execState === "error" && (
          <XCircle size={12} className="text-red-400 shrink-0 ml-auto" />
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-bg-elevated !border !border-border-default"
      />
      {isSecurity && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="kill"
          className="!w-2 !h-2 !bg-red-500/30 !border !border-red-500"
        />
      )}
      {isExecuting && runId && <ExecutionBadge runId={runId} />}
      <AnimatePresence>
        {hovered && isExecuting && data.tooltipData ? (
          <ExecutionTooltip data={data.tooltipData as TooltipData} />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const ModelNode = ({ data }: NodeProps) => {
  const execState = (data.executionState as NodeExecutionState | undefined) ?? "idle";
  const runId = data.runId as string | undefined;
  const isExecuting = execState === "executing";
  const isClickable = execState === "executing" || execState === "completed";
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (isClickable && runId && data.stepId) {
      router.push(`/?runId=${runId}&stepId=${data.stepId as string}`);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-[#a78bfa]/20 !border-2 !border-[#a78bfa]/60"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-[#a78bfa]/20 !border-2 !border-[#a78bfa]/60"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="tool-t"
        className="!w-2 !h-2 !bg-[#2dd4bf]/20 !border !border-[#2dd4bf]/60"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="tool-b"
        className="!w-2 !h-2 !bg-[#2dd4bf]/20 !border !border-[#2dd4bf]/60"
      />
      <div
        className={cn(
          "bg-[#a78bfa]/[0.06] border-2 border-[#a78bfa]/30 rounded-xl px-5 py-3.5 min-w-[220px] shadow-[0_0_24px_rgba(167,139,250,0.10)] transition-shadow",
          executionRingClass[execState]
        )}
      >
        <span className="text-[9px] font-mono uppercase tracking-wider text-[#a78bfa] flex items-center gap-1">
          <Brain size={10} />
          Model
        </span>
        <div className="text-[13px] text-text-primary font-semibold leading-tight mt-0.5 flex items-center gap-2">
          {data.label as string}
          {execState === "completed" && (
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          )}
          {execState === "error" && (
            <XCircle size={12} className="text-red-400 shrink-0" />
          )}
        </div>
      </div>
      {isExecuting && runId && <ExecutionBadge runId={runId} />}
      <AnimatePresence>
        {hovered && isExecuting && data.tooltipData ? (
          <ExecutionTooltip data={data.tooltipData as TooltipData} />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const ToolNode = ({ data }: NodeProps) => {
  const execState = (data.executionState as NodeExecutionState | undefined) ?? "idle";
  const runId = data.runId as string | undefined;
  const isExecuting = execState === "executing";
  const isClickable = execState === "executing" || execState === "completed";
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (isClickable && runId && data.stepId) {
      router.push(`/?runId=${runId}&stepId=${data.stepId as string}`);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="!w-1.5 !h-1.5 !bg-[#2dd4bf]/20 !border !border-[#2dd4bf]/50"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-1.5 !h-1.5 !bg-[#2dd4bf]/20 !border !border-[#2dd4bf]/50"
      />
      <div
        className={cn(
          "border border-dashed border-[#2dd4bf]/30 rounded-full px-3.5 py-1.5 bg-[#2dd4bf]/[0.04] flex items-center gap-2 transition-shadow",
          executionRingClass[execState]
        )}
      >
        <Wrench size={10} className="text-[#2dd4bf]/60 shrink-0" />
        <span className="text-[11px] text-[#2dd4bf]/70 font-medium whitespace-nowrap">
          {data.label as string}
        </span>
        {execState === "completed" && (
          <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
        )}
        {execState === "error" && (
          <XCircle size={10} className="text-red-400 shrink-0" />
        )}
      </div>
      {isExecuting && runId && <ExecutionBadge runId={runId} />}
      <AnimatePresence>
        {hovered && isExecuting && data.tooltipData ? (
          <ExecutionTooltip data={data.tooltipData as TooltipData} />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const isActive = data?.isActive as boolean;
  const isCompleted = data?.isCompleted as boolean;

  return (
    <g>
      <path
        id={`edge-${id}`}
        d={edgePath}
        fill="none"
        stroke={
          isActive
            ? "#60a5fa"
            : isCompleted
              ? "rgba(74,202,138,0.5)"
              : "rgba(255,255,255,0.20)"
        }
        strokeWidth={isActive ? 2.5 : isCompleted ? 2 : 1.5}
      />
      {isActive && (
        <circle r="3" fill="#60a5fa">
          <animateMotion dur="1.5s" repeatCount="indefinite">
            <mpath xlinkHref={`#edge-${id}`} />
          </animateMotion>
        </circle>
      )}
    </g>
  );
};

const nodeTypes = { custom: CustomNode, modelNode: ModelNode, toolNode: ToolNode };
const edgeTypes = { animated: AnimatedEdge };

const ComponentPalette = ({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, type: string) => void;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    {nodeCategories.map((cat) => {
      const color = nodeTypeColors[cat.type];
      const Icon = cat.icon;
      return (
        <div
          key={cat.type}
          draggable
          onDragStart={(e) => onDragStart(e, cat.type)}
          className="group flex items-center gap-2.5 bg-bg-secondary border border-border-subtle rounded-lg px-3.5 py-2.5 cursor-grab active:cursor-grabbing hover:border-border-default hover:bg-white/[0.02] transition-all select-none"
          style={{ borderLeftWidth: 3, borderLeftColor: color }}
        >
          <Icon
            size={14}
            className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ color }}
          />
          <div>
            <div className="text-[11px] font-medium text-text-primary leading-tight">
              {cat.label}
            </div>
            <div className="text-[9px] text-text-muted leading-tight">
              {cat.description}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const NodeConfigPanel = ({
  nodeType,
  config,
  onUpdate,
  onClose,
}: {
  nodeType: string;
  config: NodeConfig;
  onUpdate: (config: NodeConfig) => void;
  onClose: () => void;
}) => {
  const color = nodeTypeColors[nodeType] ?? "#999";

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-[13px] font-medium text-text-primary">
            Configure {nodeTypeLabels[nodeType] ?? nodeType}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
            Title
          </label>
          <input
            value={config.title}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            className="w-full bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30 transition-colors"
            placeholder={`Name this ${nodeTypeLabels[nodeType]?.toLowerCase() ?? "node"}...`}
          />
        </div>

        {nodeType === "model" && (
          <>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                Model
              </label>
              <select
                value={config.model ?? ""}
                onChange={(e) =>
                  onUpdate({ ...config, model: e.target.value })
                }
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/30 transition-colors"
              >
                <option value="">Select a model...</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} &mdash; {m.provider}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                System Prompt
              </label>
              <textarea
                value={config.systemPrompt ?? ""}
                onChange={(e) =>
                  onUpdate({ ...config, systemPrompt: e.target.value })
                }
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30 transition-colors resize-none"
                rows={4}
                placeholder="Enter system instructions for this model..."
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                Tools
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTools.map((tool) => {
                  const active = config.tools?.includes(tool) ?? false;
                  return (
                    <button
                      key={tool}
                      onClick={() => {
                        const current = config.tools ?? [];
                        onUpdate({
                          ...config,
                          tools: active
                            ? current.filter((t) => t !== tool)
                            : [...current, tool],
                        });
                      }}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full border transition-all",
                        active
                          ? "bg-accent/10 text-accent border-accent/20"
                          : "text-text-muted border-border-subtle hover:border-border-default hover:text-text-secondary"
                      )}
                    >
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                Skills
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableAgentSkills.map((skill) => {
                  const active = config.skills?.includes(skill) ?? false;
                  return (
                    <button
                      key={skill}
                      onClick={() => {
                        const current = config.skills ?? [];
                        onUpdate({
                          ...config,
                          skills: active
                            ? current.filter((s) => s !== skill)
                            : [...current, skill],
                        });
                      }}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full border transition-all",
                        active
                          ? "bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/20"
                          : "text-text-muted border-border-subtle hover:border-border-default hover:text-text-secondary"
                      )}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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

const statusIcons: Record<TraceStep["status"], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  running: Clock,
  skipped: SkipForward,
  pending: Clock,
};

const statusColors: Record<TraceStep["status"], string> = {
  success: "text-success",
  error: "text-error",
  running: "text-warning",
  skipped: "text-text-muted",
  pending: "text-text-muted",
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
          {formatDuration(step.duration)}
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
  const params = useParams();
  const agentId = params.id as string;
  const agent = agents.find((a) => a.id === agentId) ?? agents[0];
  const flow = agentFlows[agent.id];
  const agentRuns = detailedAgentRuns.filter((r) => r.agentId === agent.id);
  const latestRun = agentRuns[0];

  const [activeTab, setActiveTab] = useState<"builder" | "runs">("builder");

  const isRunning = agent.status === "running";
  const simulationRun = agentRuns.find((r) => r.id === "drun-001");
  const simulationSteps = simulationRun?.traceSteps ?? [];
  const simulationEdges = useMemo(
    () => flow?.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })) ?? [],
    [flow]
  );

  const getStepDuration = useCallback(
    (step: { nodeType: string }) =>
      step.nodeType === "model" ? 10000 : 1800,
    []
  );

  const { progress } = useExecutionSimulation({
    steps: simulationSteps,
    edges: simulationEdges,
    runId: "drun-015",
    autoStart: isRunning,
    stepIntervalMs: 1800,
    getStepDuration,
  });

  const shouldShowExecution = isRunning && activeTab === "builder";

  const rfNodes: Node[] = useMemo(() => {
    if (!flow) return [];
    return flow.nodes.map((n) => {
      const execState: NodeExecutionState = shouldShowExecution
        ? (progress.nodeStates.get(n.id) ?? "idle")
        : "idle";

      const currentStep = progress.currentStep;
      const stepForNode = simulationSteps.find((s) => s.nodeId === n.id);

      const tooltipData = execState === "executing" && currentStep
        ? {
            runId: "drun-015",
            stepName: currentStep.nodeLabel,
            triggeredBy: simulationRun?.triggeredBy ?? "Cron (hourly)",
            model: currentStep.modelInfo?.model,
            tokensUsed: simulationRun?.tokensUsed ?? 0,
            elapsed: `${(progress.elapsedMs / 1000).toFixed(1)}s`,
            stepProgress: `Step ${progress.currentStepIndex + 1} of ${simulationSteps.length}`,
          }
        : undefined;

      return {
        id: n.id,
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          nodeType: n.type,
          executionState: execState,
          runId: shouldShowExecution ? "drun-015" : undefined,
          stepId: stepForNode?.id,
          tooltipData,
        },
        type: n.type === "model" ? "modelNode" : n.type === "tool" ? "toolNode" : "custom",
      };
    });
  }, [flow, shouldShowExecution, progress, simulationSteps, simulationRun]);

  const rfEdges: Edge[] = useMemo(() => {
    if (!flow) return [];
    return flow.edges.map((e) => {
      const isToolCall = e.label === "tool call";
      const isKill = e.label?.includes("KILL") ?? false;

      if (shouldShowExecution) {
        const isActive = progress.activeEdgeId === e.id;
        const isCompleted = progress.completedEdges.has(e.id);

        if (isActive || isCompleted) {
          return {
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type: "animated",
            data: { isActive, isCompleted },
          };
        }
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label,
        type: "smoothstep",
        animated: isToolCall,
        style: {
          stroke: isKill ? "#ef4444" : isToolCall ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.20)",
          strokeWidth: isKill ? 2 : 1.5,
          strokeDasharray: isToolCall ? "6 3" : isKill ? "6 3" : undefined,
        },
        labelStyle: {
          fill: isKill ? "#ef4444" : isToolCall ? "#2dd4bf" : "#a3a3a3",
          fontSize: 10,
          fontFamily: "var(--font-mono), monospace",
          fontWeight: isKill ? 600 : 400,
        },
        labelBgStyle: { fill: "#1a1a1a", fillOpacity: 0.95 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: isKill ? { type: MarkerType.ArrowClosed, color: "#ef4444" } : undefined,
      };
    });
  }, [flow, shouldShowExecution, progress]);

  const [nodeDimensions, setNodeDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [addedNodes, setAddedNodes] = useState<Node[]>([]);
  const [addedEdges, setAddedEdges] = useState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, NodeConfig>>({});

  const effectiveNodeConfigs = useMemo(() => {
    const defaults: Record<string, NodeConfig> = {};
    if (flow) {
      for (const node of flow.nodes) {
        defaults[node.id] =
          flowNodeConfigs[agent.id]?.[node.id] ?? { title: node.label };
      }
    }
    return { ...defaults, ...nodeConfigs };
  }, [flow, agent.id, nodeConfigs]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodeDimensions((prev) => {
      let next = prev;
      for (const change of changes) {
        if (change.type === "dimensions" && change.dimensions) {
          const existing = prev[change.id];
          if (
            !existing ||
            existing.width !== change.dimensions.width ||
            existing.height !== change.dimensions.height
          ) {
            if (next === prev) next = { ...prev };
            next[change.id] = change.dimensions;
          }
        }
      }
      return next;
    });
    setAddedNodes((prev) => {
      if (prev.length === 0) return prev;
      const addedIds = new Set(prev.map((n) => n.id));
      const relevant = changes.filter((c) => "id" in c && addedIds.has(c.id));
      if (relevant.length === 0) return prev;
      return applyNodeChanges(relevant, prev) as Node[];
    });
  }, []);

  const displayNodes = useMemo(
    () =>
      rfNodes.map((node) => {
        const dims = nodeDimensions[node.id];
        return dims ? { ...node, measured: dims } : node;
      }),
    [rfNodes, nodeDimensions],
  );

  const allNodes = useMemo(() => {
    const annotated = addedNodes.map((n) => {
      const config = nodeConfigs[n.id];
      const defaultLabel = n.data.label as string;
      return {
        ...n,
        data: {
          ...n.data,
          label: config?.title || defaultLabel,
        },
      };
    });
    return [...displayNodes, ...annotated];
  }, [displayNodes, addedNodes, nodeConfigs]);

  const allEdges = useMemo(
    () => [...rfEdges, ...addedEdges],
    [rfEdges, addedEdges]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setRfInstance(instance);
  }, []);

  const onDragOverCanvas = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDropCanvas = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType || !rfInstance) return;
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const nodeId = `node-${Date.now()}`;
      setAddedNodes((prev) => [
        ...prev,
        {
          id: nodeId,
          position,
          data: { label: nodeTypeLabels[nodeType] ?? nodeType, nodeType },
          type:
            nodeType === "model"
              ? "modelNode"
              : nodeType === "tool"
                ? "toolNode"
                : "custom",
          draggable: true,
        },
      ]);
      setNodeConfigs((prev) => ({ ...prev, [nodeId]: { title: "" } }));
      setSelectedNodeId(nodeId);
    },
    [rfInstance]
  );

  const onConnect = useCallback((connection: Connection) => {
    setAddedEdges((prev) =>
      addEdge(
        {
          ...connection,
          type: "smoothstep",
          style: { stroke: "rgba(255,255,255,0.30)", strokeWidth: 1.5 },
        },
        prev
      )
    );
  }, []);

  const handleCategoryDragStart = useCallback(
    (event: React.DragEvent, type: string) => {
      event.dataTransfer.setData("application/reactflow", type);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateNodeConfig = useCallback(
    (nodeId: string, config: NodeConfig) => {
      setNodeConfigs((prev) => ({ ...prev, [nodeId]: config }));
    },
    []
  );

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
            {(() => {
              const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                running: { label: "Running", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                idle: { label: "Idle", color: "text-text-muted", bg: "bg-white/[0.04]" },
                error: { label: "Error", color: "text-red-400", bg: "bg-red-400/10" },
                paused: { label: "Paused", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                killed: { label: "Killed", color: "text-red-500", bg: "bg-red-500/10" },
              };
              const s = statusConfig[agent.status];
              return (
                <span className={cn("flex items-center gap-1.5 text-[11px] font-medium", s.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", s.color.replace("text-", "bg-"))} />
                  {s.label}
                </span>
              );
            })()}
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
            className="rounded-xl border border-border-subtle overflow-hidden relative"
            style={{ height: 520 }}
          >
            {/* Run Info Bar */}
            {shouldShowExecution && progress.isRunning && (
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-bg-secondary/80 backdrop-blur border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-gentle-pulse" />
                  <span className="text-[11px] font-medium text-emerald-400">Live</span>
                  <span className="text-[11px] font-mono text-text-muted">drun-015</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-text-secondary">
                    Step {progress.currentStepIndex + 1} of {simulationSteps.length}
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {(progress.elapsedMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            )}
            <ReactFlow
              nodes={allNodes}
              edges={allEdges}
              onNodesChange={onNodesChange}
              onConnect={onConnect}
              onDrop={onDropCanvas}
              onDragOver={onDragOverCanvas}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              colorMode="dark"
              onInit={onInit}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              nodesConnectable={true}
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
                color="rgba(255,255,255,0.07)"
              />
              <Controls
                showInteractive={false}
                position="bottom-right"
              />
              <MiniMap
                nodeColor={(node) => {
                  const nodeType = (node.data as { nodeType?: string }).nodeType;
                  return nodeTypeColors[nodeType ?? ""] ?? "rgba(255,255,255,0.4)";
                }}
                maskColor="rgba(0,0,0,0.6)"
                position="bottom-left"
                zoomable
                pannable
              />
            </ReactFlow>
          </div>

          {/* Component Palette */}
          <ComponentPalette onDragStart={handleCategoryDragStart} />

          {/* Node Config Panel */}
          {selectedNodeId &&
            effectiveNodeConfigs[selectedNodeId] &&
            (() => {
              const selectedNode = allNodes.find(
                (n) => n.id === selectedNodeId
              );
              if (!selectedNode) return null;
              return (
                <NodeConfigPanel
                  nodeType={
                    (selectedNode.data as Record<string, unknown>)
                      .nodeType as string
                  }
                  config={effectiveNodeConfigs[selectedNodeId]}
                  onUpdate={(config) =>
                    updateNodeConfig(selectedNodeId, config)
                  }
                  onClose={() => setSelectedNodeId(null)}
                />
              );
            })()}

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
                  Avg Duration
                </div>
                <div className="text-[13px] font-mono text-text-primary">
                  {formatDuration(agent.avgDuration)}
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
          {latestRun ? (
            <>
              <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-medium text-text-primary">
                    Latest Execution
                  </h3>
                  <div className="flex items-center gap-3">
                    {latestRun.status === "killed" ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-red-400">
                        <XCircle size={13} />
                        Killed
                      </span>
                    ) : latestRun.status === "error" ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-error">
                        <XCircle size={13} />
                        Error
                      </span>
                    ) : latestRun.status === "running" ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-warning">
                        <Clock size={13} />
                        Running
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-success">
                        <CheckCircle2 size={13} />
                        Success
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-text-muted">
                      Total: {formatDuration(latestRun.duration)}
                    </span>
                  </div>
                </div>

                {latestRun.killedReason && (
                  <div className="flex items-start gap-2.5 bg-red-500/[0.06] border border-red-500/20 rounded-lg px-4 py-3 mb-4">
                    <OctagonX size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[12px] text-red-400">{latestRun.killedReason}</span>
                  </div>
                )}

                <div className="bg-bg-primary rounded-lg border border-border-subtle overflow-hidden">
                  {latestRun.traceSteps.map((step) => (
                    <TraceStepRow key={step.id} step={step} />
                  ))}
                </div>
              </div>

              {/* Run History */}
              <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
                <h3 className="text-[13px] font-medium text-text-primary mb-4">
                  Run History
                </h3>
                <div className="space-y-2">
                  {agentRuns.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-bg-primary border border-border-subtle"
                    >
                      {run.status === "success" ? (
                        <CheckCircle2 size={14} className="text-success shrink-0" />
                      ) : run.status === "killed" ? (
                        <OctagonX size={14} className="text-red-500 shrink-0" />
                      ) : run.status === "running" ? (
                        <Clock size={14} className="text-warning shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-error shrink-0" />
                      )}
                      <span className="text-[12px] font-mono text-text-secondary w-12">
                        {new Date(run.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </span>
                      <span className="text-[12px] text-text-primary flex-1">
                        {run.agentName}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        {formatDuration(run.duration)}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        {run.tokensUsed.toLocaleString()} tokens
                      </span>
                      {run.status === "killed" && (
                        <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">KILLED</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-8 text-center">
              <p className="text-[13px] text-text-muted">No runs recorded for this agent.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDetailPage;
