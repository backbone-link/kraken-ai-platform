"use client";

import {
  Calendar,
  Timer,
  RotateCcw,
  Layers,
  Bell,
  Gauge,
  Server,
  ShieldCheck,
  Save,
} from "lucide-react";
import { type AgentConfig } from "@/data/mock";
import { cn } from "@/lib/utils";

interface AgentConfigPanelProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
}

const inputClassName =
  "w-full bg-bg-primary border border-border-subtle rounded-md px-2.5 py-1.5 text-[12px] font-mono text-text-primary focus:outline-none focus:border-accent/40 transition-colors";

const selectClassName =
  "w-full bg-bg-primary border border-border-subtle rounded-md px-2.5 py-1.5 text-[12px] font-mono text-text-primary focus:outline-none focus:border-accent/40 transition-colors appearance-none";

const labelClassName = "text-[10px] font-mono uppercase tracking-wider text-text-muted";

export const AgentConfigPanel = ({ config, onChange }: AgentConfigPanelProps) => {
  const updateSchedule = (updates: Partial<NonNullable<AgentConfig["schedule"]>>) => {
    onChange({
      ...config,
      schedule: {
        ...config.schedule,
        type: config.schedule?.type ?? "none",
        description: config.schedule?.description ?? "",
        ...updates,
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-semibold text-text-primary">Agent Configuration</h3>
        <button className="flex items-center gap-1.5 text-[11px] font-medium text-accent hover:text-accent/80 transition-colors">
          <Save size={12} />
          Save
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-subtle">
        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar size={11} className="text-text-muted" />
            <span className={labelClassName}>Schedule</span>
          </div>
          <div className="space-y-2">
            <select
              value={config.schedule?.type ?? "none"}
              onChange={(e) =>
                updateSchedule({ type: e.target.value as "cron" | "interval" | "none" })
              }
              className={selectClassName}
            >
              <option value="cron">cron</option>
              <option value="interval">interval</option>
              <option value="none">none</option>
            </select>
            {(config.schedule?.type === "cron" || config.schedule?.type === "interval") && (
              <input
                type="text"
                value={config.schedule?.expression ?? ""}
                onChange={(e) => updateSchedule({ expression: e.target.value })}
                className={inputClassName}
                placeholder="Expression"
              />
            )}
            <select
              value={config.schedule?.timezone ?? "UTC"}
              onChange={(e) => updateSchedule({ timezone: e.target.value })}
              className={selectClassName}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Denver">America/Denver</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Timer size={11} className="text-text-muted" />
            <span className={labelClassName}>Timeout</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={config.timeout / 1000}
              onChange={(e) =>
                onChange({ ...config, timeout: Number(e.target.value) * 1000 })
              }
              className={inputClassName}
            />
            <span className="text-[11px] font-mono text-text-muted shrink-0">sec</span>
          </div>
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <RotateCcw size={11} className="text-text-muted" />
            <span className={labelClassName}>Retries</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-mono text-text-muted mb-0.5 block">attempts</span>
              <input
                type="number"
                min={0}
                max={10}
                value={config.retries.maxAttempts}
                onChange={(e) =>
                  onChange({
                    ...config,
                    retries: { ...config.retries, maxAttempts: Number(e.target.value) },
                  })
                }
                className={inputClassName}
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-muted mb-0.5 block">backoff (s)</span>
              <input
                type="number"
                min={0}
                value={config.retries.backoffMs / 1000}
                onChange={(e) =>
                  onChange({
                    ...config,
                    retries: { ...config.retries, backoffMs: Number(e.target.value) * 1000 },
                  })
                }
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Layers size={11} className="text-text-muted" />
            <span className={labelClassName}>Concurrency</span>
          </div>
          <input
            type="number"
            min={1}
            max={20}
            value={config.concurrency}
            onChange={(e) =>
              onChange({ ...config, concurrency: Number(e.target.value) })
            }
            className={inputClassName}
          />
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Bell size={11} className="text-text-muted" />
            <span className={labelClassName}>Notifications</span>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={config.notifications.channel}
              onChange={(e) =>
                onChange({
                  ...config,
                  notifications: { ...config.notifications, channel: e.target.value },
                })
              }
              className={inputClassName}
              placeholder="#channel"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onChange({
                    ...config,
                    notifications: {
                      ...config.notifications,
                      onSuccess: !config.notifications.onSuccess,
                    },
                  })
                }
                className={cn(
                  "text-[9px] font-mono px-2 py-0.5 rounded transition-colors",
                  config.notifications.onSuccess
                    ? "bg-emerald-400/15 text-emerald-400"
                    : "bg-white/[0.07] text-text-muted hover:bg-white/[0.12]"
                )}
              >
                success
              </button>
              <button
                onClick={() =>
                  onChange({
                    ...config,
                    notifications: {
                      ...config.notifications,
                      onFailure: !config.notifications.onFailure,
                    },
                  })
                }
                className={cn(
                  "text-[9px] font-mono px-2 py-0.5 rounded transition-colors",
                  config.notifications.onFailure
                    ? "bg-red-400/15 text-red-400"
                    : "bg-white/[0.07] text-text-muted hover:bg-white/[0.12]"
                )}
              >
                failure
              </button>
              <button
                onClick={() =>
                  onChange({
                    ...config,
                    notifications: {
                      ...config.notifications,
                      onTimeout: !config.notifications.onTimeout,
                    },
                  })
                }
                className={cn(
                  "text-[9px] font-mono px-2 py-0.5 rounded transition-colors",
                  config.notifications.onTimeout
                    ? "bg-yellow-400/15 text-yellow-400"
                    : "bg-white/[0.07] text-text-muted hover:bg-white/[0.12]"
                )}
              >
                timeout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Gauge size={11} className="text-text-muted" />
            <span className={labelClassName}>Resource Limits</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-mono text-text-muted mb-0.5 block">k tokens</span>
              <input
                type="number"
                min={0}
                value={config.resourceLimits.maxTokensPerRun / 1000}
                onChange={(e) =>
                  onChange({
                    ...config,
                    resourceLimits: {
                      ...config.resourceLimits,
                      maxTokensPerRun: Number(e.target.value) * 1000,
                    },
                  })
                }
                className={inputClassName}
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-muted mb-0.5 block">$ max</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={config.resourceLimits.maxCostPerRun}
                onChange={(e) =>
                  onChange({
                    ...config,
                    resourceLimits: {
                      ...config.resourceLimits,
                      maxCostPerRun: Number(e.target.value),
                    },
                  })
                }
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Server size={11} className="text-text-muted" />
            <span className={labelClassName}>Environment</span>
          </div>
          <select
            value={config.environment}
            onChange={(e) =>
              onChange({
                ...config,
                environment: e.target.value as "production" | "staging" | "development",
              })
            }
            className={cn(
              selectClassName,
              config.environment === "production" && "text-emerald-400",
              config.environment === "staging" && "text-yellow-400",
              config.environment === "development" && "text-blue-400"
            )}
          >
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="development">development</option>
          </select>
        </div>

        <div className="bg-bg-secondary px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <ShieldCheck size={11} className="text-text-muted" />
            <span className={labelClassName}>Auto-Recover</span>
          </div>
          <button
            role="switch"
            aria-checked={config.autoRecover}
            onClick={() => onChange({ ...config, autoRecover: !config.autoRecover })}
            className={cn(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
              config.autoRecover ? "bg-emerald-500" : "bg-white/15"
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                config.autoRecover ? "translate-x-[18px]" : "translate-x-[3px]"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
