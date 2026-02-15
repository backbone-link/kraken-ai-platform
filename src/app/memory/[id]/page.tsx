"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  User,
  Bot,
  Users,
  Shield,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  memoryInstances,
  memoryAuditEntries,
  agents,
} from "@/data/mock";
import type {
  MemoryBlock,
  MemoryAccessRule,
  MemoryAuditEntry,
  MemoryRole,
  MemorySensitivity,
} from "@/data/mock";
import { cn, timeAgo, shortDate, primaryBtnClass } from "@/lib/utils";

const sensitivityBadgeStyles: Record<MemorySensitivity, string> = {
  public: "bg-emerald-500/15 text-emerald-400",
  internal: "bg-blue-500/15 text-blue-400",
  confidential: "bg-amber-500/15 text-amber-400",
  restricted: "bg-red-500/15 text-red-400",
};

const roleLabels: Record<MemoryRole, string> = {
  viewer: "Can view",
  user: "Can use",
  editor: "Can edit",
  admin: "Full control",
};

const actionColors: Record<MemoryAuditEntry["action"], string> = {
  write: "bg-blue-400",
  read: "bg-white/40",
  create: "bg-emerald-400",
  attach: "bg-purple-400",
  detach: "bg-purple-400",
  share: "bg-amber-400",
  delete: "bg-red-400",
};

const principalIcons: Record<string, typeof User> = {
  user: User,
  agent: Bot,
  team: Users,
  role: Shield,
};

type Tab = "content" | "agents" | "access" | "history";

const tabs: { key: Tab; label: string }[] = [
  { key: "content", label: "Content" },
  { key: "agents", label: "Agents" },
  { key: "access", label: "Access" },
  { key: "history", label: "History" },
];

const formatActionDescription = (entry: MemoryAuditEntry): string => {
  switch (entry.action) {
    case "write":
      return `wrote "${entry.details?.match(/'([^']+)'/)?.[1] ?? "a block"}"`;
    case "read":
      return entry.details ?? "read this memory";
    case "create":
      return "created this memory";
    case "attach":
      return "attached";
    case "detach":
      return "detached";
    case "share":
      return entry.details ?? "shared this memory";
    case "delete":
      return "deleted a block";
    default:
      return entry.details ?? entry.action;
  }
};

const MemoryDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const memory = memoryInstances.find((m) => m.id === id);

  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [now] = useState(() => Date.now());

  if (!memory) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-[15px] text-text-secondary mb-4">Memory not found</p>
        <Link
          href="/memory"
          className="text-[13px] text-accent hover:underline"
        >
          Back to Memory
        </Link>
      </div>
    );
  }

  const auditEntries = memoryAuditEntries
    .filter((e) => e.memoryId === memory.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const agentRules = memory.accessControl.filter(
    (r) => r.principalType === "agent"
  );

  const startEdit = (block: MemoryBlock) => {
    setEditingBlockId(block.id);
    setEditContent(block.content);
  };

  const cancelEdit = () => {
    setEditingBlockId(null);
    setEditContent("");
  };

  const getUpdaterName = (block: MemoryBlock): string => {
    if (block.updatedBy === "user") return "user";
    if (block.agentId) {
      const agent = agents.find((a) => a.id === block.agentId);
      return agent?.name ?? "agent";
    }
    return "agent";
  };

  const isTemporary = (rule: MemoryAccessRule): boolean =>
    !!rule.expiresAt;

  const isExpired = (rule: MemoryAccessRule): boolean =>
    !!rule.expiresAt && new Date(rule.expiresAt).getTime() < now;

  const sensitivityCeilingWarnings: Record<MemorySensitivity, string | null> = {
    restricted: "Restricted: Only named users and specific agents. Role-based grants not permitted.",
    confidential: "Confidential: Named principals and team grants only. Broad role grants not permitted.",
    internal: null,
    public: null,
  };

  const hasCeilingViolation = (rule: MemoryAccessRule): boolean => {
    if (memory.sensitivity === "restricted" && rule.principalType === "role") return true;
    if (memory.sensitivity === "restricted" && rule.principalType === "team") return true;
    if (memory.sensitivity === "confidential" && rule.principalType === "role") return true;
    return false;
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/memory"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-secondary transition-colors mb-4"
      >
        <ArrowLeft size={13} />
        Memory
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-medium text-text-primary">
            {memory.name}
          </h1>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
              sensitivityBadgeStyles[memory.sensitivity]
            )}
          >
            {memory.sensitivity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-border-default text-text-secondary rounded-lg px-3.5 py-1.5 text-[13px] font-medium hover:text-text-primary hover:border-border-default transition-colors">
            <Pencil size={14} />
            Edit
          </button>
          <button className="flex items-center gap-2 border border-red-500/30 text-red-400 rounded-lg px-3.5 py-1.5 text-[13px] font-medium hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-text-secondary mb-6 max-w-2xl">
        {memory.description}
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/[0.06] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "text-[13px] font-medium pb-2.5 -mb-px transition-colors",
              activeTab === tab.key
                ? "text-text-primary border-b-2 border-accent"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-medium text-text-primary">
              Content
            </span>
            <button className="flex items-center gap-1.5 border border-border-default text-text-secondary rounded-lg px-3 py-1.5 text-[12px] font-medium hover:text-text-primary transition-colors">
              <Plus size={13} />
              Add Block
            </button>
          </div>

          <div className="space-y-3">
            {memory.blocks.map((block) => (
              <div
                key={block.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[14px] font-medium text-text-primary">
                    {block.label}
                  </span>
                  {editingBlockId !== block.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(block)}
                        className="text-text-muted hover:text-text-primary p-1 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button className="text-text-muted hover:text-red-400 p-1 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {editingBlockId === block.id ? (
                  <div className="mt-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-[13px] text-text-secondary leading-relaxed focus:outline-none focus:border-accent/50 resize-y min-h-[120px]"
                      rows={6}
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button className={cn("rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="border border-border-default text-text-secondary rounded-lg px-3 py-1.5 text-[12px] font-medium hover:text-text-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed mt-3">
                      {block.content}
                    </p>
                    <p className="text-[11px] text-text-muted mt-4">
                      Updated by {getUpdaterName(block)} &middot; {timeAgo(block.updatedAt)}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === "agents" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-medium text-text-primary">
              Attached Agents
            </span>
            <button className="flex items-center gap-1.5 border border-border-default text-text-secondary rounded-lg px-3 py-1.5 text-[12px] font-medium hover:text-text-primary transition-colors">
              <Plus size={13} />
              Grant Access
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl divide-y divide-white/[0.06]">
            {agentRules.map((rule) => {
              const agent = agents.find((a) => a.id === rule.principalId);
              const expired = isExpired(rule);
              const temporary = isTemporary(rule);
              const isPolicy = rule.grantType === "policy";

              return (
                <div
                  key={rule.principalId}
                  className={cn(
                    "flex items-center justify-between px-5 py-3.5",
                    expired && "opacity-50"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-primary font-medium">
                        {agent?.name ?? rule.principalName}
                      </span>
                      {temporary && !expired && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                          <Clock size={9} />
                          JIT
                        </span>
                      )}
                      {expired && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] text-text-muted">
                          Expired
                        </span>
                      )}
                      {rule.escalatedFrom && (
                        <span className="text-[10px] text-text-muted">
                          escalated from {roleLabels[rule.escalatedFrom].toLowerCase()}
                        </span>
                      )}
                    </div>
                    {temporary && (
                      <span className="text-[11px] text-text-muted">
                        {isPolicy
                          ? `Policy: "${rule.reason}" · auto-approved ${shortDate(rule.grantedAt)}`
                          : `Approved by ${rule.grantedBy} on ${shortDate(rule.grantedAt)}${rule.reason ? ` · "${rule.reason}"` : ""}`}
                        {" · "}
                        {expired ? "expired" : `expires ${shortDate(rule.expiresAt!)}`}
                      </span>
                    )}
                    {!temporary && (
                      <span className="text-[11px] text-text-muted">
                        {isPolicy
                          ? `Policy: "${rule.reason}"`
                          : `Granted by ${rule.grantedBy} on ${shortDate(rule.grantedAt)}`}
                        {!isPolicy && rule.reason ? ` · "${rule.reason}"` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      defaultValue={rule.role}
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1 text-[12px] text-text-secondary focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
                    >
                      <option value="viewer">Can view</option>
                      <option value="user">Can use</option>
                      <option value="editor">Can edit</option>
                      <option value="admin">Full control</option>
                    </select>
                    <button className="text-text-muted hover:text-red-400 p-1 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {agentRules.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-text-muted">
                  No agents have access to this memory.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Access Tab */}
      {activeTab === "access" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-medium text-text-primary">
              Access Control
            </span>
            <button className="flex items-center gap-1.5 border border-border-default text-text-secondary rounded-lg px-3 py-1.5 text-[12px] font-medium hover:text-text-primary transition-colors">
              <Plus size={13} />
              Add
            </button>
          </div>

          {/* Sensitivity + ceiling policy */}
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-text-muted">Sensitivity:</span>
              <span
                className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full capitalize",
                  sensitivityBadgeStyles[memory.sensitivity]
                )}
              >
                {memory.sensitivity}
              </span>
            </div>
            {sensitivityCeilingWarnings[memory.sensitivity] && (
              <div className="flex items-start gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3.5 py-2.5">
                <Info size={13} className="text-text-muted mt-0.5 shrink-0" />
                <span className="text-[12px] text-text-muted leading-relaxed">
                  {sensitivityCeilingWarnings[memory.sensitivity]}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl divide-y divide-white/[0.06]">
            {memory.accessControl.map((rule) => {
              const Icon = principalIcons[rule.principalType] ?? User;
              const temporary = isTemporary(rule);
              const expired = isExpired(rule);
              const violation = hasCeilingViolation(rule);
              const isPolicy = rule.grantType === "policy";

              return (
                <div
                  key={`${rule.principalType}-${rule.principalId}`}
                  className={cn(
                    "px-5 py-3.5",
                    expired && "opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={14} className="text-text-muted" />
                      <span className="text-[13px] text-text-primary font-medium">
                        {rule.principalName}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted capitalize">
                        {rule.principalType}
                      </span>
                      {isPolicy && !temporary && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">
                          Policy
                        </span>
                      )}
                      {temporary && !expired && (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
                          isPolicy
                            ? "bg-purple-500/15 text-purple-400"
                            : "bg-amber-500/15 text-amber-400"
                        )}>
                          <Clock size={9} />
                          {isPolicy ? "Policy JIT" : "Manual JIT"}
                        </span>
                      )}
                      {expired && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] text-text-muted">
                          Expired
                        </span>
                      )}
                      {rule.escalatedFrom && (
                        <span className="text-[10px] text-text-muted">
                          from {roleLabels[rule.escalatedFrom].toLowerCase()}
                        </span>
                      )}
                      {violation && (
                        <AlertTriangle size={12} className="text-amber-400" />
                      )}
                    </div>
                    <span className="text-[12px] text-text-secondary">
                      {roleLabels[rule.role]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-[26px]">
                    {temporary ? (
                      <span className="text-[11px] text-text-muted">
                        {isPolicy
                          ? `Policy: "${rule.reason}" · auto-approved ${shortDate(rule.grantedAt)}`
                          : `Approved by ${rule.grantedBy} on ${shortDate(rule.grantedAt)}${rule.reason ? ` · "${rule.reason}"` : ""}`}
                        {" · "}
                        {expired ? "expired" : `expires ${shortDate(rule.expiresAt!)}`}
                      </span>
                    ) : (
                      <span className="text-[11px] text-text-muted">
                        {isPolicy
                          ? `Policy: "${rule.reason}" · since ${shortDate(rule.grantedAt)}`
                          : `Granted by ${rule.grantedBy} on ${shortDate(rule.grantedAt)}`}
                        {!isPolicy && rule.reason ? ` · "${rule.reason}"` : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <span className="text-[14px] font-medium text-text-primary block mb-4">
            Activity Log
          </span>

          <div className="space-y-0">
            {auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-3"
              >
                <div className="mt-1.5">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      actionColors[entry.action]
                    )}
                  />
                </div>
                <div>
                  <p className="text-[13px] text-text-primary">
                    <span className="text-text-muted">{timeAgo(entry.timestamp)}</span>
                    {" \u00B7 "}
                    <span className="font-medium">{entry.actorName}</span>
                    {" "}
                    {formatActionDescription(entry)}
                  </p>
                  {entry.details && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {entry.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {auditEntries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[13px] text-text-muted">No activity recorded.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryDetailPage;
