"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { memoryInstances, type MemoryInstance, type MemoryType, type MemoryScope, type MemorySensitivity } from "@/data/mock";
import { timeAgo, primaryBtnClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

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
  { key: "all", label: "All" },
  { key: "core", label: "Core" },
  { key: "archival", label: "Archival" },
];

const scopeOptions: { key: ScopeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "organization", label: "Organization" },
  { key: "workspace", label: "Workspace" },
  { key: "team", label: "Team" },
  { key: "agent", label: "Agent" },
];

const sensitivityOptions: { key: SensitivityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "public", label: "Public" },
  { key: "internal", label: "Internal" },
  { key: "confidential", label: "Confidential" },
  { key: "restricted", label: "Restricted" },
];

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
      active
        ? "bg-accent/15 text-accent"
        : "bg-white/[0.05] text-text-muted hover:bg-white/[0.08] hover:text-text-secondary"
    )}
  >
    {label}
  </button>
);

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

const MemoryPage = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [sensitivityFilter, setSensitivityFilter] = useState<SensitivityFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
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
        title="Memory"
        subtitle="Manage shared knowledge across your agents"
        actions={
          <button className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
            <Plus size={15} />
            New Memory
          </button>
        }
      />

      <div className="flex items-center gap-6 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Type:</span>
          <div className="flex items-center gap-1">
            {typeOptions.map((opt) => (
              <FilterChip
                key={opt.key}
                label={opt.label}
                active={typeFilter === opt.key}
                onClick={() => setTypeFilter(opt.key)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Scope:</span>
          <div className="flex items-center gap-1">
            {scopeOptions.map((opt) => (
              <FilterChip
                key={opt.key}
                label={opt.label}
                active={scopeFilter === opt.key}
                onClick={() => setScopeFilter(opt.key)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Sensitivity:</span>
          <div className="flex items-center gap-1">
            {sensitivityOptions.map((opt) => (
              <FilterChip
                key={opt.key}
                label={opt.label}
                active={sensitivityFilter === opt.key}
                onClick={() => setSensitivityFilter(opt.key)}
              />
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 bg-white/[0.07] rounded-lg px-3 py-1.5">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="bg-transparent text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[13px] text-text-muted">No memories match the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default MemoryPage;
