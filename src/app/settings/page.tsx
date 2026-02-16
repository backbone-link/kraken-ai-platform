"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Key,
  Shield,
  Bell,
  Settings2,
  Users,
  Copy,
  User,
  Bot,
  Clock,
  ShieldCheck,
  CheckCircle,
  Timer,
  Lock,
  RefreshCw,
  Globe,
  Fingerprint,
  Trash2,
  Network,
} from "lucide-react";
import {
  accounts,
  jitGrants,
  apiKeys,
  rolePermissions,
  type Account,
  type AccountRole,
  type JitGrant,
  type JitStatus,
} from "@/data/mock";
import { timeAgo, primaryBtnClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Toggle } from "@/components/toggle";

const tabs = [
  { key: "general", label: "General", icon: Settings2 },
  { key: "security", label: "Security", icon: Shield },
  { key: "accounts", label: "Accounts", icon: Users },
  { key: "api-keys", label: "API Keys", icon: Key },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const inputClass =
  "bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 w-full";

const labelClass = "text-[12px] font-medium text-text-secondary mb-1.5 block";

const roleBadgeColors: Record<AccountRole, string> = {
  "org-admin": "bg-accent/15 text-accent",
  "security-admin": "bg-red-400/15 text-red-400",
  "agent-developer": "bg-purple-400/15 text-purple-400",
  "agent-operator": "bg-teal-400/15 text-teal-400",
  "auditor": "bg-amber-400/15 text-amber-400",
  "read-only": "bg-bg-tertiary text-text-muted",
};

const jitStatusColors: Record<JitStatus, string> = {
  active: "bg-emerald-400/15 text-emerald-400",
  "pending-approval": "bg-amber-400/15 text-amber-400",
  expired: "bg-bg-tertiary text-text-muted",
  revoked: "bg-red-400/15 text-red-400",
  denied: "bg-red-400/15 text-red-400",
};

const jitStatusBorderColors: Record<JitStatus, string> = {
  active: "border-l-emerald-400",
  "pending-approval": "border-l-amber-400",
  expired: "border-l-zinc-500",
  revoked: "border-l-red-400",
  denied: "border-l-red-400",
};

const roleDescriptions: Record<AccountRole, string> = {
  "org-admin": "Full platform access. Can manage all accounts, agents, integrations, and governance settings.",
  "security-admin": "Manages security policies, audit logs, JIT approvals, and agent kill switches.",
  "agent-developer": "Creates and deploys agents and pipelines. Can connect integrations and view observability.",
  "agent-operator": "Executes and monitors agents. Can approve JIT requests and manage pipeline runs.",
  "auditor": "Read-only access to audit logs, observability, agent configs, and account directory.",
  "read-only": "View-only access to agents, pipelines, observability, and integrations.",
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

// ─── General Tab ───

const GeneralTab = () => (
  <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6 max-w-2xl">
    <h2 className="text-[15px] font-medium text-text-primary mb-6">
      Platform Configuration
    </h2>

    <div className="space-y-5">
      <div>
        <label className={labelClass}>Platform Name</label>
        <input className={inputClass} defaultValue="Acme Electronics" readOnly />
      </div>

      <div>
        <label className={labelClass}>Platform URL</label>
        <input
          className={inputClass}
          defaultValue="https://acme-electronics.kraken-ai.com"
          readOnly
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Default Timezone</label>
          <select className={inputClass}>
            <option>UTC</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Trace Retention</label>
          <select className={inputClass}>
            <option>30 days</option>
          </select>
        </div>
      </div>
    </div>

    <div className="mt-8 pt-5 border-t border-border-subtle">
      <button className={cn("rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
        Save Changes
      </button>
    </div>
  </div>
);

// ─── Security Tab ───

const SecurityStatusRow = ({
  label,
  value,
  status,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string;
  status: "active" | "scheduled" | "info";
  icon: typeof Lock;
  detail?: string;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-bg-tertiary rounded-lg">
        <Icon size={14} className="text-text-secondary" />
      </div>
      <div>
        <p className="text-[13px] text-text-primary font-medium">{label}</p>
        {detail && (
          <p className="text-[11px] text-text-muted mt-0.5">{detail}</p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] font-mono text-text-secondary">{value}</span>
      <span
        className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1",
          status === "active"
            ? "bg-emerald-400/15 text-emerald-400"
            : status === "scheduled"
              ? "bg-sky-400/15 text-sky-400"
              : "bg-bg-tertiary text-text-muted"
        )}
      >
        {status === "active" && <CheckCircle size={10} />}
        {status === "active" ? "Active" : status === "scheduled" ? "Scheduled" : "Configured"}
      </span>
    </div>
  </div>
);

const ipAllowlistDefaults = [
  { cidr: "10.0.0.0/8", label: "Corporate VPN", addedBy: "Jordan Reeves", added: "2025-11-02" },
  { cidr: "172.16.24.0/24", label: "SF Office", addedBy: "Jordan Reeves", added: "2025-11-02" },
];

const SecurityTab = ({ onNavigate }: { onNavigate: (tab: TabKey) => void }) => {
  const [ipEnforced, setIpEnforced] = useState(true);

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Encryption */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={15} className="text-text-secondary" />
          <h2 className="text-[15px] font-medium text-text-primary">Encryption</h2>
        </div>

        <div className="divide-y divide-border-subtle">
          <SecurityStatusRow
            icon={Lock}
            label="Data at Rest"
            value="AES-256-GCM"
            status="active"
            detail="All stored data encrypted via AWS KMS managed keys"
          />
          <SecurityStatusRow
            icon={Globe}
            label="Data in Transit"
            value="TLS 1.3"
            status="active"
            detail="All API and inter-service communication"
          />
          <SecurityStatusRow
            icon={RefreshCw}
            label="Key Rotation"
            value="Every 90 days"
            status="scheduled"
            detail="Next rotation: Mar 12, 2026"
          />
        </div>
      </div>

      {/* Identity Provider */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Fingerprint size={15} className="text-text-secondary" />
            <h2 className="text-[15px] font-medium text-text-primary">Identity Provider</h2>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-400/15 text-emerald-400 flex items-center gap-1">
            <CheckCircle size={10} />
            Connected
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-bg-tertiary/50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">SSO</p>
            <p className="text-[13px] text-text-primary font-medium">Okta</p>
            <p className="text-[11px] text-text-muted">SAML 2.0</p>
          </div>
          <div className="bg-bg-tertiary/50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Directory Sync</p>
            <p className="text-[13px] text-text-primary font-medium">Active</p>
            <p className="text-[11px] text-text-muted">Last sync: 2h ago</p>
          </div>
          <div className="bg-bg-tertiary/50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">MFA</p>
            <p className="text-[13px] text-text-primary font-medium">Enforced</p>
            <p className="text-[11px] text-text-muted">Managed by IdP</p>
          </div>
        </div>

        <a
          href="https://admin.kraken-ai.com/identity"
          className="text-[12px] text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5"
        >
          Manage in Admin Console
          <Globe size={12} />
        </a>
      </div>

      {/* IP Allowlist */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Network size={15} className="text-text-secondary" />
            <h2 className="text-[15px] font-medium text-text-primary">IP Allowlist</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "text-[10px] font-medium",
              ipEnforced ? "text-emerald-400" : "text-text-muted"
            )}>
              {ipEnforced ? "Enforced" : "Disabled"}
            </span>
            <Toggle on={ipEnforced} onChange={() => setIpEnforced(!ipEnforced)} />
          </div>
        </div>

        <p className="text-[11px] text-text-muted mb-4">
          Restrict access to the Kraken AI platform and SDK endpoints to approved IP addresses and CIDR ranges.
        </p>

        <div className={cn(
          "divide-y divide-border-subtle rounded-lg border border-border-subtle overflow-hidden",
          !ipEnforced && "opacity-50 pointer-events-none"
        )}>
          {ipAllowlistDefaults.map((entry) => (
            <div key={entry.cidr} className="flex items-center justify-between px-4 py-3 bg-bg-tertiary/30">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-mono text-text-primary">{entry.cidr}</span>
                <span className="text-[11px] text-text-muted">{entry.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-text-muted">
                  by{" "}
                  <button
                    onClick={() => onNavigate("accounts")}
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    {entry.addedBy}
                  </button>
                  {" · "}
                  <span className="font-mono">
                    {new Date(entry.added).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </span>
                <button className="text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className={cn(
            "mt-4 flex items-center gap-1.5 text-[12px] text-accent hover:text-accent/80 transition-colors",
            !ipEnforced && "opacity-50 pointer-events-none"
          )}
        >
          <Plus size={13} />
          Add IP Range
        </button>
      </div>

      {/* Application Security */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={15} className="text-text-secondary" />
          <h2 className="text-[15px] font-medium text-text-primary">Application Security</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Re-auth for Sensitive Operations</label>
            <select className={inputClass} defaultValue="enabled">
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
            <p className="text-[10px] text-text-muted mt-1">
              Require re-authentication for kill switch, JIT approval, policy changes
            </p>
          </div>
          <div>
            <label className={labelClass}>Session Binding</label>
            <select className={inputClass} defaultValue="ip-ua">
              <option value="ip-ua">IP + User-Agent</option>
              <option value="ip">IP only</option>
              <option value="none">None</option>
            </select>
            <p className="text-[10px] text-text-muted mt-1">
              Bind sessions to client fingerprint to prevent hijacking
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border-subtle">
          <button className={cn("rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Accounts Tab ───

type AccountSubTab = "directory" | "jit" | "roles";

const AccountsTab = () => {
  const [sub, setSub] = useState<AccountSubTab>("directory");

  const subTabs: { key: AccountSubTab; label: string }[] = [
    { key: "directory", label: "Directory" },
    { key: "jit", label: "JIT Authorization" },
    { key: "roles", label: "Roles & Permissions" },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-5">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={cn(
              "px-3.5 py-1.5 text-[12px] rounded-lg transition-colors",
              sub === t.key
                ? "bg-bg-tertiary text-text-primary font-medium"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "directory" && <DirectorySubTab />}
      {sub === "jit" && <JitSubTab />}
      {sub === "roles" && <RolesSubTab />}
    </div>
  );
};

// ── Directory Sub-tab ──

const DirectorySubTab = () => {
  const [filter, setFilter] = useState<"all" | "human" | "service">("all");

  const filtered = accounts.filter(
    (a) => filter === "all" || a.type === filter
  );
  const humanCount = accounts.filter((a) => a.type === "human").length;
  const serviceCount = accounts.filter((a) => a.type === "service").length;
  const activeServiceCount = accounts.filter(
    (a) => a.type === "service" && a.status === "active"
  ).length;
  const activeJitCount = jitGrants.filter((g) => g.status === "active").length;
  const pendingCount = jitGrants.filter(
    (g) => g.status === "pending-approval"
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {(
            [
              { key: "all", label: "All", count: accounts.length },
              { key: "human", label: "Human", count: humanCount },
              { key: "service", label: "Service", count: serviceCount },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg transition-colors",
                filter === f.key
                  ? "bg-bg-tertiary text-text-primary font-medium"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md",
                  filter === f.key
                    ? "bg-accent/15 text-accent"
                    : "bg-bg-tertiary text-text-muted"
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <button className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
          <Plus size={15} />
          Add Account
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total Accounts" value={accounts.length} />
        <MetricCard label="Active Service Accts" value={activeServiceCount} />
        <MetricCard
          label="Active JIT Sessions"
          value={activeJitCount}
          pulse
        />
        <MetricCard
          label="Pending Approvals"
          value={pendingCount}
          warning={pendingCount > 0}
        />
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              {["Type", "Name", "Email / Identifier", "Role", "Status", "Last Active"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <AccountRow key={a.id} account={a} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  pulse,
  warning,
}: {
  label: string;
  value: number;
  pulse?: boolean;
  warning?: boolean;
}) => (
  <div className="bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3">
    <div className="flex items-center gap-2">
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
      )}
      <span
        className={cn(
          "text-[22px] font-semibold",
          warning ? "text-amber-400" : "text-text-primary"
        )}
      >
        {value}
      </span>
    </div>
    <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
  </div>
);

const statusDot: Record<string, string> = {
  active: "bg-emerald-400",
  suspended: "bg-red-400",
  "pending-invite": "bg-amber-400",
};

const AccountRow = ({ account: a }: { account: Account }) => {
  const isService = a.type === "service";
  const activeGrants = jitGrants.filter(
    (g) => g.accountId === a.id && g.status === "active"
  );

  return (
    <tr
      className={cn(
        "border-b border-border-subtle last:border-b-0 hover:bg-bg-tertiary/50 transition-colors",
        isService && "border-l-2 border-l-accent/30"
      )}
    >
      <td className="px-5 py-3.5">
        {isService ? (
          <Bot size={16} className="text-accent" />
        ) : (
          <User size={16} className="text-text-secondary" />
        )}
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] text-text-primary font-medium">
          {a.name}
        </span>
        {isService && a.boundAgentName && (
          <span className="block text-[11px] text-text-muted mt-0.5">
            → {a.boundAgentName}
          </span>
        )}
      </td>
      <td className="px-5 py-3.5 text-[12px] text-text-secondary font-mono">
        {a.email}
      </td>
      <td className="px-5 py-3.5">
        <span
          className={cn(
            "text-[11px] font-medium px-2.5 py-1 rounded-md",
            roleBadgeColors[a.role]
          )}
        >
          {a.role}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              statusDot[a.status]
            )}
          />
          <span className="text-[12px] text-text-secondary capitalize">
            {a.status.replace("-", " ")}
          </span>
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[12px] text-text-muted font-mono">
          {timeAgo(a.lastActive)}
        </span>
        {activeGrants.length > 0 && (
          <span className="ml-2 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            {activeGrants.length} JIT
          </span>
        )}
      </td>
    </tr>
  );
};

// ── JIT Authorization Sub-tab ──

const JitSubTab = () => {
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
          <Clock size={15} className="text-emerald-400" />
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
                {["Service Account", "Bound Agent", "Approval Method", "Max Grant Duration"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {serviceAccounts.map((a, i) => (
                <tr key={a.id} className={cn(i < serviceAccounts.length - 1 && "border-b border-border-subtle")}>
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

const JitSessionCard = ({ grant: g }: { grant: JitGrant }) => {
  const isPending = g.status === "pending-approval";
  const remaining =
    g.expiresAt ? minutesRemaining(g.expiresAt) : 0;
  const elapsed =
    g.grantedAt && g.expiresAt
      ? elapsedFraction(g.grantedAt, g.expiresAt)
      : 0;
  const barColor = elapsed > 0.75 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div
      className={cn(
        "bg-bg-secondary border border-border-subtle rounded-xl p-4 border-l-[3px]",
        jitStatusBorderColors[g.status]
      )}
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
          </div>
          <p className="text-[12px] text-text-secondary mt-1.5 max-w-xl">
            {g.reason}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded",
              jitStatusColors[g.status]
            )}
          >
            {g.status.replace("-", " ")}
          </span>
        </div>
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

      {/* Footer: approval method + countdown + actions */}
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

        <div className="flex items-center gap-3">
          {!isPending && g.expiresAt && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${(1 - elapsed) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                {remaining}m left
              </span>
            </div>
          )}

          {isPending ? (
            <div className="flex gap-2">
              <button className="text-[11px] font-medium px-3 py-1 rounded-lg bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 transition-colors">
                Approve
              </button>
              <button className="text-[11px] font-medium px-3 py-1 rounded-lg bg-red-400/15 text-red-400 hover:bg-red-400/25 transition-colors">
                Deny
              </button>
            </div>
          ) : (
            <button className="text-[11px] font-medium px-3 py-1 rounded-lg bg-red-400/15 text-red-400 hover:bg-red-400/25 transition-colors">
              Revoke Now
            </button>
          )}
        </div>
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

// ── Roles & Permissions Sub-tab ──

const RolesSubTab = () => {
  const roles = Object.entries(rolePermissions) as [AccountRole, string[]][];

  return (
    <div className="grid grid-cols-2 gap-4">
      {roles.map(([role, perms]) => {
        const count = accounts.filter((a) => a.role === role).length;
        return (
          <div
            key={role}
            className="bg-bg-secondary border border-border-subtle rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "text-[12px] font-medium px-2.5 py-1 rounded-md",
                  roleBadgeColors[role]
                )}
              >
                {role}
              </span>
              <span className="text-[11px] text-text-muted">
                {count} {count === 1 ? "account" : "accounts"}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mb-3">
              {roleDescriptions[role]}
            </p>
            <div className="flex flex-wrap gap-1">
              {perms.map((p) => (
                <span
                  key={p}
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded",
                    p === "*"
                      ? "bg-accent/10 text-accent"
                      : getPermColor(p)
                  )}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── API Keys Tab ───

const ApiKeysTab = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-medium text-text-primary">API Keys</h2>
      <button className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}>
        <Key size={15} />
        Generate New Key
      </button>
    </div>

    <div className="space-y-3">
      {apiKeys.map((key) => (
        <div
          key={key.id}
          className="bg-bg-secondary border border-border-subtle rounded-xl p-5 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[14px] font-medium text-text-primary">
                {key.name}
              </span>
              <div className="flex items-center gap-1.5 bg-bg-tertiary rounded-md px-2.5 py-1">
                <span className="text-[12px] font-mono text-text-secondary">
                  {key.prefix}{"••••••••"}
                </span>
                <Copy size={12} className="text-text-muted hover:text-text-secondary cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-text-muted">
              <span>
                Created{" "}
                {new Date(key.created).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>Last used {timeAgo(key.lastUsed)}</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2.5">
              {key.permissions.map((perm) => (
                <span
                  key={perm}
                  className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Notifications Tab ───

const channelStatus: {
  name: string;
  type: string;
  configured: boolean;
}[] = [
  { name: "Email (SMTP)", type: "email", configured: true },
  { name: "Slack", type: "slack", configured: true },
  { name: "Microsoft Teams", type: "teams", configured: false },
  { name: "Custom Webhook", type: "webhook", configured: true },
];

const alertRules: {
  name: string;
  severity: "critical" | "warning";
  channels: string[];
}[] = [
  { name: "Agent failure", severity: "critical", channels: ["Email", "Slack", "Teams", "Webhook"] },
  { name: "Error rate threshold", severity: "warning", channels: ["Slack", "Email"] },
  { name: "Cost threshold", severity: "warning", channels: ["Email"] },
];

const NotificationsTab = () => (
  <div className="space-y-6 max-w-2xl">
    <div>
      <h2 className="text-[15px] font-medium text-text-primary mb-3">
        Notification Channels
      </h2>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
        {channelStatus.map((ch, i) => (
          <div
            key={ch.type}
            className={cn(
              "flex items-center justify-between px-5 py-3.5",
              i < channelStatus.length - 1 && "border-b border-border-subtle"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  ch.configured ? "bg-emerald-400" : "bg-text-muted"
                )}
              />
              <span className="text-[13px] text-text-primary">{ch.name}</span>
            </div>
            <span
              className={cn(
                "text-[11px] font-medium",
                ch.configured ? "text-emerald-400" : "text-text-muted"
              )}
            >
              {ch.configured ? "Configured" : "Not configured"}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h2 className="text-[15px] font-medium text-text-primary mb-3">
        Alert Rules
      </h2>
      <div className="space-y-3">
        {alertRules.map((rule) => (
          <div
            key={rule.name}
            className="bg-bg-secondary border border-border-subtle rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded",
                  rule.severity === "critical"
                    ? "bg-red-400/15 text-red-400"
                    : "bg-amber-400/15 text-amber-400"
                )}
              >
                {rule.severity}
              </span>
              <span className="text-[13px] text-text-primary">{rule.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {rule.channels.map((ch) => (
                <span
                  key={ch}
                  className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded"
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Tab Content Map ───

const tabContent: Record<Exclude<TabKey, "security">, () => React.ReactElement> = {
  general: GeneralTab,
  accounts: AccountsTab,
  "api-keys": ApiKeysTab,
  notifications: NotificationsTab,
};

// ─── Page ───

const SettingsPage = () => {
  const searchParams = useSearchParams();
  const initialTab = tabs.some((t) => t.key === searchParams.get("tab")) ? (searchParams.get("tab") as TabKey) : "general";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const ActiveContent = activeTab !== "security" ? tabContent[activeTab] : null;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Platform configuration and account management"
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

      {activeTab === "security"
        ? <SecurityTab onNavigate={setActiveTab} />
        : ActiveContent && <ActiveContent />
      }
    </div>
  );
};

const SettingsPageWrapper = () => (
  <Suspense>
    <SettingsPage />
  </Suspense>
);

export default SettingsPageWrapper;
