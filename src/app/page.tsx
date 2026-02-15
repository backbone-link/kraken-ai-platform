import {
  Plus,
  Sparkles,
  Search,
  BookOpen,
} from "lucide-react";

const shortcuts = [
  { label: "New Agent", icon: Plus, keys: ["shift", "N"] },
  { label: "Search Models", icon: Search, keys: ["cmd", "K"] },
  { label: "AI Assistant", icon: Sparkles, keys: ["cmd", "J"] },
  { label: "Open Docs", icon: BookOpen, keys: ["shift", "D"] },
];

const Key = ({ children }: { children: string }) => (
  <kbd className="min-w-[22px] h-[20px] flex items-center justify-center rounded bg-white/[0.08] border border-white/[0.12] px-1.5 text-[10px] font-mono text-white/45">
    {children === "cmd" ? "\u2318" : children === "shift" ? "\u21E7" : children}
  </kbd>
);

const SplashPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] -mt-8 select-none">
    {/* Glow backdrop */}
    <div className="absolute pointer-events-none" aria-hidden>
      <div className="w-[480px] h-[480px] rounded-full bg-accent/[0.03] blur-[120px]" />
    </div>

    {/* Wordmark */}
    <div className="flex items-baseline gap-2 mb-1.5">
      <span className="font-mono text-[15px] font-semibold uppercase tracking-[0.2em] text-white/75">
        Kraken
      </span>
      <span className="font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-accent/65">
        AI
      </span>
    </div>
    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35 mb-14">
      Agent Harness Platform
    </p>

    {/* Shortcuts */}
    <div className="flex flex-col gap-0.5 w-[260px]">
      {shortcuts.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-[background-color] duration-150"
        >
          <item.icon size={14} strokeWidth={1.5} className="shrink-0 text-white/35" />
          <span className="text-[13px] text-white/50 flex-1">{item.label}</span>
          <div className="flex items-center gap-1">
            {item.keys.map((k) => (
              <Key key={k}>{k}</Key>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SplashPage;
