"use client";

import { useState } from "react";
import { Plus, Key, Shield, Bell, Settings2, Users, Copy } from "lucide-react";
import { teamMembers, apiKeys } from "@/data/mock";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

const tabs = [
  { key: "general", label: "General", icon: Settings2 },
  { key: "team", label: "Team", icon: Users },
  { key: "api-keys", label: "API Keys", icon: Key },
  { key: "governance", label: "Governance", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const inputClass =
  "bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 w-full";

const labelClass = "text-[12px] font-medium text-text-secondary mb-1.5 block";

const Toggle = ({ on }: { on: boolean }) => (
  <div
    className={cn(
      "w-9 h-5 rounded-full relative transition-colors shrink-0",
      on ? "bg-accent" : "bg-bg-tertiary border border-border-subtle"
    )}
  >
    <div
      className={cn(
        "w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-[left]",
        on ? "left-[18px]" : "left-[3px]"
      )}
    />
  </div>
);

const roleBadge: Record<string, string> = {
  admin: "bg-accent/15 text-accent",
  editor: "bg-bg-tertiary text-text-secondary",
  viewer: "bg-bg-tertiary text-text-muted",
};

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
          defaultValue="https://kraken.acme-electronics.com"
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
      <button className="bg-accent hover:bg-accent-hover text-white rounded-lg px-5 py-2 text-[13px] font-medium transition-colors">
        Save Changes
      </button>
    </div>
  </div>
);

const TeamTab = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-medium text-text-primary">
        Team Members
      </h2>
      <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 text-[13px] font-medium transition-colors">
        <Plus size={15} />
        Invite Member
      </button>
    </div>

    <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3">
              Name
            </th>
            <th className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3">
              Email
            </th>
            <th className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3">
              Role
            </th>
            <th className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-5 py-3">
              Last Active
            </th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => (
            <tr
              key={member.id}
              className="border-b border-border-subtle last:border-b-0 hover:bg-bg-tertiary/50 transition-colors"
            >
              <td className="px-5 py-3.5 text-[13px] text-text-primary font-medium">
                {member.name}
              </td>
              <td className="px-5 py-3.5 text-[13px] text-text-secondary font-mono">
                {member.email}
              </td>
              <td className="px-5 py-3.5">
                <span
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-md capitalize",
                    roleBadge[member.role]
                  )}
                >
                  {member.role}
                </span>
              </td>
              <td className="px-5 py-3.5 text-[12px] text-text-muted font-mono">
                {timeAgo(member.lastActive)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ApiKeysTab = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-medium text-text-primary">API Keys</h2>
      <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 text-[13px] font-medium transition-colors">
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

const GovernanceTab = () => (
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

    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
      <h2 className="text-[15px] font-medium text-text-primary mb-5">
        Compliance
      </h2>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-text-primary font-medium">
              Audit Log Export
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Download complete audit trail as CSV
            </p>
          </div>
          <button className="text-[12px] text-accent hover:text-accent-hover font-medium transition-colors">
            Export
          </button>
        </div>

        <div className="border-t border-border-subtle" />

        <div>
          <label className={labelClass}>Retention Policy</label>
          <select className={inputClass}>
            <option>90 days — Standard</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

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

const tabContent: Record<TabKey, () => React.ReactElement> = {
  general: GeneralTab,
  team: TeamTab,
  "api-keys": ApiKeysTab,
  governance: GovernanceTab,
  notifications: NotificationsTab,
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const ActiveContent = tabContent[activeTab];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Platform configuration and team management"
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

export default SettingsPage;
