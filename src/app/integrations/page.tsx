"use client";

import { useState, useMemo } from "react";
import {
  Database,
  Wrench,
  Zap,
  FileText,
  Power,
  ExternalLink,
  GitBranch,
  ArrowRight,
  GitFork,
  BadgeCheck,
  Terminal,
  X,
  Settings2,
  Globe,
  RefreshCw,
  ArrowUpCircle,
  Github,
  Shield,
  Plug,
} from "lucide-react";
import {
  integrations,
  pluginMarketplaces,
  type Integration,
  type IntegrationSource,
} from "@/data/mock";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Toggle } from "@/components/toggle";

const tabs = [
  { key: "data-source", label: "Data Sources", icon: Database },
  { key: "tool", label: "Tools", icon: Wrench },
  { key: "action", label: "Actions", icon: Zap },
  { key: "skill", label: "Skills", icon: FileText },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const categoryColor: Record<string, string> = {
  "data-source": "#60a5fa",
  tool: "#2dd4bf",
  action: "#34d399",
  skill: "#c084fc",
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

/* ─── Simple Markdown Renderer ─── */
const RenderedMarkdown = ({ content }: { content: string }) => {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let i = 0;
    let key = 0;
    let listKey = 0;

    const renderInline = (text: string) => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let inlineKey = 0;

      while (remaining.length > 0) {
        const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/);
        const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)$/);

        if (codeMatch && (!boldMatch || codeMatch.index! <= boldMatch.index!)) {
          if (codeMatch[1]) parts.push(codeMatch[1]);
          parts.push(
            <code key={inlineKey++} className="text-[11px] bg-white/[0.09] border border-white/[0.12] rounded px-1 py-0.5 text-accent">
              {codeMatch[2]}
            </code>
          );
          remaining = codeMatch[3];
        } else if (boldMatch) {
          if (boldMatch[1]) parts.push(boldMatch[1]);
          parts.push(
            <strong key={inlineKey++} className="text-text-primary font-medium">
              {boldMatch[2]}
            </strong>
          );
          remaining = boldMatch[3];
        } else {
          parts.push(remaining);
          break;
        }
      }
      return parts;
    };

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.startsWith("```")) {
        const lang = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        result.push(
          <div key={key++} className="my-2 rounded-md border border-white/[0.12] overflow-hidden">
            {lang && (
              <div className="px-3 py-1 bg-white/[0.06] border-b border-white/[0.06] text-[9px] font-mono uppercase tracking-wider text-text-muted">
                {lang}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-[11px] leading-[1.6] text-text-secondary bg-white/[0.05]">
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith("## ")) {
        result.push(
          <h3 key={key++} className="text-[12px] font-semibold text-text-primary mt-4 mb-1.5 uppercase tracking-wide">
            {line.slice(3)}
          </h3>
        );
        i++;
        continue;
      }
      if (line.startsWith("# ")) {
        result.push(
          <h2 key={key++} className="text-[14px] font-semibold text-text-primary mb-2">
            {line.slice(2)}
          </h2>
        );
        i++;
        continue;
      }

      // List items
      if (line.match(/^- /)) {
        const items: React.ReactNode[] = [];
        while (i < lines.length && lines[i].match(/^- /)) {
          items.push(
            <li key={listKey++} className="flex gap-2 text-[12px] text-text-secondary leading-relaxed">
              <span className="text-text-muted shrink-0 mt-[2px]">&#8226;</span>
              <span>{renderInline(lines[i].slice(2))}</span>
            </li>
          );
          i++;
        }
        result.push(<ul key={key++} className="my-1.5 space-y-1">{items}</ul>);
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        i++;
        continue;
      }

      // Paragraph
      result.push(
        <p key={key++} className="text-[12px] text-text-secondary leading-relaxed my-1">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return result;
  }, [content]);

  return <div>{elements}</div>;
};

/* ─── Compact Integration Row ─── */
const IntegrationRow = ({
  integration,
  isSelected,
  onSelect,
}: {
  integration: Integration;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const color = categoryColor[integration.category];
  const disabled = !integration.enabled;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        isSelected
          ? "bg-accent/[0.06] border border-accent/25"
          : "border border-transparent hover:bg-white/[0.05]"
      )}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold shrink-0"
        style={{
          backgroundColor: disabled ? `${color}08` : `${color}12`,
          color: disabled ? "var(--color-text-muted)" : color,
        }}
      >
        {integration.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[13px] font-medium truncate",
              disabled ? "text-text-secondary" : "text-text-primary"
            )}
          >
            {integration.name}
          </span>
          <SourceBadge
            source={integration.source}
            detail={integration.sourceDetail}
          />
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          {integration.type}
          {integration.lastSync && integration.enabled
            ? ` · synced ${timeAgo(integration.lastSync)}`
            : ""}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {disabled ? (
          <span className="text-[10px] font-mono text-text-muted">Off</span>
        ) : (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              integration.status === "connected"
                ? "bg-emerald-400"
                : integration.status === "error"
                  ? "bg-red-400"
                  : "bg-text-muted"
            )}
          />
        )}
      </div>
    </button>
  );
};

/* ─── Available Row (for marketplace) ─── */
const AvailableRow = ({ integration }: { integration: Integration }) => {
  const color = categoryColor[integration.category];

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-border-subtle hover:border-border-default transition-colors">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold shrink-0"
        style={{ backgroundColor: `${color}08`, color }}
      >
        {integration.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text-primary truncate">
            {integration.name}
          </span>
          <SourceBadge
            source={integration.source}
            detail={integration.sourceDetail}
          />
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          {integration.type}
          {integration.version ? ` · v${integration.version}` : ""}
        </span>
      </div>
      <button className="flex items-center gap-1.5 text-[11px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <ExternalLink size={10} />
        Add
      </button>
    </div>
  );
};

/* ─── Detail Panel ─── */
const DetailPanel = ({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) => {
  const color = categoryColor[integration.category];
  const src = sourceConfig[integration.source];
  const SrcIcon = src.icon;

  return (
    <div className="flex flex-col max-h-[calc(100vh-120px)] bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold shrink-0"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {integration.name[0]}
          </div>
          <div className="min-w-0">
            <span className="text-[14px] font-medium text-text-primary truncate block">
              {integration.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted">
                {integration.type}
              </span>
              {integration.version && (
                <>
                  <span className="text-text-muted/70">&middot;</span>
                  <span className="text-[10px] font-mono text-text-muted">
                    v{integration.version}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors",
              integration.enabled
                ? "text-text-muted hover:text-text-secondary hover:bg-white/[0.06]"
                : "text-accent hover:text-accent-hover hover:bg-accent/5"
            )}
          >
            <Power size={12} />
            {integration.enabled ? "Disable" : "Enable"}
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-6">
        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-bg-primary rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                integration.enabled
                  ? integration.status === "connected"
                    ? "bg-emerald-400"
                    : integration.status === "error"
                      ? "bg-red-400"
                      : "bg-text-muted"
                  : "bg-text-muted"
              )}
            />
            <span className="text-[12px] text-text-secondary capitalize">
              {integration.enabled ? integration.status : "Disabled"}
            </span>
          </div>
          {integration.lastSync && (
            <>
              <span className="text-text-muted/40">|</span>
              <div className="flex items-center gap-1.5">
                <RefreshCw size={10} className="text-text-muted" />
                <span className="text-[11px] font-mono text-text-muted">
                  {timeAgo(integration.lastSync)}
                </span>
              </div>
            </>
          )}
          <span className="text-text-muted/40">|</span>
          <div className="flex items-center gap-1.5">
            <SrcIcon size={10} className={src.className} />
            <span
              className={cn(
                "text-[11px] font-mono",
                integration.source === "kraken"
                  ? "text-accent/70"
                  : "text-text-muted"
              )}
            >
              {integration.sourceDetail ?? src.label}
            </span>
          </div>
          {integration.category === "skill" && (
            <>
              <span className="text-text-muted/40">|</span>
              <div
                className="flex items-center gap-1.5 cursor-help"
                title="Automated scan only. This does not guarantee the absence of all threats. Review skill content before deploying to production."
              >
                <Shield size={11} className="text-emerald-400" />
                <span className="text-[11px] font-mono text-emerald-400/80">
                  No Threats Detected
                </span>
              </div>
            </>
          )}
        </div>

        {/* MCP Transport */}
        {integration.transport && (
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
              MCP Transport
            </label>
            <div className="flex items-center gap-1 mb-2">
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  integration.transport === "http"
                    ? "bg-accent/15 text-accent"
                    : "bg-white/[0.04] text-text-muted"
                )}
              >
                <Globe size={11} />
                HTTP
              </button>
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  integration.transport === "stdio"
                    ? "bg-accent/15 text-accent"
                    : "bg-white/[0.04] text-text-muted"
                )}
              >
                <Terminal size={11} />
                Command
              </button>
            </div>
            <div className="flex items-center gap-2 bg-bg-primary border border-border-subtle rounded-lg px-3 py-2">
              {integration.transport === "http" ? (
                <>
                  <Globe size={12} className="text-text-muted shrink-0" />
                  <span className="text-[12px] font-mono text-text-secondary truncate">
                    {integration.mcpEndpoint}
                  </span>
                </>
              ) : (
                <>
                  <Terminal size={12} className="text-text-muted shrink-0" />
                  <span className="text-[12px] font-mono text-text-secondary truncate">
                    {integration.mcpCommand}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Description (non-skill only) */}
        {integration.category !== "skill" && (
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
              Description
            </label>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              {integration.description}
            </p>
          </div>
        )}

        {/* GitHub URL */}
        {integration.githubUrl && (
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
              Repository
            </label>
            <a
              href={integration.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 hover:border-accent/30 transition-colors group"
            >
              <Github size={13} className="text-text-muted group-hover:text-text-secondary shrink-0" />
              <span className="text-[12px] font-mono text-text-secondary truncate">
                {integration.githubUrl.replace("https://github.com/", "")}
              </span>
              <ExternalLink size={10} className="text-text-muted group-hover:text-text-secondary shrink-0 ml-auto" />
            </a>
          </div>
        )}

        {/* Configuration */}
        {integration.config && integration.config.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings2 size={12} className="text-text-muted" />
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                Configuration
              </label>
            </div>
            <div className="space-y-2.5">
              {integration.config.map((field) => (
                <div key={field.label} className="flex items-center gap-3">
                  <label className="text-[11px] text-text-muted w-36 shrink-0 text-right">
                    {field.label}
                  </label>
                  {field.type === "toggle" ? (
                    <Toggle on={field.value === "true"} />
                  ) : (
                    <div className="flex-1 min-w-0 bg-bg-primary border border-border-subtle rounded-md px-2.5 py-1.5">
                      <span
                        className={cn(
                          "text-[12px] font-mono block truncate",
                          field.type === "secret"
                            ? "text-text-muted"
                            : "text-text-primary"
                        )}
                      >
                        {field.value}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Content */}
        {integration.category === "skill" && integration.skillContent && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={12} className="text-[#c084fc]" />
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                SKILL.md
              </label>
            </div>
            <div className="bg-bg-primary border border-border-subtle rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-subtle bg-white/[0.05]">
                <FileText size={10} className="text-text-muted" />
                <span className="text-[10px] font-mono text-text-muted">{integration.skillFilePath ?? "Markdown"}</span>
              </div>
              <div className="p-4 overflow-auto max-h-[400px]">
                <RenderedMarkdown content={integration.skillContent} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle shrink-0">
        <span className="text-[10px] font-mono text-text-muted">
          {integration.transport === "http" ? "MCP · HTTP" : integration.transport === "stdio" ? "MCP · stdio" : "Native"} ·{" "}
          {integration.version ? `v${integration.version}` : "latest"}
        </span>
        <button className="bg-accent hover:bg-accent-hover text-white rounded-md px-3 py-1 text-[11px] font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

/* ─── Page ─── */
const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("data-source");
  const [selected, setSelected] = useState<Integration | null>(
    integrations.find((i) => i.subscribed && i.enabled) ?? null
  );
  const [marketplaceUrl, setMarketplaceUrl] = useState("");
  const [marketplaceUrlFocused, setMarketplaceUrlFocused] = useState(false);
  const [mcpServerUrl, setMcpServerUrl] = useState("");
  const [mcpServerUrlFocused, setMcpServerUrlFocused] = useState(false);
  const [mcpTransport, setMcpTransport] = useState<"http" | "stdio">("http");

  const filtered = integrations.filter((i) => i.category === activeTab);
  const subscribed = filtered.filter((i) => i.subscribed);
  const available = filtered.filter((i) => !i.subscribed);

  const subscribedCounts = {
    "data-source": integrations.filter(
      (i) => i.category === "data-source" && i.subscribed
    ).length,
    tool: integrations.filter((i) => i.category === "tool" && i.subscribed)
      .length,
    action: integrations.filter((i) => i.category === "action" && i.subscribed)
      .length,
    skill: integrations.filter((i) => i.category === "skill" && i.subscribed)
      .length,
  };

  const marketplaceCategoryCounts = useMemo(() => {
    const counts: Record<string, Record<string, { total: number; installed: number }>> = {};
    for (const mp of pluginMarketplaces) {
      counts[mp.id] = {
        "data-source": { total: 0, installed: 0 },
        tool: { total: 0, installed: 0 },
        action: { total: 0, installed: 0 },
        skill: { total: 0, installed: 0 },
      };
    }
    for (const i of integrations) {
      if (i.marketplaceId && counts[i.marketplaceId]) {
        counts[i.marketplaceId][i.category].total++;
        if (i.subscribed) counts[i.marketplaceId][i.category].installed++;
      }
    }
    return counts;
  }, []);

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Connect data sources, tools, actions, and skills to your agents"
      />

      {/* Plugin Marketplaces + Connection inputs */}
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
                  Src
                </th>
                <th className="text-center text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-2 py-2">
                  Tools
                </th>
                <th className="text-center text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-2 py-2">
                  Acts
                </th>
                <th className="text-center text-[11px] font-mono font-medium text-text-muted/70 uppercase tracking-wider px-2 py-2">
                  Skills
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
              {pluginMarketplaces.map((marketplace) => (
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
                  {(["data-source", "tool", "action", "skill"] as const).map((cat) => {
                    const { total, installed } = marketplaceCategoryCounts[marketplace.id]?.[cat] ?? { total: 0, installed: 0 };
                    return (
                      <td key={cat} className="px-2 py-2.5 text-center font-mono text-text-muted">
                        {total > 0 ? (
                          <span className="text-[11px]">
                            {installed}<span className="text-[10px] text-text-muted/60">/{total}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-muted/40">&mdash;</span>
                        )}
                      </td>
                    );
                  })}
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

        {/* Connection inputs */}
        <div className="w-[340px] shrink-0 space-y-3">
          {/* Add marketplace */}
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
                  placeholder="github.com/org/plugins"
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

          {/* MCP server */}
          <div className="bg-bg-secondary border border-white/[0.08] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Plug size={12} className="text-text-muted" />
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                MCP server
              </span>
              <div className="flex items-center gap-0.5 ml-auto">
                <button
                  onClick={() => {
                    setMcpTransport("http");
                    setMcpServerUrl("");
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                    mcpTransport === "http"
                      ? "bg-accent/15 text-accent"
                      : "bg-white/[0.04] text-text-muted hover:text-text-secondary"
                  )}
                >
                  <Globe size={9} />
                  HTTP
                </button>
                <button
                  onClick={() => {
                    setMcpTransport("stdio");
                    setMcpServerUrl("");
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                    mcpTransport === "stdio"
                      ? "bg-accent/15 text-accent"
                      : "bg-white/[0.04] text-text-muted hover:text-text-secondary"
                  )}
                >
                  <Terminal size={9} />
                  Cmd
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 flex-1 bg-bg-primary border rounded-md px-2.5 py-1.5 transition-colors",
                  mcpServerUrlFocused ? "border-accent/40" : "border-border-subtle"
                )}
              >
                {mcpTransport === "http" ? (
                  <Globe size={10} className="text-text-muted shrink-0" />
                ) : (
                  <Terminal size={10} className="text-text-muted shrink-0" />
                )}
                <input
                  type="text"
                  value={mcpServerUrl}
                  onChange={(e) => setMcpServerUrl(e.target.value)}
                  onFocus={() => setMcpServerUrlFocused(true)}
                  onBlur={() => setMcpServerUrlFocused(false)}
                  placeholder={mcpTransport === "http" ? "https://host:port/mcp" : "npx @org/mcp-server"}
                  className="bg-transparent text-[11px] text-text-primary placeholder:text-text-muted/80 focus:outline-none w-full font-mono"
                />
              </div>
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors shrink-0",
                  mcpServerUrl.length > 0
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

      {/* Category tabs */}
      <div className="inline-flex gap-1 bg-bg-secondary rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelected(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-[13px] rounded-md transition-colors",
                activeTab === tab.key
                  ? "bg-bg-tertiary text-text-primary font-medium"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon size={14} />
              {tab.label}
              <span
                className={cn(
                  "text-[11px] font-mono ml-0.5",
                  activeTab === tab.key
                    ? "text-text-secondary"
                    : "text-text-muted"
                )}
              >
                {subscribedCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        {/* List */}
        <div
          className={cn(
            "shrink-0 transition-all",
            selected ? "w-[360px]" : "w-full max-w-2xl"
          )}
        >
          {/* Subscribed */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 px-1">
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                Installed
              </h2>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
            <div className="space-y-1">
              {subscribed.map((integration) => (
                <IntegrationRow
                  key={integration.id}
                  integration={integration}
                  isSelected={selected?.id === integration.id}
                  onSelect={() =>
                    setSelected(
                      selected?.id === integration.id ? null : integration
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Available */}
          {available.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2 px-1">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Available
                </h2>
                <div className="flex-1 h-px bg-border-subtle/70" />
              </div>
              <div className="space-y-1">
                {available.map((integration) => (
                  <AvailableRow
                    key={integration.id}
                    integration={integration}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 min-w-0">
            <DetailPanel
              integration={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;
