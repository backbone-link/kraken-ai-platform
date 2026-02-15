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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pluginMarketplaces,
  agentMarketplaces,
} from "@/data/mock";

const mainNav = [
  { href: "/observability", label: "Observability", icon: Activity },
  { href: "/agents", label: "Agents", icon: Cpu },
  { href: "/pipelines", label: "Pipelines", icon: Workflow },
  { href: "/models", label: "Models", icon: Sparkles },
  { href: "/usage", label: "Usage", icon: BarChart3 },
];

const systemNav = [
  { href: "/integrations", label: "Integrations", icon: Cable },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

const PLATFORM_VERSION = "0.0.11";
const PLATFORM_COMMIT = "c825ccd";
const SDK_VERSION = "1.4.0";
const SDK_COMMIT = "a3f19b2";
const PYTHON_RUNTIME = "3.12";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showVersions, setShowVersions] = useState(false);
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

  const renderNavItem = (item: (typeof mainNav)[number]) => (
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
            className="absolute top-[60px] left-0 w-[320px] bg-bg-secondary border border-border-subtle rounded-lg shadow-2xl z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle">
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
                Version Information
              </span>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Platform & SDK */}
              <div className="flex flex-col gap-2">
                <VersionRow
                  label="Kraken AI Platform"
                  version={PLATFORM_VERSION}
                  commit={PLATFORM_COMMIT}
                />
                <VersionRow
                  label="kraken-ai SDK"
                  version={SDK_VERSION}
                  commit={SDK_COMMIT}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/60">Python Runtime</span>
                  <span className="font-mono text-[11px] text-white/50">{PYTHON_RUNTIME}</span>
                </div>
              </div>

              {/* Plugin Marketplaces */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-white/40">
                  Plugin Marketplaces
                </span>
                {pluginMarketplaces.map((m) => (
                  <MarketplaceRow
                    key={m.id}
                    name={m.name}
                    version={m.version}
                    updateAvailable={m.updateAvailable}
                  />
                ))}
              </div>

              {/* Agent Marketplaces */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-white/40">
                  Agent Marketplaces
                </span>
                {agentMarketplaces.map((m) => (
                  <MarketplaceRow
                    key={m.id}
                    name={m.name}
                    version={m.version}
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
    <span className="text-[12px] text-white/60">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] text-white/50">v{version}</span>
      <span className="font-mono text-[10px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">
        {commit}
      </span>
    </div>
  </div>
);

const MarketplaceRow = ({
  name,
  version,
  updateAvailable,
}: {
  name: string;
  version: string;
  updateAvailable?: string;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[12px] text-white/60">{name}</span>
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] text-white/50">v{version}</span>
      {updateAvailable && (
        <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400/80">
          <ArrowUpCircle size={10} />
          {updateAvailable}
        </span>
      )}
    </div>
  </div>
);
