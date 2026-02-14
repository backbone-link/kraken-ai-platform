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
  Link,
  GitFork,
  BadgeCheck,
  Terminal,
  X,
  Settings2,
  Globe,
  RefreshCw,
  Store,
  Package,
  Github,
  Shield,
} from "lucide-react";
import {
  integrations,
  pluginMarketplaces,
  type Integration,
  type IntegrationSource,
  type PluginMarketplace,
} from "@/data/mock";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

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
            <code key={inlineKey++} className="text-[11px] bg-white/[0.06] border border-white/[0.08] rounded px-1 py-0.5 text-accent/80">
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
          <div key={key++} className="my-2 rounded-md border border-white/[0.08] overflow-hidden">
            {lang && (
              <div className="px-3 py-1 bg-white/[0.03] border-b border-white/[0.06] text-[9px] font-mono uppercase tracking-wider text-text-muted">
                {lang}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-[11px] leading-[1.6] text-text-secondary bg-white/[0.02]">
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
              <span className="text-text-muted/60 shrink-0 mt-[2px]">&#8226;</span>
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

/* ─── Plugin Marketplace Row ─── */
const MarketplaceRow = ({ marketplace }: { marketplace: PluginMarketplace }) => {
  const src = sourceConfig[marketplace.source];
  const SrcIcon = src.icon;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
      <div
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
          marketplace.source === "kraken"
            ? "bg-accent/10"
            : marketplace.source === "custom"
              ? "bg-white/[0.06]"
              : "bg-white/[0.06]"
        )}
      >
        <SrcIcon
          size={13}
          className={cn(
            marketplace.source === "kraken"
              ? "text-accent"
              : "text-text-secondary"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text-primary truncate">
            {marketplace.name}
          </span>
          <span
            className={cn(
              "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
              marketplace.source === "kraken"
                ? "text-accent/80 bg-accent/8"
                : marketplace.source === "custom"
                  ? "text-text-muted bg-white/[0.04]"
                  : "text-text-muted bg-white/[0.04]"
            )}
          >
            {src.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          {marketplace.installedCount}/{marketplace.pluginCount} installed
        </span>
      </div>
      <a
        href={marketplace.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-muted hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all p-1"
        title={marketplace.url}
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
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
          : "border border-transparent hover:bg-white/[0.02]"
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
    <div className="flex flex-col h-[calc(100vh-120px)] bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
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
                  <span className="text-text-muted/50">&middot;</span>
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
                ? "text-text-muted hover:text-text-secondary hover:bg-white/[0.03]"
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
              <div className="flex items-center gap-1.5">
                <Shield size={11} className="text-emerald-400" />
                <span className="text-[11px] font-mono text-emerald-400/80">
                  Clean
                </span>
              </div>
            </>
          )}
        </div>

        {/* MCP Endpoint */}
        {integration.mcpEndpoint && (
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
              MCP Endpoint
            </label>
            <div className="flex items-center gap-2 bg-bg-primary border border-border-subtle rounded-lg px-3 py-2">
              <Globe size={12} className="text-text-muted shrink-0" />
              <span className="text-[12px] font-mono text-text-secondary truncate">
                {integration.mcpEndpoint}
              </span>
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
              <ExternalLink size={10} className="text-text-muted/60 group-hover:text-text-secondary shrink-0 ml-auto" />
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
                    <div
                      className={cn(
                        "w-8 h-[18px] rounded-full relative shrink-0",
                        field.value === "true"
                          ? "bg-accent"
                          : "bg-bg-tertiary border border-border-subtle"
                      )}
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full bg-white absolute top-[3px]",
                          field.value === "true"
                            ? "left-[15px]"
                            : "left-[3px]"
                        )}
                      />
                    </div>
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
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-subtle bg-white/[0.02]">
                <FileText size={10} className="text-text-muted" />
                <span className="text-[10px] font-mono text-text-muted">Markdown</span>
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
          {integration.mcpEndpoint ? "MCP Adapter" : "Native"} ·{" "}
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

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Connect data sources, tools, actions, and skills to your agents"
      />

      {/* Plugin Marketplaces */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Store size={13} className="text-text-muted" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Plugin Marketplaces
            </span>
            <span className="text-[10px] font-mono text-text-muted/60 ml-1">
              {pluginMarketplaces.length} connected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={11} className="text-text-muted" />
            <span className="text-[10px] font-mono text-text-muted">
              {pluginMarketplaces.reduce((acc, s) => acc + s.installedCount, 0)} plugins installed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-px bg-border-subtle/50">
          {pluginMarketplaces.map((marketplace) => (
            <MarketplaceRow key={marketplace.id} marketplace={marketplace} />
          ))}
        </div>

        {/* Add marketplace from GitHub */}
        <div className="px-4 py-3 border-t border-border-subtle">
          <div
            className={cn(
              "flex items-center gap-3 transition-colors",
            )}
          >
            <GitBranch size={13} className="text-text-muted shrink-0" />
            <span className="text-[11px] text-text-muted shrink-0">
              Add marketplace
            </span>
            <div
              className={cn(
                "flex items-center gap-2 flex-1 bg-bg-primary border rounded-md px-2.5 py-1.5 transition-colors",
                marketplaceUrlFocused ? "border-accent/40" : "border-border-subtle"
              )}
            >
              <Link size={10} className="text-text-muted shrink-0" />
              <input
                type="text"
                value={marketplaceUrl}
                onChange={(e) => setMarketplaceUrl(e.target.value)}
                onFocus={() => setMarketplaceUrlFocused(true)}
                onBlur={() => setMarketplaceUrlFocused(false)}
                placeholder="github.com/org/kraken-plugins"
                className="bg-transparent text-[11px] text-text-primary placeholder:text-text-muted/60 focus:outline-none w-full font-mono"
              />
            </div>
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors shrink-0",
                marketplaceUrl.length > 0
                  ? "bg-accent hover:bg-accent-hover text-white"
                  : "bg-white/[0.04] text-text-muted"
              )}
            >
              Connect
              <ArrowRight size={10} />
            </button>
          </div>
          <p className="text-[10px] text-text-muted/70 mt-2 ml-[26px]">
            Add a GitHub repository as a plugin marketplace. Repos must follow the Kraken plugin spec.
          </p>
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
                    : "text-text-muted/70"
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
