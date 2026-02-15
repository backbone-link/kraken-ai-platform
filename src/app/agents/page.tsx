"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  GitBranch,
  ArrowRight,
  BadgeCheck,
  GitFork,
  Terminal,
  ArrowUpCircle,
  RefreshCw,
  Github,
  Search,
} from "lucide-react";
import {
  agents,
  agentConfigs,
  agentMarketplaces,
  memoryInstances,
  type AgentStatus,
  type IntegrationSource,
  type MemoryInstance,
  type MemoryType,
  type MemoryScope,
  type MemorySensitivity,
} from "@/data/mock";
import { formatNumber, formatDuration, timeAgo, primaryBtnClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

const statusConfig: Record<
  AgentStatus,
  { color: string; dotColor: string; label: string }
> = {
  running: {
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    label: "Running",
  },
  idle: {
    color: "text-text-muted",
    dotColor: "bg-text-muted",
    label: "Idle",
  },
  paused: {
    color: "text-text-muted",
    dotColor: "bg-text-muted",
    label: "Paused",
  },
  error: {
    color: "text-red-400",
    dotColor: "bg-red-400",
    label: "Error",
  },
  killed: {
    color: "text-red-500",
    dotColor: "bg-red-500",
    label: "Killed",
  },
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

const typeBadgeStyles: Record<MemoryType, string> = {
  core: "bg-blue-500/15 text-blue-400",
  archival: "bg-white/[0.08] text-text-secondary",
};

const sensitivityBadgeStyles: Record<MemorySensitivity, string> = {
  public: "bg-emerald-500/15 text-emerald-400",
  internal: "bg-blue-500/15 text-blue-400",
  confidential: "bg-amber-500/15 text-amber-400",
  restricted: "bg-red-500/15 text-red-400",
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type TypeFilter = "all" | MemoryType;
type ScopeFilter = "all" | MemoryScope;
type SensitivityFilter = "all" | MemorySensitivity;

const typeOptions: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All Types" },
  { key: "core", label: "Core" },
  { key: "archival", label: "Archival" },
];

const scopeOptions: { key: ScopeFilter; label: string }[] = [
  { key: "all", label: "All Scopes" },
  { key: "organization", label: "Organization" },
  { key: "workspace", label: "Workspace" },
  { key: "team", label: "Team" },
  { key: "agent", label: "Agent" },
];

const sensitivityOptions: { key: SensitivityFilter; label: string }[] = [
  { key: "all", label: "All Levels" },
  { key: "public", label: "Public" },
  { key: "internal", label: "Internal" },
  { key: "confidential", label: "Confidential" },
  { key: "restricted", label: "Restricted" },
];

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

const MemoryCard = ({ memory }: { memory: MemoryInstance }) => {
  const agentCount = memory.accessControl.filter(
    (r) => r.principalType === "agent"
  ).length;

  return (
    <Link href={`/memory/${memory.id}`}>
      <div className="bg-bg-secondary border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.14] transition-colors h-full">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-text-primary truncate">
            {memory.name}
          </span>
        </div>

        <p className="text-[13px] text-text-secondary line-clamp-2 mt-1.5">
          {memory.description}
        </p>

        <div className="border-t border-white/[0.06] my-3" />

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full capitalize", typeBadgeStyles[memory.type])}>
            {memory.type}
          </span>
          <span className="text-text-muted/40">&middot;</span>
          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full capitalize", sensitivityBadgeStyles[memory.sensitivity])}>
            {memory.sensitivity}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[12px] text-text-muted">
            {agentCount} agent{agentCount !== 1 ? "s" : ""}
          </span>
          <span className="text-text-muted/40">&middot;</span>
          <span className="text-[12px] text-text-muted">
            {formatSize(memory.sizeBytes)}
          </span>
        </div>

        <div className="mt-2">
          <span className="text-[11px] text-text-muted">
            Updated {timeAgo(memory.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const AgentsPage = () => {
  const [marketplaceUrl, setMarketplaceUrl] = useState("");
  const [marketplaceUrlFocused, setMarketplaceUrlFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "memory">("agents");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [sensitivityFilter, setSensitivityFilter] = useState<SensitivityFilter>("all");
  const [search, setSearch] = useState("");

  const filteredMemories = useMemo(() => {
    const q = search.toLowerCase();
    return memoryInstances
      .filter((m) => {
        if (typeFilter !== "all" && m.type !== typeFilter) return false;
        if (scopeFilter !== "all" && m.scope !== scopeFilter) return false;
        if (sensitivityFilter !== "all" && m.sensitivity !== sensitivityFilter) return false;
        if (q && !m.name.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [typeFilter, scopeFilter, sensitivityFilter, search]);

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Manage and monitor your AI agents"
      />

      {/* Tab bar */}
      <div className="flex items-center gap-6 border-b border-white/[0.06] mb-6">
        <button
          onClick={() => setActiveTab("agents")}
          className={cn(
            "pb-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
            activeTab === "agents"
              ? "border-accent text-text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          )}
        >
          Agents
        </button>
        <button
          onClick={() => setActiveTab("memory")}
          className={cn(
            "pb-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
            activeTab === "memory"
              ? "border-accent text-text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          )}
        >
          Memory
        </button>
      </div>

      {/* Agents tab */}
      {activeTab === "agents" && (
        <>
          {/* Agent Marketplaces + Connection input */}
          <div className="flex gap-4 mb-5 items-stretch">
            {/* Table */}
            <div className="flex-1 min-w-0 bg-bg-secondary border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-4 py-2">
                      Marketplace
                    </th>
                    <th className="text-center text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-2 py-2">
                      Agents
                    </th>
                    <th className="text-center text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-2 py-2">
                      Installed
                    </th>
                    <th className="text-left text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-3 py-2">
                      Ver
                    </th>
                    <th className="text-right text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-4 py-2">
                      Updates
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agentMarketplaces.map((marketplace) => (
                      <tr
                        key={marketplace.id}
                        className="border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-text-secondary">
                              {marketplace.name}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                                marketplace.source === "kraken"
                                  ? "text-accent/50 bg-accent/8"
                                  : "text-text-muted/60 bg-white/[0.05]"
                              )}
                            >
                              {sourceConfig[marketplace.source].label}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-text-muted">
                          <span className="text-[11px]">
                            {marketplace.installedCount}<span className="text-[10px] text-text-muted/60">/{marketplace.agentCount}</span>
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center text-[11px] font-mono text-text-muted">
                          {marketplace.installedCount}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] font-mono text-text-muted">
                          {marketplace.version}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {marketplace.source === "kraken" ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                              <RefreshCw size={9} />
                              Auto
                            </span>
                          ) : marketplace.updateAvailable ? (
                            <button className="inline-flex items-center gap-1.5 text-[10px] font-mono text-accent hover:text-accent/80 transition-colors">
                              <ArrowUpCircle size={9} />
                              {marketplace.updateAvailable} avail
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-text-muted">
                              Latest
                            </span>
                          )}
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Connection input */}
            <div className="w-[340px] shrink-0">
              <div className="bg-bg-secondary border border-white/[0.08] rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <GitBranch size={12} className="text-text-muted" />
                  <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                    Add marketplace
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 flex-1 bg-bg-primary border rounded-md px-2.5 py-1.5 transition-colors",
                      marketplaceUrlFocused ? "border-accent/40" : "border-border-subtle"
                    )}
                  >
                    <Github size={10} className="text-text-muted shrink-0" />
                    <input
                      type="text"
                      value={marketplaceUrl}
                      onChange={(e) => setMarketplaceUrl(e.target.value)}
                      onFocus={() => setMarketplaceUrlFocused(true)}
                      onBlur={() => setMarketplaceUrlFocused(false)}
                      placeholder="github.com/org/kraken-agents"
                      className="bg-transparent text-[11px] text-text-primary placeholder:text-text-muted/80 focus:outline-none w-full font-mono"
                    />
                  </div>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors shrink-0",
                      marketplaceUrl.length > 0
                        ? "bg-accent hover:bg-accent-hover text-white"
                        : "bg-white/[0.07] text-text-muted"
                    )}
                  >
                    Connect
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider">
              Agents
            </p>
            <button className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
              <Plus size={12} />
              New Agent
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const status = statusConfig[agent.status];

              return (
                <Link key={agent.id} href={`/agents/${agent.id}`}>
                  <div className="bg-bg-secondary border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.14] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-text-primary">
                          {agent.name}
                        </span>
                        <SourceBadge
                          source={agent.source}
                          detail={agent.sourceDetail}
                        />
                      </div>
                      <span
                        className={`flex items-center gap-1.5 text-[11px] font-medium ${status.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-[13px] text-text-secondary line-clamp-2 mt-1">
                      {agent.description}
                    </p>

                    <div className="border-t border-white/[0.06] my-3" />

                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                          Success Rate
                        </div>
                        <div className="text-[14px] font-mono text-text-primary">
                          {agent.successRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                          Total Runs
                        </div>
                        <div className="text-[14px] font-mono text-text-primary">
                          {formatNumber(agent.totalRuns)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                          Avg Duration
                        </div>
                        <div className="text-[14px] font-mono text-text-primary">
                          {formatDuration(agent.avgDuration)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        {agent.triggers.map((trigger) => (
                          <span
                            key={trigger}
                            className="bg-bg-tertiary text-text-secondary text-[10px] font-mono px-2 py-0.5 rounded"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {agentConfigs[agent.id]?.recursion?.enabled && (
                          <span className="bg-purple-500/15 text-purple-400 text-[10px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <GitFork size={10} />
                            Swarm
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-text-muted">
                          v{agent.version}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Memory tab */}
      {activeTab === "memory" && (
        <>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="bg-bg-tertiary border border-border-subtle rounded-md px-2.5 py-1.5 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-accent/40"
            >
              {typeOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
              className="bg-bg-tertiary border border-border-subtle rounded-md px-2.5 py-1.5 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-accent/40"
            >
              {scopeOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value as SensitivityFilter)}
              className="bg-bg-tertiary border border-border-subtle rounded-md px-2.5 py-1.5 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-accent/40"
            >
              {sensitivityOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/[0.07] rounded-lg px-3 py-1.5">
                <Search size={14} className="text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search memories..."
                  className="bg-transparent text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none w-48"
                />
              </div>
              <button className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
                <Plus size={15} />
                New Memory
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>

          {filteredMemories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[13px] text-text-muted">No memories match the current filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentsPage;
