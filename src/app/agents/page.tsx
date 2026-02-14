"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ExternalLink,
  GitBranch,
  ArrowRight,
  BadgeCheck,
  GitFork,
  Terminal,
  RefreshCw,
  ArrowUpCircle,
  Link as LinkIcon,
} from "lucide-react";
import {
  agents,
  agentStores,
  type AgentStatus,
  type IntegrationSource,
} from "@/data/mock";
import { formatNumber, formatLatency } from "@/lib/utils";
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
    color: "text-yellow-400",
    dotColor: "bg-yellow-400",
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

const formatStoreUrl = (url: string, maxLen = 24) => {
  const stripped = url.replace(/^https?:\/\//, "").replace(/^github\.com\//, "");
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen - 3) + "...";
};

const AgentsPage = () => {
  const [storeUrl, setStoreUrl] = useState("");
  const [storeUrlFocused, setStoreUrlFocused] = useState(false);

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Manage and monitor your AI agents"
        actions={
          <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 text-[13px] font-medium transition-colors">
            <Plus size={15} />
            New Agent
          </button>
        }
      />

      {/* Agent Stores */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl mb-6 overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider">
            Agent Stores
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-t border-border-subtle">
              <th className="text-left text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                Store
              </th>
              <th className="text-right text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                Agents
              </th>
              <th className="text-right text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                Installed
              </th>
              <th className="text-left text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                Version
              </th>
              <th className="text-right text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider px-5 py-2.5">
                Sync
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {agentStores.map((store) => (
                <tr
                  key={store.id}
                  className="border-t border-border-subtle hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-primary">
                        {store.name}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                          store.source === "kraken"
                            ? "text-accent/80 bg-accent/8"
                            : "text-text-muted bg-white/[0.04]"
                        )}
                      >
                        {sourceConfig[store.source].label}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-mono text-text-muted/50 mt-0.5 block truncate max-w-[240px]"
                      title={store.url}
                    >
                      {formatStoreUrl(store.url)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[12px] font-mono text-text-secondary">
                    {store.agentCount}
                  </td>
                  <td className="px-5 py-3 text-right text-[12px] font-mono text-text-secondary">
                    {store.installedCount}
                  </td>
                  <td className="px-5 py-3 text-[12px] font-mono text-text-secondary">
                    {store.version}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {store.source === "kraken" ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-text-secondary">
                        <RefreshCw size={10} />
                        Auto-update
                      </span>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <button className="inline-flex items-center gap-1.5 text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors">
                          <RefreshCw size={10} />
                          Sync
                        </button>
                        {store.updateAvailable && (
                          <span className="animate-gentle-pulse inline-flex items-center gap-1 text-[10px] font-mono text-accent">
                            <ArrowUpCircle size={9} />
                            {store.updateAvailable}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>

        {/* Add store */}
        <div className="px-5 py-3 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <GitBranch size={13} className="text-text-muted shrink-0" />
            <div
              className={cn(
                "flex items-center gap-2 flex-1 bg-bg-primary border rounded-md px-2.5 py-1.5 transition-colors",
                storeUrlFocused ? "border-accent/40" : "border-border-subtle"
              )}
            >
              <LinkIcon size={10} className="text-text-muted shrink-0" />
              <input
                type="text"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                onFocus={() => setStoreUrlFocused(true)}
                onBlur={() => setStoreUrlFocused(false)}
                placeholder="github.com/org/kraken-agents"
                className="bg-transparent text-[11px] text-text-primary placeholder:text-text-muted/40 focus:outline-none w-full font-mono"
              />
            </div>
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors shrink-0",
                storeUrl.length > 0
                  ? "bg-accent hover:bg-accent-hover text-white"
                  : "bg-white/[0.04] text-text-muted"
              )}
            >
              Connect
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const status = statusConfig[agent.status];

          return (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 hover:border-border-default transition-colors">
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

                <div className="border-t border-border-subtle my-3" />

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
                      Avg Latency
                    </div>
                    <div className="text-[14px] font-mono text-text-primary">
                      {formatLatency(agent.avgLatency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    {agent.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="bg-bg-tertiary text-text-muted text-[10px] font-mono px-2 py-0.5 rounded"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">
                    v{agent.version}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AgentsPage;
