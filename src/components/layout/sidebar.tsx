"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu,
  Activity,
  Cable,
  Workflow,
  Sparkles,
  SlidersHorizontal,
  Bell,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/", label: "Observability", icon: Activity },
  { href: "/agents", label: "Agents", icon: Cpu },
  { href: "/pipelines", label: "Pipelines", icon: Workflow },
  { href: "/models", label: "Models", icon: Sparkles },
  { href: "/usage", label: "Usage", icon: BarChart3 },
];

const systemNav = [
  { href: "/integrations", label: "Integrations", icon: Cable },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

export const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-bg-secondary border-r border-border-subtle flex flex-col z-50">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14">
        <div className="w-[22px] h-[22px] rounded-md bg-white/[0.14] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M7 5.5L10 7.25V10.75" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M7 5.5L4 7.25V10.75" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M7 1V5.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-white/95 tracking-wide">
          Kraken AI
        </span>
      </div>

      {/* Main navigation */}
      <nav className="flex flex-col gap-px px-3 mt-1">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
        ))}
      </nav>

      {/* System section */}
      <div className="flex flex-col gap-px px-3 mt-6">
        <span className="px-2.5 mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
          System
        </span>
        {systemNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
        ))}
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
