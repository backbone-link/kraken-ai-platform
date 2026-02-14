"use client";

import {
  dashboardMetrics,
  modelUsage,
  computeUsage,
  agentObservabilityMetrics,
} from "@/data/mock";
import {
  formatNumber,
  formatTokens,
  formatCurrency,
} from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

const modelColors = [
  "bg-[#6b9dd6]",
  "bg-[#9a86c8]",
  "bg-[#5bbfaa]",
  "bg-[#d4a65c]",
  "bg-[#c27e90]",
  "bg-[#72b58e]",
];

const totalAllocated = modelUsage.reduce((s, m) => s + m.allocated, 0);
const totalUsed = modelUsage.reduce((s, m) => s + m.used, 0);
const platformPercent = Math.min((totalUsed / totalAllocated) * 100, 100);

const totalCost = agentObservabilityMetrics.reduce((s, a) => s + a.cost, 0);
const totalTokensIn = agentObservabilityMetrics.reduce((s, a) => s + a.tokensIn, 0);
const totalTokensOut = agentObservabilityMetrics.reduce((s, a) => s + a.tokensOut, 0);
const totalTokens = totalTokensIn + totalTokensOut;

const barColor = (percent: number) => {
  if (percent >= 90) return "bg-error";
  if (percent >= 75) return "bg-warning";
  return "bg-accent";
};

const UsagePage = () => (
  <div>
    <PageHeader
      title="Usage"
      subtitle="Platform resource consumption and cost tracking"
    />

    {/* Summary Cards */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider mb-3">
          Active Agents
        </p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-[32px] font-mono font-light text-text-primary metric-value leading-none">
            {dashboardMetrics.activeAgents}
          </p>
          <span className="text-[14px] font-mono text-text-muted">
            of {dashboardMetrics.totalAgents}
          </span>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider mb-3">
          Runs This Month
        </p>
        <p className="text-[32px] font-mono font-light text-text-primary metric-value leading-none">
          {formatNumber(dashboardMetrics.totalRunsToday)}
        </p>
      </div>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider mb-3">
          Tokens This Month
        </p>
        <p className="text-[32px] font-mono font-light text-text-primary metric-value leading-none">
          {formatTokens(totalTokens)}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[11px] font-mono text-text-muted">
            {formatTokens(totalTokensIn)} in
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            {formatTokens(totalTokensOut)} out
          </span>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider mb-3">
          Cost This Month
        </p>
        <p className="text-[32px] font-mono font-light text-text-primary metric-value leading-none">
          {formatCurrency(totalCost)}
        </p>
      </div>
    </div>

    {/* Model Token Allocation */}
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider">
          Model Token Allocation
        </p>
        <span className="text-[12px] font-mono text-text-secondary">
          {formatTokens(totalUsed)}{" "}
          <span className="text-text-muted">
            / {formatTokens(totalAllocated)}
          </span>
        </span>
      </div>

      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden flex">
        {modelUsage.map((m, i) => {
          const share = (m.used / totalAllocated) * 100;
          return (
            <div
              key={m.model}
              className={`h-full ${modelColors[i % modelColors.length]} ${i === 0 ? "rounded-l-full" : ""}`}
              style={{ width: `${share}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] font-mono text-text-muted">
          {platformPercent.toFixed(0)}% of monthly allowance
        </span>
        <span className="text-[11px] font-mono text-text-muted">
          {formatTokens(totalAllocated - totalUsed)} remaining
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {modelUsage.map((m, i) => {
          const shareOfUsed = ((m.used / totalUsed) * 100).toFixed(0);
          return (
            <div key={m.model} className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${modelColors[i % modelColors.length]}`}
              />
              <span className="text-[11px] text-text-secondary">
                {m.model}
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                {shareOfUsed}%
              </span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Pipeline Compute */}
    {(() => {
      const percent = Math.min(
        (computeUsage.usedHours / computeUsage.includedHours) * 100,
        100
      );
      const overageHours = Math.max(
        computeUsage.usedHours - computeUsage.includedHours,
        0
      );
      const overageCost = overageHours * computeUsage.overageRatePerHour;
      return (
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 mb-4">
          <div className="flex items-baseline justify-between mb-5">
            <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider">
              Pipeline Compute
            </p>
            <span className="text-[11px] font-mono text-text-muted">
              {computeUsage.periodLabel}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_1px_1fr] gap-6">
            <div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[22px] font-mono font-light text-text-primary metric-value leading-none">
                  {computeUsage.usedHours.toFixed(1)}h
                </span>
                <span className="text-[13px] font-mono text-text-muted">
                  of {computeUsage.includedHours}h included
                </span>
              </div>
              <p className="text-[12px] text-text-muted mb-3">
                {Math.max(
                  computeUsage.includedHours - computeUsage.usedHours,
                  0
                ).toFixed(1)}
                h remaining
                {overageHours > 0 && (
                  <span className="text-warning ml-2">
                    {overageHours.toFixed(1)}h overage ({formatCurrency(overageCost)})
                  </span>
                )}
              </p>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full ${barColor(percent)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-text-muted">
                  0h
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  {computeUsage.includedHours}h
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-3">
                Overage rate: {formatCurrency(computeUsage.overageRatePerHour)}/hr
              </p>
            </div>

            <div className="bg-border-subtle" />

            <div>
              <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider mb-3">
                By Pipeline
              </p>
              <div className="flex flex-col gap-3">
                {computeUsage.byPipeline.map((p) => {
                  const pipePercent =
                    (p.hours / computeUsage.usedHours) * 100;
                  return (
                    <div key={p.pipelineId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-text-primary">
                          {p.pipelineName}
                        </span>
                        <span className="text-[12px] font-mono text-text-secondary">
                          {p.hours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden flex-1">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${pipePercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-text-muted w-16 text-right">
                          {formatNumber(p.runs)} runs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Cost Per Agent */}
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider">
          Cost by Agent
        </p>
        <div className="flex items-center gap-4 text-[11px] font-mono text-text-muted">
          <span>{formatTokens(totalTokensIn)} in</span>
          <span>{formatTokens(totalTokensOut)} out</span>
        </div>
      </div>
      <div className="space-y-3">
        {agentObservabilityMetrics.map((agent) => {
          const costPercent = totalCost > 0 ? (agent.cost / totalCost) * 100 : 0;
          return (
            <div key={agent.agentId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-text-primary">{agent.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-mono text-text-muted">
                    {formatTokens(agent.tokensIn)} in
                  </span>
                  <span className="text-[12px] font-mono text-text-muted">
                    {formatTokens(agent.tokensOut)} out
                  </span>
                  <span className="text-[12px] font-mono text-text-secondary">
                    {formatCurrency(agent.cost)}
                  </span>
                </div>
              </div>
              <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${costPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default UsagePage;
