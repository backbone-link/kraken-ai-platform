"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  agents,
  apiCallsTimeSeries,
  tokenUsageTimeSeries,
  durationTimeSeries,
  costTimeSeries,
  agentObservabilityMetrics,
  detailedAgentRuns,
  detailedAuditTrail,
  agentTimeSeries,
  subAgentRuns,
  type DetailedAgentRun,
  type DetailedTraceStep,
  type DetailedAuditEntry,
  type AuditCategory,
  type SubAgentRun,
} from "@/data/mock";
import {
  formatNumber,
  formatCurrency,
  formatDuration,
  formatTokens,
  timeAgo,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import {
  ChevronDown,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  SkipForward,
  Loader2,
  Shield,
  AlertTriangle,
  Activity,
  OctagonX,
  ExternalLink,
} from "lucide-react";

// --- Constants ---

const timeRanges = ["1h", "6h", "24h", "7d", "30d"] as const;
type TimeRange = (typeof timeRanges)[number];

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
  tool: "Tool Call",
  condition: "Condition",
  security: "Security",
  action: "Action",
  human: "Human",
  agent: "Agent",
  report: "Report",
};

const statusDotColor: Record<string, string> = {
  running: "bg-emerald-400",
  idle: "bg-text-muted",
  error: "bg-red-400",
  paused: "bg-yellow-400",
  killed: "bg-red-500",
};

const tooltipStyle = {
  contentStyle: {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#b0b0b0" },
};

const axisProps = {
  tick: { fill: "#888888", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

const statusIcons = {
  success: CheckCircle2,
  error: XCircle,
  running: Loader2,
  pending: Clock,
  skipped: SkipForward,
  killed: OctagonX,
} as const;

const statusColors: Record<string, string> = {
  success: "text-success",
  error: "text-error",
  running: "text-warning",
  pending: "text-text-muted",
  skipped: "text-text-muted",
  warning: "text-warning",
  killed: "text-red-500",
};

const triggerBadgeColor: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400",
  manual: "bg-violet-500/10 text-violet-400",
  webhook: "bg-emerald-500/10 text-emerald-400",
  "event-driven": "bg-amber-500/10 text-amber-400",
  api: "bg-cyan-500/10 text-cyan-400",
};

const categoryLabels: Record<AuditCategory, string> = {
  execution: "Execution",
  config_change: "Config",
  access: "Access",
  data_access: "Data",
  alert: "Alert",
};

// --- Kill Confirm Dialog ---

const KillConfirmDialog = ({
  agent,
  onConfirm,
  onCancel,
}: {
  agent: (typeof agents)[number];
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const metrics = agentObservabilityMetrics.find((m) => m.agentId === agent.id);
  const activeRun = detailedAgentRuns.find((r) => r.agentId === agent.id && r.status === "running");
  const currentStep = activeRun?.traceSteps.filter((s) => s.status === "running" || s.status === "success").at(-1);
  const modelStep = activeRun?.traceSteps.find((s) => s.modelInfo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-bg-secondary border border-border-subtle rounded-2xl w-[480px] shadow-2xl overflow-hidden">
        <div className="bg-red-500/[0.06] border-b border-red-500/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <OctagonX size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-text-primary">Kill Agent</h3>
              <p className="text-[12px] text-text-muted">This will immediately terminate the agent</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn("w-2 h-2 rounded-full", statusDotColor[agent.status])} />
            <span className="text-[14px] font-medium text-text-primary">{agent.name}</span>
            <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">{agent.version}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5">
              <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted mb-1">Status</p>
              <p className="text-[13px] font-mono text-text-primary capitalize">{agent.status}</p>
            </div>
            <div className="bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5">
              <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted mb-1">Runs Today</p>
              <p className="text-[13px] font-mono text-text-primary">{agent.totalRuns}</p>
            </div>
            <div className="bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5">
              <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted mb-1">Error Rate</p>
              <p className="text-[13px] font-mono text-text-primary">{metrics ? `${metrics.errorRate}%` : "\u2014"}</p>
            </div>
          </div>

          {activeRun && (
            <div className="bg-bg-primary border border-border-subtle rounded-lg px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[12px] font-medium text-text-primary">Active Run</span>
                <span className="text-[10px] font-mono text-text-muted ml-auto">{activeRun.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Triggered by</span>
                  <span className="font-mono text-text-secondary">{activeRun.triggeredBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Started</span>
                  <span className="font-mono text-text-secondary">{timeAgo(activeRun.startedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Steps</span>
                  <span className="font-mono text-text-secondary">{activeRun.stepCount}</span>
                </div>
                {modelStep?.modelInfo && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Model</span>
                    <span className="font-mono text-text-secondary">{modelStep.modelInfo.model}</span>
                  </div>
                )}
              </div>
              {currentStep && (
                <div className="flex items-center gap-2 pt-1 border-t border-border-subtle">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Current step</span>
                  <span className="text-[11px] font-mono text-text-primary">{currentStep.nodeLabel}</span>
                </div>
              )}
            </div>
          )}

          {!activeRun && (
            <div className="bg-bg-primary border border-border-subtle rounded-lg px-4 py-3">
              <p className="text-[12px] text-text-muted">No active run. Killing will prevent future scheduled executions until restarted.</p>
            </div>
          )}

          {agent.securityFlags > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg px-3 py-2">
              <AlertTriangle size={13} className="text-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-400">{agent.securityFlags} security flag{agent.securityFlags > 1 ? "s" : ""} detected — PII detected in input</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-border-subtle">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium text-text-secondary bg-bg-tertiary border border-border-subtle rounded-lg hover:border-border-default transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <OctagonX size={14} />
            Kill Agent
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Agent Selector Table ---

const AgentSelectorTable = ({
  selectedAgentId,
  onSelect,
  onKill,
}: {
  selectedAgentId: string | null;
  onSelect: (id: string | null) => void;
  onKill: (id: string) => void;
}) => {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden mb-6">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5 w-[220px]">Agent</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Invocations</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Calls</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Error Rate</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Avg Duration</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Tokens</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Cost</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5 w-[100px]">Last Run</th>
            <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5 w-[100px]">Next Run</th>
            <th className="text-center font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5 w-[80px]">Security</th>
            <th className="text-center font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5 w-[60px]">Kill</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => {
            const metrics = agentObservabilityMetrics.find((m) => m.agentId === agent.id);
            if (!metrics) return null;
            return (
              <tr
                key={agent.id}
                onClick={() => onSelect(selectedAgentId === agent.id ? null : agent.id)}
                className={cn(
                  "cursor-pointer transition-colors border-l-2 border-t border-t-border-subtle",
                  selectedAgentId === agent.id
                    ? "bg-accent/[0.06] border-l-accent"
                    : "border-l-transparent hover:bg-white/[0.05]"
                )}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDotColor[agent.status])} />
                    <span className={cn("text-text-primary", agent.status === "killed" && "text-red-400")}>
                      {agent.name}
                    </span>
                    <Link
                      href={`/agents/${agent.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-muted hover:text-accent transition-colors"
                      title="Open in Builder"
                    >
                      <ExternalLink size={12} />
                    </Link>
                    {agent.status === "killed" && (
                      <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">KILLED</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{formatNumber(agent.totalRuns)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{formatNumber(metrics.totalCalls)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{metrics.errorRate}%</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{formatDuration(metrics.avgDuration)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{formatTokens(metrics.tokensUsed)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{formatCurrency(metrics.cost)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-muted text-[11px]">{timeAgo(agent.lastRun)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-muted text-[11px]">
                  {(() => {
                    const next = formatNextRun(agent);
                    if (next === "killed") {
                      return (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded">
                          <OctagonX size={11} />
                          KILLED
                        </span>
                      );
                    }
                    if (next === null) {
                      return (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                          </span>
                          <span className="text-emerald-400">Running...</span>
                        </span>
                      );
                    }
                    return next;
                  })()}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {agent.securityFlags > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <AlertTriangle size={12} />
                      <span className="text-[11px] font-mono">{agent.securityFlags}</span>
                    </span>
                  ) : (
                    <Shield size={12} className="text-emerald-400 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {agent.status !== "killed" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onKill(agent.id); }}
                      className="p-1 rounded-md text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Kill agent"
                    >
                      <OctagonX size={14} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Next Run Helper ---

const formatNextRun = (agent: (typeof agents)[number]) => {
  if (agent.status === "killed") return "killed";
  if (agent.status === "running") return null;
  if (agent.nextRun) {
    const diff = new Date(agent.nextRun).getTime() - Date.now();
    if (diff > 0) {
      const mins = Math.round(diff / 60_000);
      if (mins < 60) return `in ${mins}m`;
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      if (hrs < 24) return remMins > 0 ? `in ${hrs}h ${remMins}m` : `in ${hrs}h`;
      return `in ${Math.floor(hrs / 24)}d`;
    }
  }
  if (agent.triggers.includes("event-driven") || agent.triggers.includes("webhook")) return "Event-driven";
  return "Manual";
};

// --- Charts Section ---

const ChartsSection = ({ selectedAgentId }: { selectedAgentId: string | null }) => {
  const data = useMemo(() => {
    if (!selectedAgentId) {
      return {
        apiCalls: apiCallsTimeSeries,
        duration: durationTimeSeries,
        tokens: tokenUsageTimeSeries,
        cost: costTimeSeries,
      };
    }
    return agentTimeSeries[selectedAgentId] ?? {
      apiCalls: apiCallsTimeSeries,
      duration: durationTimeSeries,
      tokens: tokenUsageTimeSeries,
      cost: costTimeSeries,
    };
  }, [selectedAgentId]);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[13px] font-medium text-text-primary">API Calls</p>
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-success" />Success</span>
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-warning" />4xx</span>
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-error" />5xx</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.apiCalls}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="success" name="Success" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="clientError" name="4xx" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} strokeWidth={2} />
            <Area type="monotone" dataKey="serverError" name="5xx" stroke="#f87171" fill="#f87171" fillOpacity={0.3} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[13px] font-medium text-text-primary">Run Duration</p>
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-accent" />Avg</span>
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-text-muted" />P99</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.duration}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => formatDuration(v)} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => formatDuration(Number(v))} />
            <Line type="monotone" dataKey="value" name="Avg" stroke="#e8622c" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="value2" name="P99" stroke="#6b6b6b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[13px] font-medium text-text-primary">Token Usage</p>
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-accent" />Input</span>
            <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><span className="w-2 h-2 rounded-full bg-text-muted" />Output</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.tokens}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => formatNumber(v)} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => formatNumber(Number(v))} cursor={{ fill: "rgba(255,255,255,0.10)" }} />
            <Bar dataKey="value" name="Input" fill="#e8622c" radius={[3, 3, 0, 0]} />
            <Bar dataKey="value2" name="Output" fill="#6b6b6b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <p className="text-[13px] font-medium text-text-primary mb-4">Daily Cost</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.cost}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => formatCurrency(Number(v))} />
            <Area type="monotone" dataKey="value" name="Cost" stroke="#e8622c" fill="#e8622c" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Run Row ---

const RunRow = ({
  run,
  isSelected,
  onSelect,
}: {
  run: DetailedAgentRun;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const Icon = statusIcons[run.status] ?? XCircle;
  const isKilled = run.status === "killed";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left flex flex-col transition-colors border-b border-border-subtle",
        isKilled && "bg-red-500/[0.04]",
        isSelected
          ? "bg-accent/[0.06] border-l-2 border-l-accent"
          : isKilled
            ? "border-l-2 border-l-red-500"
            : "border-l-2 border-l-transparent hover:bg-white/[0.05]"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon
          size={14}
          className={cn("shrink-0", statusColors[run.status], run.status === "running" && "animate-spin")}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-text-primary font-medium truncate">{run.agentName}</span>
            {isKilled ? (
              <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                AUTO-KILLED
              </span>
            ) : (
              <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded", triggerBadgeColor[run.trigger])}>
                {run.trigger}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-text-muted">{timeAgo(run.startedAt)}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] font-mono text-text-secondary">{run.duration > 0 ? formatDuration(run.duration) : "\u2014"}</div>
          <div className="text-[10px] font-mono text-text-muted">
            {run.tokensUsed > 0 ? formatTokens(run.tokensUsed) : "\u2014"}
            {run.cost > 0 ? ` \u00b7 ${formatCurrency(run.cost)}` : ""}
          </div>
        </div>
      </div>
      {isKilled && run.killedReason && (
        <div className="px-4 pb-3 flex items-start gap-2">
          <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
          <span className="text-[10px] text-red-400 leading-relaxed">{run.killedReason}</span>
        </div>
      )}
    </button>
  );
};

// --- Sub-Agent Row ---

const subAgentStatusMap: Record<string, keyof typeof statusIcons> = {
  completed: "success",
  failed: "error",
  running: "running",
  pending: "pending",
};

const roleBadgeColor: Record<string, string> = {
  task: "bg-accent/10 text-accent",
  "swarm-lead": "bg-violet-500/10 text-violet-400",
  "swarm-worker": "bg-cyan-500/10 text-cyan-400",
};

const SubAgentRow = ({ subRun }: { subRun: SubAgentRun }) => {
  const mappedStatus = subAgentStatusMap[subRun.status] ?? "pending";
  const Icon = statusIcons[mappedStatus];

  return (
    <div className="ml-6 border-l-2 border-l-accent/30">
      <div className="flex items-center gap-3 px-4 py-2.5 opacity-90 hover:bg-white/[0.03] transition-colors">
        <Icon
          size={12}
          className={cn(
            "shrink-0",
            statusColors[mappedStatus],
            subRun.status === "running" && "animate-spin",
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-primary font-medium truncate">
              {subRun.agentName}
            </span>
            <span className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded",
              roleBadgeColor[subRun.role] ?? "bg-accent/10 text-accent",
            )}>
              {subRun.role}
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {timeAgo(subRun.startedAt)}
          </span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono text-text-secondary">
            {subRun.duration > 0 ? formatDuration(subRun.duration) : "\u2014"}
          </div>
          <div className="text-[9px] font-mono text-text-muted">
            {subRun.tokensUsed > 0 ? formatTokens(subRun.tokensUsed) : "\u2014"}
            {subRun.cost > 0 ? ` \u00b7 ${formatCurrency(subRun.cost)}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Trace Step Row ---

const TraceStepRow = ({
  step,
  index,
  isExpanded,
  isHighlighted,
  onToggle,
}: {
  step: DetailedTraceStep;
  index: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
}) => {
  const Icon = statusIcons[step.status] ?? Clock;
  const color = nodeTypeColors[step.nodeType] ?? "#999";
  const isRunning = step.status === "running";
  const isPending = step.status === "pending";

  return (
    <div
      className={cn(
        "border-b border-border-subtle last:border-b-0 trace-step-enter",
        isRunning && "trace-step-executing",
        isHighlighted && !isRunning && "border-l-2 border-l-accent bg-accent/[0.06]",
        isPending && "opacity-50",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span
          className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {nodeTypeLabels[step.nodeType] ?? step.nodeType}
        </span>
        <span className="text-[12px] text-text-primary flex-1 font-medium">{step.nodeLabel}</span>
        {isRunning && (
          <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
            EXECUTING
          </span>
        )}
        <Icon size={13} className={cn("shrink-0", statusColors[step.status], isRunning && "animate-spin")} />
        <span className="text-[11px] font-mono text-text-muted w-16 text-right shrink-0">
          {formatDuration(step.duration)}
        </span>
        {isExpanded
          ? <ChevronDown size={14} className="text-text-muted shrink-0" />
          : <ChevronRight size={14} className="text-text-muted shrink-0" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2.5">
          {step.input && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">Input</div>
              <div className="text-[12px] font-mono text-text-secondary bg-bg-primary rounded-md px-3 py-2 border border-border-subtle">{step.input}</div>
            </div>
          )}
          {step.output && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">Output</div>
              <div className="text-[12px] font-mono text-text-secondary bg-bg-primary rounded-md px-3 py-2 border border-border-subtle">{step.output}</div>
            </div>
          )}

          {step.modelInfo && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">Model</div>
              <div className="grid grid-cols-4 gap-2 bg-bg-primary rounded-md px-3 py-2 border border-border-subtle">
                <div><span className="text-[9px] text-text-muted block">Provider</span><span className="text-[11px] font-mono text-text-primary">{step.modelInfo.provider}</span></div>
                <div><span className="text-[9px] text-text-muted block">Model</span><span className="text-[11px] font-mono text-text-primary">{step.modelInfo.model}</span></div>
                <div><span className="text-[9px] text-text-muted block">Tokens</span><span className="text-[11px] font-mono text-text-primary">{formatTokens(step.modelInfo.tokens)}</span></div>
                <div><span className="text-[9px] text-text-muted block">Cost</span><span className="text-[11px] font-mono text-text-primary">{formatCurrency(step.modelInfo.cost)}</span></div>
              </div>
            </div>
          )}

          {step.toolInfo && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">Tool</div>
              <div className="bg-bg-primary rounded-md px-3 py-2 border border-border-subtle space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-text-primary">{step.toolInfo.toolName}</span>
                  <span className="text-[10px] font-mono text-text-muted">{step.toolInfo.endpoint}</span>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded ml-auto",
                    step.toolInfo.httpStatus < 300 ? "bg-emerald-500/10 text-emerald-400" :
                    step.toolInfo.httpStatus < 500 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {step.toolInfo.httpStatus}
                  </span>
                </div>
                {step.toolInfo.request && (
                  <div className="text-[10px] font-mono text-text-muted bg-bg-secondary rounded px-2 py-1 overflow-x-auto">{step.toolInfo.request}</div>
                )}
                {step.toolInfo.response && (
                  <div className="text-[10px] font-mono text-text-muted bg-bg-secondary rounded px-2 py-1 overflow-x-auto">{step.toolInfo.response}</div>
                )}
              </div>
            </div>
          )}

          {step.securityInfo && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">Security Checks</div>
              <div className="bg-bg-primary rounded-md px-3 py-2 border border-border-subtle space-y-1">
                {step.securityInfo.checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded uppercase",
                      check.result === "pass" ? "bg-emerald-500/10 text-emerald-400" :
                      check.result === "warn" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {check.result}
                    </span>
                    <span className="text-[11px] text-text-primary">{check.name}</span>
                    <span className="text-[10px] text-text-muted ml-auto">{check.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step.errorInfo && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-error mb-1">Error</div>
              <div className="bg-error/5 rounded-md px-3 py-2 border border-error/20 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-error bg-error/10 px-1.5 py-0.5 rounded">{step.errorInfo.code}</span>
                  {step.errorInfo.retryable && (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">RETRYABLE</span>
                  )}
                </div>
                <p className="text-[11px] text-text-secondary">{step.errorInfo.message}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Timeline Tab ---

const TimelineTab = ({ steps }: { steps: DetailedTraceStep[] }) => {
  const totalDuration = steps.reduce((s, st) => s + st.duration, 0);
  if (totalDuration === 0) return <div className="p-5 text-[12px] text-text-muted">No timeline data available.</div>;

  const minStart = Math.min(...steps.map((s) => new Date(s.startedAt).getTime()));

  return (
    <div className="p-5 space-y-1.5 overflow-auto">
      {steps.map((step, index) => {
        const color = nodeTypeColors[step.nodeType] ?? "#999";
        const offsetMs = new Date(step.startedAt).getTime() - minStart;
        const leftPct = totalDuration > 0 ? (offsetMs / (totalDuration + 200)) * 100 : 0;
        const widthPct = totalDuration > 0 ? Math.max((step.duration / (totalDuration + 200)) * 100, 1) : 1;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-text-muted w-[140px] shrink-0 truncate">{step.nodeLabel}</span>
            <span
              className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 w-[60px] text-center"
              style={{ color, backgroundColor: `${color}15` }}
            >
              {nodeTypeLabels[step.nodeType] ?? step.nodeType}
            </span>
            <div className="flex-1 h-6 bg-bg-primary rounded-md relative border border-border-subtle overflow-hidden">
              <div
                className="absolute top-0.5 bottom-0.5 rounded-sm timeline-bar-animate"
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: color,
                  opacity: step.status === "error" ? 1 : 0.7,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-text-muted w-14 text-right shrink-0">
              {formatDuration(step.duration)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- Security Tab ---

const SecurityTab = ({ steps }: { steps: DetailedTraceStep[] }) => {
  const securitySteps = steps.filter((s) => s.securityInfo);

  if (securitySteps.length === 0) {
    return <div className="p-5 text-[12px] text-text-muted">No security data for this run.</div>;
  }

  return (
    <div className="p-5 space-y-4">
      {securitySteps.map((step) => (
        <div key={step.id} className="bg-bg-primary rounded-lg border border-border-subtle p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={13} className="text-orange-400" />
            <span className="text-[12px] font-medium text-text-primary">{step.nodeLabel}</span>
            <span className="text-[10px] font-mono text-text-muted ml-auto">
              {formatDuration(step.duration)}
            </span>
          </div>
          <div className="space-y-1.5">
            {step.securityInfo!.checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2">
                {check.result === "pass" && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
                {check.result === "warn" && <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
                {check.result === "fail" && <XCircle size={12} className="text-red-400 shrink-0" />}
                <span className="text-[11px] text-text-primary">{check.name}</span>
                <span className="text-[10px] text-text-muted ml-auto">{check.detail}</span>
              </div>
            ))}
          </div>
          {step.securityInfo!.findings.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border-subtle">
              {step.securityInfo!.findings.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                  <span className="text-[10px] text-amber-400">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- Trace Detail Panel ---

const TraceDetailPanel = ({
  run,
  expandedSteps,
  onToggleStep,
  highlightedStepId,
}: {
  run: DetailedAgentRun;
  expandedSteps: Set<string>;
  onToggleStep: (id: string) => void;
  highlightedStepId: string | null;
}) => {
  const [traceTab, setTraceTab] = useState<"trace" | "timeline" | "security">("trace");
  const Icon = statusIcons[run.status] ?? XCircle;
  const isKilled = run.status === "killed";
  const isLive = run.status === "running";

  const completedSteps = run.traceSteps.filter((s) => s.status === "success").length;
  const runningSteps = run.traceSteps.filter((s) => s.status === "running").length;
  const totalSteps = run.traceSteps.length;
  const completedPct = (completedSteps / totalSteps) * 100;
  const runningPct = (runningSteps / totalSteps) * 100;

  return (
    <div className={cn(
      "flex flex-col max-h-[calc(100vh-120px)] bg-bg-secondary border rounded-xl overflow-hidden",
      isKilled ? "border-red-500/30" : "border-border-subtle"
    )}>
      {isKilled && run.killedReason && (
        <div className="bg-red-500/[0.08] border-b border-red-500/20 px-5 py-3 flex items-start gap-3 shrink-0">
          <OctagonX size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-mono font-bold tracking-wider text-red-400 mb-1">AUTO-KILLED</p>
            <p className="text-[11px] text-red-400/80 leading-relaxed">{run.killedReason}</p>
          </div>
        </div>
      )}
      <div className="px-5 py-3.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <Icon size={14} className={cn(statusColors[run.status], run.status === "running" && "animate-spin")} />
          <span className="text-[14px] font-medium text-text-primary">{run.agentName}</span>
          <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">{run.id}</span>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 ml-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-emerald-400">Live</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[10px] font-mono text-text-muted">{timeAgo(run.startedAt)}</span>
          <span className="text-[10px] font-mono text-text-muted">{run.duration > 0 ? formatDuration(run.duration) : "running..."}</span>
          <span className="text-[10px] font-mono text-text-muted">{run.stepCount} steps</span>
          {run.errorCount > 0 && <span className="text-[10px] font-mono text-error">{run.errorCount} error{run.errorCount > 1 ? "s" : ""}</span>}
          <span className="text-[10px] font-mono text-text-muted ml-auto">{run.triggeredBy}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 pt-2 border-b border-border-subtle shrink-0">
        {(["trace", "timeline", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTraceTab(tab)}
            className={cn(
              "px-3 py-2 text-[12px] font-medium -mb-px transition-colors capitalize",
              traceTab === tab
                ? "text-text-primary border-b-2 border-accent"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab === "trace" ? "Trace" : tab === "timeline" ? "Timeline" : "Security"}
          </button>
        ))}
      </div>

      {traceTab === "trace" && (
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-bg-primary rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400/30 transition-all duration-500"
                style={{ width: `${completedPct}%` }}
              />
              {runningSteps > 0 && (
                <div
                  className="h-full bg-blue-400 animate-gentle-pulse"
                  style={{ width: `${runningPct}%` }}
                />
              )}
            </div>
          </div>
          <p className="text-[10px] font-mono text-text-muted">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {traceTab === "trace" && (
          <div className="bg-bg-primary">
            {run.traceSteps.map((step, index) => (
              <TraceStepRow
                key={step.id}
                step={step}
                index={index}
                isExpanded={expandedSteps.has(step.id)}
                isHighlighted={step.id === highlightedStepId}
                onToggle={() => onToggleStep(step.id)}
              />
            ))}
          </div>
        )}
        {traceTab === "timeline" && <TimelineTab steps={run.traceSteps} />}
        {traceTab === "security" && <SecurityTab steps={run.traceSteps} />}
      </div>
    </div>
  );
};

// --- Runs & Traces Tab ---

const RunsAndTracesTab = ({
  selectedAgentId,
  selectedRunId,
  onSelectRun,
  expandedSteps,
  onToggleStep,
  highlightedStepId,
}: {
  selectedAgentId: string | null;
  selectedRunId: string | null;
  onSelectRun: (id: string | null) => void;
  expandedSteps: Set<string>;
  onToggleStep: (id: string) => void;
  highlightedStepId: string | null;
}) => {
  const filteredRuns = useMemo(
    () =>
      selectedAgentId
        ? detailedAgentRuns.filter((r) => r.agentId === selectedAgentId)
        : detailedAgentRuns,
    [selectedAgentId]
  );

  const selectedRun = selectedRunId ? detailedAgentRuns.find((r) => r.id === selectedRunId) : null;

  return (
    <div className="flex gap-4 items-start">
      <div className={cn(
        "bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden shrink-0 transition-all",
        selectedRun ? "w-[380px]" : "w-full"
      )}>
        <div className="max-h-[600px] overflow-auto">
          {filteredRuns.length === 0 ? (
            <div className="p-5 text-[12px] text-text-muted">No runs found.</div>
          ) : (
            filteredRuns.map((run) => {
              const childRuns = subAgentRuns.filter((s) => s.parentRunId === run.id);
              return (
                <div key={run.id}>
                  <RunRow
                    run={run}
                    isSelected={selectedRunId === run.id}
                    onSelect={() => onSelectRun(selectedRunId === run.id ? null : run.id)}
                  />
                  {childRuns.map((child) => (
                    <SubAgentRow key={child.id} subRun={child} />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedRun && (
        <div className="flex-1 min-w-0">
          <TraceDetailPanel
            run={selectedRun}
            expandedSteps={expandedSteps}
            onToggleStep={onToggleStep}
            highlightedStepId={highlightedStepId}
          />
        </div>
      )}
    </div>
  );
};

// --- Audit Log Tab ---

const AuditLogTab = ({ selectedAgentId }: { selectedAgentId: string | null }) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let entries: DetailedAuditEntry[] = detailedAuditTrail;
    if (selectedAgentId) {
      entries = entries.filter((e) => e.agentId === selectedAgentId);
    }
    if (statusFilter !== "all") {
      entries = entries.filter((e) => e.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      entries = entries.filter((e) => e.category === categoryFilter);
    }
    return entries;
  }, [selectedAgentId, statusFilter, categoryFilter]);

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-tertiary border border-border-subtle rounded-md px-2.5 py-1.5 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-accent/40"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-bg-tertiary border border-border-subtle rounded-md px-2.5 py-1.5 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-accent/40"
        >
          <option value="all">All Categories</option>
          <option value="execution">Execution</option>
          <option value="config_change">Config Change</option>
          <option value="access">Access</option>
          <option value="data_access">Data Access</option>
          <option value="alert">Alert</option>
        </select>
        <span className="text-[10px] font-mono text-text-muted ml-auto">{filtered.length} entries</span>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border-subtle sticky top-0 bg-bg-secondary">
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Timestamp</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Agent</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">User</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Action</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Status</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Category</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Details</th>
              <th className="text-right font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">Duration</th>
              <th className="text-left font-mono text-text-muted uppercase tracking-wider text-[10px] px-4 py-2.5">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr
                key={entry.id}
                className={cn(
                  "border-t border-border-subtle",
                  entry.securityRelevant && entry.status === "error"
                    ? "border-l-2 border-l-error"
                    : entry.securityRelevant && entry.status === "warning"
                      ? "border-l-2 border-l-warning"
                      : entry.securityRelevant
                        ? "border-l-2 border-l-accent/30"
                        : "border-l-2 border-l-transparent"
                )}
              >
                <td className="px-4 py-2.5 font-mono text-[11px] text-text-muted whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
                  })}
                </td>
                <td className="px-4 py-2.5 text-text-primary whitespace-nowrap">{entry.agent}</td>
                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">{entry.user}</td>
                <td className="px-4 py-2.5 font-mono text-text-secondary">{entry.action}</td>
                <td className="px-4 py-2.5">
                  <span className={statusColors[entry.status] ?? "text-text-muted"}>{entry.status}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                    {categoryLabels[entry.category]}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-text-secondary max-w-[280px] truncate">{entry.details}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">
                  {entry.duration > 0 ? formatDuration(entry.duration) : "\u2014"}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-text-muted">{entry.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Page ---

const ObservabilityPage = () => {
  const searchParams = useSearchParams();

  const deepLink = useMemo(() => {
    const runId = searchParams.get("runId");
    const stepId = searchParams.get("stepId");
    if (!runId) return null;
    const run = detailedAgentRuns.find((r) => r.id === runId);
    if (!run) return null;
    const stepsToExpand = new Set<string>();
    for (const step of run.traceSteps) {
      if (step.status === "running" || step.id === stepId) {
        stepsToExpand.add(step.id);
      }
    }
    return { agentId: run.agentId, runId: run.id, expandedSteps: stepsToExpand, highlightedStepId: stepId };
  }, [searchParams]);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(deepLink?.agentId ?? null);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [activeBottomTab, setActiveBottomTab] = useState<"runs" | "audit">("runs");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(deepLink?.runId ?? null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(deepLink?.expandedSteps ?? new Set());
  const [killTargetId, setKillTargetId] = useState<string | null>(null);
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(deepLink?.highlightedStepId ?? null);

  const killTarget = killTargetId ? agents.find((a) => a.id === killTargetId) ?? null : null;

  const handleSelectAgent = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId);
    setSelectedRunId(null);
    setExpandedSteps(new Set());
    setHighlightedStepId(null);
  }, []);

  const handleToggleStep = useCallback((stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Observability"
        subtitle="Monitor agent performance, traces, and audit trails"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="appearance-none bg-bg-tertiary border border-border-subtle rounded-md pl-2.5 pr-7 py-1.5 text-[11px] text-text-secondary font-medium hover:border-border-default transition-colors focus:outline-none focus:border-accent/40 cursor-pointer"
              >
                {timeRanges.map((r) => (
                  <option key={r} value={r}>Last {r}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 bg-bg-tertiary border border-border-subtle rounded-md px-3 py-1.5 text-[11px] text-text-secondary font-medium hover:border-border-default transition-colors">
              <Download size={12} />
              Export
            </button>
          </div>
        }
      />

      <AgentSelectorTable selectedAgentId={selectedAgentId} onSelect={handleSelectAgent} onKill={setKillTargetId} />
      <ChartsSection selectedAgentId={selectedAgentId} />

      <div>
        <div className="flex items-center gap-1 mb-4">
          <button
            onClick={() => setActiveBottomTab("runs")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg transition-colors",
              activeBottomTab === "runs"
                ? "bg-bg-secondary text-text-primary border border-border-subtle"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Activity size={14} />
            Runs & Traces
          </button>
          <button
            onClick={() => setActiveBottomTab("audit")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg transition-colors",
              activeBottomTab === "audit"
                ? "bg-bg-secondary text-text-primary border border-border-subtle"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Shield size={14} />
            Audit Log
          </button>
        </div>

        {activeBottomTab === "runs" && (
          <RunsAndTracesTab
            selectedAgentId={selectedAgentId}
            selectedRunId={selectedRunId}
            onSelectRun={setSelectedRunId}
            expandedSteps={expandedSteps}
            onToggleStep={handleToggleStep}
            highlightedStepId={highlightedStepId}
          />
        )}
        {activeBottomTab === "audit" && (
          <AuditLogTab selectedAgentId={selectedAgentId} />
        )}
      </div>

      {killTarget && (
        <KillConfirmDialog
          agent={killTarget}
          onCancel={() => setKillTargetId(null)}
          onConfirm={() => setKillTargetId(null)}
        />
      )}
    </div>
  );
};

const ObservabilityPageWrapper = () => (
  <Suspense>
    <ObservabilityPage />
  </Suspense>
);

export default ObservabilityPageWrapper;
