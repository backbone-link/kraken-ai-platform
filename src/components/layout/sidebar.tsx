"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  Activity,
  Cable,
  Workflow,
  Sparkles,
  SlidersHorizontal,
  Bell,
  BarChart3,
  MessageSquare,
  ArrowUpCircle,
  Shield,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pluginMarketplaces,
  agentMarketplaces,
} from "@/data/mock";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const mainNav: NavItem[] = [
  { href: "/observability", label: "Observability", icon: Activity },
  { href: "/agents", label: "Agents", icon: Cpu },
  { href: "/pipelines", label: "Pipelines", icon: Workflow },
  { href: "/models", label: "Models", icon: Sparkles },
  { href: "/usage", label: "Usage", icon: BarChart3 },
];

const systemNav: NavItem[] = [
  { href: "/integrations", label: "Integrations", icon: Cable },
  { href: "/governance", label: "Governance", icon: Shield },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

const ACRONYMS = new Set(["ai", "api", "sdk", "id", "ui", "ml"]);
const humanize = (s: string) =>
  s
    .replace(/-/g, " ")
    .replace(/\b\w+/g, (w) =>
      ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)
    );

const PLATFORM_VERSION = "0.0.11";
const PLATFORM_COMMIT = "c825ccd";
const SDK_VERSION = "0.0.4";
const SDK_COMMIT = "a3f19b2";
const PYTHON_RUNTIME = "3.12";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showVersions, setShowVersions] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showVersions) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        brandRef.current &&
        !brandRef.current.contains(e.target as Node)
      ) {
        setShowVersions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showVersions]);

  const isActive = (href: string) => pathname.startsWith(href);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (isActive(href)) {
      e.preventDefault();
      router.push("/");
    }
  };

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={(e) => handleNavClick(e, item.href)}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] transition-[background-color,color] duration-100",
        isActive(item.href)
          ? "bg-white/[0.13] text-white/95 font-medium"
          : "text-white/65 hover:bg-white/[0.07] hover:text-white/80"
      )}
    >
      <item.icon
        size={16}
        strokeWidth={1.5}
        className="shrink-0"
      />
      <span>{item.label}</span>
      {"badge" in item && item.badge && (
        <span className="ml-auto font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-accent/70 bg-accent/[0.08] px-1.5 py-[1px] rounded">
          {item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-bg-secondary border-r border-border-subtle flex flex-col z-50">
      {/* Brand */}
      <div className="relative">
        <button
          ref={brandRef}
          onClick={() => setShowVersions((v) => !v)}
          className="w-full flex flex-col justify-center px-5 h-[60px] border-b border-white/[0.06] cursor-pointer"
        >
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.16em] text-white">
              Kraken
            </span>
            <span className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-accent/80">
              AI
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="font-mono text-[9px] font-normal uppercase tracking-[0.25em] text-white/40">
              Platform
            </span>
            <span className="font-mono text-[10px] text-white/40">
              v{PLATFORM_VERSION}
            </span>
          </div>
        </button>

        {/* Version popover */}
        {showVersions && (
          <div
            ref={popoverRef}
            className="absolute top-[64px] left-3 w-[300px] rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset] z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">
                Version Information
              </span>
              <button
                onClick={() => {
                  const text = [
                    `Kraken AI Platform v${PLATFORM_VERSION} (${PLATFORM_COMMIT})`,
                    `Kraken AI SDK v${SDK_VERSION} (${SDK_COMMIT})`,
                    `Python Runtime ${PYTHON_RUNTIME}`,
                  ].join("\n");
                  void navigator.clipboard.writeText(text).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  });
                }}
                className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors duration-150"
              >
                {copied ? <Check size={13} strokeWidth={1.5} className="text-accent/70" /> : <Copy size={13} strokeWidth={1.5} />}
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3.5">
              {/* Platform & SDK */}
              <div className="flex flex-col gap-2">
                <VersionRow
                  label="Kraken AI Platform"
                  version={PLATFORM_VERSION}
                  commit={PLATFORM_COMMIT}
                />
                <VersionRow
                  label="Kraken AI SDK"
                  version={SDK_VERSION}
                  commit={SDK_COMMIT}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/55">Python Runtime</span>
                  <span className="font-mono text-[11px] text-white/40">{PYTHON_RUNTIME}</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Plugin Marketplaces */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  Plugin Marketplaces
                </span>
                {pluginMarketplaces.map((m) => (
                  <MarketplaceRow
                    key={m.id}
                    name={m.name}
                    version={m.version}
                    commit={m.commit}
                    source={m.source}
                    updateAvailable={m.updateAvailable}
                  />
                ))}
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Agent Marketplaces */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  Agent Marketplaces
                </span>
                {agentMarketplaces.map((m) => (
                  <MarketplaceRow
                    key={m.id}
                    name={m.name}
                    version={m.version}
                    commit={m.commit}
                    source={m.source}
                    updateAvailable={m.updateAvailable}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex flex-col gap-px px-3 mt-3">
        {mainNav.map(renderNavItem)}
      </nav>

      {/* System section */}
      <div className="flex flex-col gap-px px-3 mt-6">
        <span className="px-2.5 mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
          System
        </span>
        {systemNav.map(renderNavItem)}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section */}
      <div className="px-3 pb-3 flex flex-col gap-px">
        {/* Notifications */}
        <button className="flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] text-white/65 hover:bg-white/[0.07] hover:text-white/80 transition-[background-color,color] duration-100">
          <Bell size={16} strokeWidth={1.5} className="shrink-0" />
          <span>Notifications</span>
          <span className="ml-auto min-w-[18px] rounded-full bg-white/[0.14] px-1.5 py-0.5 text-center text-[10px] font-medium text-white/70">
            3
          </span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-chat"))}
          className="flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] text-white/65 hover:bg-white/[0.07] hover:text-white/80 transition-[background-color,color] duration-100"
        >
          <MessageSquare size={16} strokeWidth={1.5} className="shrink-0" />
          <span>AI Assistant</span>
          <kbd className="ml-auto text-[10px] font-mono text-white/30">⌘J</kbd>
        </button>

        {/* User */}
        <div className="border-t border-border-subtle mt-2 pt-2">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-white/65 hover:bg-white/[0.07] hover:text-white/80 transition-[background-color,color] duration-100">
            <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-white/25 to-white/12 flex items-center justify-center text-[10px] font-semibold text-white/80 shrink-0">
              J
            </div>
            <span className="text-[13px] font-medium text-white/80 truncate">
              Jordan Reeves
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const VersionRow = ({
  label,
  version,
  commit,
}: {
  label: string;
  version: string;
  commit: string;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[12px] text-white/55">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-md">
        {commit}
      </span>
      <span className="font-mono text-[11px] text-accent/60">v{version}</span>
    </div>
  </div>
);

const MarketplaceRow = ({
  name,
  version,
  commit,
  source,
  updateAvailable,
}: {
  name: string;
  version: string;
  commit: string;
  source: string;
  updateAvailable?: string;
}) => {
  const isKraken = source === "kraken";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-white/55">{humanize(name)}</span>
        {updateAvailable && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400/70">
            <ArrowUpCircle size={10} />
            update
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-md">
          {commit}
        </span>
        <span className={cn("font-mono text-[11px]", isKraken ? "text-accent/60" : "text-white/40")}>
          v{version}
        </span>
      </div>
    </div>
  );
};
