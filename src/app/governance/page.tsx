"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Shield,
  Clock,
  Timer,
  ShieldCheck,
  CheckCircle,
  User,
  Bot,
  ChevronDown,
  ChevronRight,
  FileText,
  Link2,
  History,
  Layers,
  Lock,
  Zap,
  Database,
  AlertTriangle,
  Download,
} from "lucide-react";
import {
  accounts,
  jitGrants,
  policies,
  type Policy,
  type PolicyType,
  type PolicyStatus,
  type JitGrant,
  type JitStatus,
} from "@/data/mock";
import { timeAgo, primaryBtnClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Toggle } from "@/components/toggle";

// ─── Tab Setup ───

const tabs = [
  { key: "policies", label: "Policies" },
  { key: "jit", label: "JIT Authorization" },
  { key: "guardrails", label: "Guardrails" },
  { key: "compliance", label: "Compliance" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// ─── Shared Styles ───

const inputClass =
  "bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 w-full";

const labelClass =
  "text-[12px] font-medium text-text-secondary mb-1.5 block";

// ─── Policy Helpers ───

const policyTypeBadgeStyles: Record<PolicyType, string> = {
  authorization: "bg-blue-500/15 text-blue-400",
  access: "bg-purple-500/15 text-purple-400",
  execution: "bg-amber-500/15 text-amber-400",
  "data-handling": "bg-emerald-500/15 text-emerald-400",
  escalation: "bg-red-500/15 text-red-400",
};

const policyTypeIcons: Record<PolicyType, typeof Shield> = {
  authorization: Shield,
  access: Lock,
  execution: Zap,
  "data-handling": Database,
  escalation: AlertTriangle,
};

const policyStatusStyles: Record<PolicyStatus, { dot: string; text: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-400" },
  draft: { dot: "bg-amber-400", text: "text-amber-400" },
  archived: { dot: "bg-zinc-500", text: "text-zinc-500" },
};

const effectBadgeStyles: Record<string, string> = {
  allow: "bg-emerald-500/15 text-emerald-400",
  deny: "bg-red-500/15 text-red-400",
  "require-approval": "bg-amber-500/15 text-amber-400",
  escalate: "bg-purple-500/15 text-purple-400",
};

type TypeFilter = "all" | PolicyType;
type StatusFilter = "all" | PolicyStatus;

const typeFilterOptions: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "authorization", label: "Authorization" },
  { key: "access", label: "Access" },
  { key: "execution", label: "Execution" },
  { key: "data-handling", label: "Data Handling" },
  { key: "escalation", label: "Escalation" },
];

const statusFilterOptions: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "archived", label: "Archived" },
];

// ─── JIT Helpers ───

const jitStatusColors: Record<JitStatus, string> = {
  active: "bg-emerald-400/15 text-emerald-400",
  "pending-approval": "bg-amber-400/15 text-amber-400",
  expired: "bg-bg-tertiary text-text-muted",
  revoked: "bg-red-400/15 text-red-400",
  denied: "bg-red-400/15 text-red-400",
};

const permissionCategories: Record<string, string> = {
  agents: "text-purple-400 bg-purple-400/10",
  data: "text-sky-400 bg-sky-400/10",
  pipelines: "text-teal-400 bg-teal-400/10",
  integrations: "text-amber-400 bg-amber-400/10",
  observability: "text-emerald-400 bg-emerald-400/10",
  audit: "text-orange-400 bg-orange-400/10",
  governance: "text-red-400 bg-red-400/10",
  accounts: "text-indigo-400 bg-indigo-400/10",
  compute: "text-pink-400 bg-pink-400/10",
  jit: "text-cyan-400 bg-cyan-400/10",
};

const getPermColor = (perm: string) => {
  const cat = perm.split(":")[0];
  return permissionCategories[cat] ?? "text-text-muted bg-bg-tertiary";
};

const minutesRemaining = (expiresAt: string) => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60_000));
};

const elapsedFraction = (grantedAt: string, expiresAt: string) => {
  const start = new Date(grantedAt).getTime();
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
};

// ─── Policies Tab ───

const MetricCard = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3">
    <span className="text-[22px] font-semibold text-text-primary">
      {value}
    </span>
    <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
  </div>
);

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

const PolicyCard = ({
  policy,
  expanded,
  onToggle,
}: {
  policy: Policy;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const statusStyle = policyStatusStyles[policy.status];
  const TypeIcon = policyTypeIcons[policy.type];
  const totalAttachments = policy.attachedTo.length;

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden hover:border-white/[0.14] transition-colors">
      <button
        onClick={onToggle}
        className="w-full text-left p-5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.08] text-text-secondary">
                {policy.code}
              </span>
              <span className="text-[14px] font-medium text-text-primary truncate">
                {policy.name}
              </span>
            </div>

            <p className="text-[12px] text-text-secondary line-clamp-2 mb-3">
              {policy.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md",
                  policyTypeBadgeStyles[policy.type]
                )}
              >
                <TypeIcon size={10} />
                {policy.type.replace("-", " ")}
              </span>

              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-text-secondary capitalize">
                {policy.scope}
              </span>

              <span className="flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                <span className={cn("text-[11px] font-medium capitalize", statusStyle.text)}>
                  {policy.status}
                </span>
              </span>

              <span className="text-[11px] font-mono text-text-muted">
                v{policy.version}
              </span>

              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Link2 size={10} />
                {totalAttachments} target{totalAttachments !== 1 ? "s" : ""}
              </span>

              <span className="text-[11px] text-text-muted ml-auto">
                Updated {timeAgo(policy.updatedAt)}
              </span>
            </div>
          </div>

          <div className="shrink-0 mt-1">
            {expanded ? (
              <ChevronDown size={16} className="text-text-muted" />
            ) : (
              <ChevronRight size={16} className="text-text-muted" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border-subtle px-5 pb-5">
          {/* Full description */}
          <div className="pt-4 mb-5">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {policy.description}
            </p>
          </div>

          {/* Rules */}
          <div className="mb-5">
            <h4 className="text-[12px] font-medium text-text-primary mb-3 flex items-center gap-1.5">
              <FileText size={13} className="text-text-muted" />
              Rules ({policy.rules.length})
            </h4>
            <div className="bg-bg-primary border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle">
                    {["#", "Description", "Effect", "Priority", "TTL"].map((h) => (
                      <th
                        key={h}
                        className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-2"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policy.rules
                    .sort((a, b) => a.priority - b.priority)
                    .map((rule, idx) => (
                      <tr
                        key={rule.id}
                        className={cn(
                          idx < policy.rules.length - 1 && "border-b border-border-subtle"
                        )}
                      >
                        <td className="text-[11px] text-text-muted font-mono px-4 py-2.5">
                          {rule.priority}
                        </td>
                        <td className="text-[12px] text-text-secondary px-4 py-2.5 max-w-md">
                          {rule.description}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded",
                              effectBadgeStyles[rule.effect] ?? "bg-bg-tertiary text-text-muted"
                            )}
                          >
                            {rule.effect}
                          </span>
                        </td>
                        <td className="text-[11px] text-text-muted font-mono px-4 py-2.5">
                          P{rule.priority}
                        </td>
                        <td className="text-[11px] text-text-muted font-mono px-4 py-2.5">
                          {rule.ttlMinutes ? `${rule.ttlMinutes}m` : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <h4 className="text-[12px] font-medium text-text-primary mb-3 flex items-center gap-1.5">
              <Link2 size={13} className="text-text-muted" />
              Attachments ({policy.attachedTo.length})
            </h4>
            <div className="space-y-2">
              {policy.attachedTo.map((att) => (
                <div
                  key={`${att.targetType}-${att.targetId}`}
                  className="flex items-center justify-between bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.08] text-text-secondary uppercase">
                      {att.targetType}
                    </span>
                    <span className="text-[12px] text-text-primary">
                      {att.targetName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span>by {att.attachedBy}</span>
                    <span className="font-mono">{timeAgo(att.attachedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary bg-white/[0.06] hover:bg-white/[0.10] rounded-lg px-3 py-1.5 transition-colors">
              <History size={12} />
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PoliciesTab = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      policies.filter((p) => {
        if (typeFilter !== "all" && p.type !== typeFilter) return false;
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        return true;
      }),
    [typeFilter, statusFilter]
  );

  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const uniqueTypes = new Set(policies.map((p) => p.type)).size;
  const totalAttachments = policies.reduce(
    (sum, p) => sum + p.attachedTo.length,
    0
  );

  return (
    <div>
      {/* Header with Create button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-text-muted" />
          <span className="text-[14px] font-medium text-text-primary">
            Policy Management
          </span>
        </div>
        <button className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
          <Plus size={15} />
          Create Policy
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total Policies" value={totalPolicies} />
        <MetricCard label="Active Policies" value={activePolicies} />
        <MetricCard label="Policy Types" value={uniqueTypes} />
        <MetricCard label="Total Attachments" value={totalAttachments} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Type:
          </span>
          <div className="flex items-center gap-1">
            {typeFilterOptions.map((opt) => (
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
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Status:
          </span>
          <div className="flex items-center gap-1">
            {statusFilterOptions.map((opt) => (
              <FilterChip
                key={opt.key}
                label={opt.label}
                active={statusFilter === opt.key}
                onClick={() => setStatusFilter(opt.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Policy list */}
      <div className="space-y-3">
        {filtered.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            expanded={expandedId === policy.id}
            onToggle={() =>
              setExpandedId(expandedId === policy.id ? null : policy.id)
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[13px] text-text-muted">
            No policies match the current filters.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── JIT Authorization Tab ───

const JitSessionCard = ({ grant: g }: { grant: JitGrant }) => {
  const isPending = g.status === "pending-approval";
  const remaining = g.expiresAt ? minutesRemaining(g.expiresAt) : 0;
  const elapsed =
    g.grantedAt && g.expiresAt
      ? elapsedFraction(g.grantedAt, g.expiresAt)
      : 0;
  const barColor = elapsed > 0.75 ? "bg-amber-400/70" : "bg-emerald-400/40";

  return (
    <div
      className="bg-bg-secondary border border-border-subtle rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Bot size={14} className="text-accent" />
            <span className="text-[13px] font-medium text-text-primary">
              {g.agentName}
            </span>
            <span className="text-[11px] text-text-muted font-mono">
              {g.accountName}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded",
                jitStatusColors[g.status]
              )}
            >
              {g.status.replace("-", " ")}
            </span>
          </div>
          <p className="text-[12px] text-text-secondary mt-1.5 max-w-xl">
            {g.reason}
          </p>
        </div>
        {isPending ? (
          <div className="flex gap-2 shrink-0">
            <button className="text-[11px] font-medium px-3 py-1 rounded-lg bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 transition-colors">
              Approve
            </button>
            <button className="text-[11px] font-medium px-3 py-1 rounded-lg bg-red-400/15 text-red-400 hover:bg-red-400/25 transition-colors">
              Deny
            </button>
          </div>
        ) : (
          <button className="text-[11px] font-medium px-3 py-1 rounded-lg bg-red-400/15 text-red-400 hover:bg-red-400/25 shrink-0 transition-colors">
            Revoke Now
          </button>
        )}
      </div>

      {/* Permissions */}
      <div className="flex items-center gap-1.5 mb-3">
        {g.permissions.map((p) => (
          <span
            key={p}
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded",
              getPermColor(p)
            )}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            {g.approvalMethod === "auto-policy" ? (
              <>
                <CheckCircle size={11} className="text-emerald-400" />
                Auto Policy
              </>
            ) : g.approvalMethod === "human" ? (
              <>
                <User size={11} />
                {g.approvedBy}
              </>
            ) : (
              <>
                <Shield size={11} />
                Policy Engine
              </>
            )}
          </span>

          {g.taskContext && (
            <span className="text-[10px] text-text-muted bg-bg-tertiary px-2 py-0.5 rounded font-mono">
              {g.taskContext}
            </span>
          )}
        </div>

        {!isPending && g.expiresAt && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  barColor
                )}
                style={{ width: `${(1 - elapsed) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-text-muted">
              {remaining}m left
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const JitHistoryRow = ({
  grant: g,
  last,
}: {
  grant: JitGrant;
  last: boolean;
}) => {
  const ts = g.revokedAt ?? g.expiresAt ?? g.requestedAt;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-3",
        !last && "border-b border-border-subtle"
      )}
    >
      <span className="text-[11px] font-mono text-text-muted w-32 shrink-0">
        {new Date(ts).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>

      <span
        className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded w-16 text-center shrink-0",
          jitStatusColors[g.status]
        )}
      >
        {g.status}
      </span>

      <span className="text-[12px] text-text-primary shrink-0">
        {g.agentName}
      </span>

      <div className="flex items-center gap-1 flex-1 min-w-0">
        {g.permissions.map((p) => (
          <span
            key={p}
            className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded",
              getPermColor(p)
            )}
          >
            {p}
          </span>
        ))}
      </div>

      <span className="text-[11px] text-text-muted shrink-0">
        {g.approvedBy ?? g.approvalMethod}
      </span>

      {g.revokeReason && (
        <span
          className="text-[10px] text-red-400 max-w-[200px] truncate shrink-0"
          title={g.revokeReason}
        >
          {g.revokeReason}
        </span>
      )}
    </div>
  );
};

const JitTab = () => {
  const activeGrants = jitGrants.filter(
    (g) => g.status === "active" || g.status === "pending-approval"
  );
  const historyGrants = jitGrants.filter(
    (g) =>
      g.status === "expired" ||
      g.status === "revoked" ||
      g.status === "denied"
  );
  const serviceAccounts = accounts.filter((a) => a.type === "service");

  return (
    <div className="space-y-6">
      {/* Active & Pending */}
      <div>
        <h3 className="text-[14px] font-medium text-text-primary mb-3 flex items-center gap-2">
          <Clock size={15} className="text-text-muted" />
          Active & Pending Sessions
        </h3>
        <div className="space-y-3">
          {activeGrants.map((g) => (
            <JitSessionCard key={g.id} grant={g} />
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-[14px] font-medium text-text-primary mb-3 flex items-center gap-2">
          <Timer size={15} className="text-text-muted" />
          Grant History
        </h3>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          {historyGrants.map((g, i) => (
            <JitHistoryRow
              key={g.id}
              grant={g}
              last={i === historyGrants.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Per-Agent Authorization Rules */}
      <div>
        <h3 className="text-[14px] font-medium text-text-primary mb-3 flex items-center gap-2">
          <ShieldCheck size={15} className="text-text-muted" />
          Authorization Rules
        </h3>

        <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle">
                {[
                  "Service Account",
                  "Bound Agent",
                  "Approval Method",
                  "Max Grant Duration",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviceAccounts.map((a, i) => (
                <tr
                  key={a.id}
                  className={cn(
                    i < serviceAccounts.length - 1 &&
                      "border-b border-border-subtle"
                  )}
                >
                  <td className="text-[12px] text-text-primary font-mono px-5 py-3">
                    {a.name}
                  </td>
                  <td className="text-[12px] text-text-secondary px-5 py-3">
                    {a.boundAgentName}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded",
                        a.jitPolicy === "auto-approve"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : a.jitPolicy === "policy-based"
                            ? "bg-sky-400/10 text-sky-400"
                            : "bg-amber-400/10 text-amber-400"
                      )}
                    >
                      {a.jitPolicy}
                    </span>
                  </td>
                  <td className="text-[12px] text-text-muted font-mono px-5 py-3">
                    {a.maxJitDuration}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Guardrails Tab ───

const GuardrailsTab = () => (
  <div className="space-y-4 max-w-2xl">
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
      <h2 className="text-[15px] font-medium text-text-primary mb-5">
        Kill Switch & Guardrails
      </h2>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-text-primary font-medium">
              Global Kill Switch
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Immediately halt all running agents
            </p>
          </div>
          <Toggle on={false} />
        </div>

        <div className="border-t border-border-subtle" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Max Cost per Hour</label>
            <input className={inputClass} defaultValue="$100" readOnly />
          </div>
          <div>
            <label className={labelClass}>Max Error Rate</label>
            <input className={inputClass} defaultValue="15%" readOnly />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-text-primary font-medium">
              Anomaly Detection
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Auto-pause agents on unusual behavior patterns
            </p>
          </div>
          <Toggle on={true} />
        </div>
      </div>
    </div>
  </div>
);

// ─── Compliance Tab ───

const ComplianceTab = () => (
  <div className="space-y-4 max-w-md">
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
      <h2 className="text-[14px] font-medium text-text-primary mb-4">
        Compliance
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-text-primary font-medium">
              Audit Log Export
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Download complete audit trail as CSV
            </p>
          </div>
          <button className="flex items-center gap-1.5 bg-accent/20 border border-accent/30 rounded-md px-3 py-1.5 text-[11px] text-accent font-medium hover:bg-accent/30 transition-colors">
            <Download size={12} />
            Export
          </button>
        </div>

        <div className="border-t border-border-subtle" />

        <div>
          <label className={labelClass}>Retention Policy</label>
          <select className={inputClass} defaultValue="1 year">
            <option>90 days</option>
            <option>180 days</option>
            <option>1 year</option>
            <option>3 years</option>
            <option>7 years</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// ─── Tab Content Map ───

const tabContent: Record<TabKey, () => React.ReactElement> = {
  policies: PoliciesTab,
  jit: JitTab,
  guardrails: GuardrailsTab,
  compliance: ComplianceTab,
};

// ─── Page ───

const GovernancePage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("policies");

  const ActiveContent = tabContent[activeTab];

  return (
    <div>
      <PageHeader
        title="Governance"
        subtitle="Policies, authorization controls, and compliance"
      />

      <div className="flex gap-1 border-b border-border-subtle mb-6 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-[13px] -mb-px transition-colors",
              activeTab === tab.key
                ? "text-text-primary border-b-2 border-accent font-medium"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveContent />
    </div>
  );
};

export default GovernancePage;
