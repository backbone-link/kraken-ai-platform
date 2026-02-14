"use client";

import {
  dashboardMetrics,
  modelUsage,
  computeUsage,
  agentObservabilityMetrics,
  billingPlan,
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

const totalUsed = modelUsage.reduce((s, m) => s + m.used, 0);

const totalCost = agentObservabilityMetrics.reduce((s, a) => s + a.cost, 0);
const totalTokensIn = agentObservabilityMetrics.reduce((s, a) => s + a.tokensIn, 0);
const totalTokensOut = agentObservabilityMetrics.reduce((s, a) => s + a.tokensOut, 0);
const totalTokens = totalTokensIn + totalTokensOut;

const barColor = (percent: number) => {
  if (percent >= 90) return "bg-error/70";
  if (percent >= 75) return "bg-warning/70";
  return "bg-accent/50";
};

const UsagePage = () => (
  <div>
    <PageHeader
      title="Usage"
      subtitle="Platform resource consumption and cost tracking"
    />

    {/* API Usage */}
    {(() => {
      const usagePercent = Math.min((totalCost / billingPlan.monthlyAllowance) * 100, 100);
      const remaining = Math.max(billingPlan.monthlyAllowance - totalCost, 0);
      const retailValue = totalCost * billingPlan.apiMultiplier;
      const coveredAmount = Math.min(totalCost, billingPlan.monthlyAllowance);
      const overage = Math.max(totalCost - billingPlan.monthlyAllowance, 0);

      return (
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider mb-3">
                API Usage This Month
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-mono font-light text-text-primary metric-value leading-none">
                  {formatCurrency(totalCost)}
                </span>
                <span className="text-[14px] font-mono text-text-muted">
                  of {formatCurrency(billingPlan.monthlyAllowance)} included
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                {billingPlan.apiMultiplier}× multiplier
              </span>
              <span className="text-[11px] font-mono text-text-muted bg-white/[0.04] px-2 py-1 rounded">
                {billingPlan.name}
              </span>
            </div>
          </div>

          <div className="h-2.5 bg-bg-tertiary rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${usagePercent >= 90 ? "bg-error/70" : usagePercent >= 75 ? "bg-warning/70" : "bg-accent/50"}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono text-text-muted">
              {usagePercent.toFixed(0)}% of included API usage
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              {formatCurrency(remaining)} remaining
            </span>
          </div>

          <div className="flex items-center gap-6 pt-3 border-t border-border-subtle">
            <div>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-0.5">
                Included
              </p>
              <p className="text-[14px] font-mono text-success">
                {formatCurrency(coveredAmount)}
              </p>
            </div>
            {overage > 0 && (
              <div>
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-0.5">
                  Overage
                </p>
                <p className="text-[14px] font-mono text-error">
                  {formatCurrency(overage)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-0.5">
                At Provider Rates
              </p>
              <p className="text-[14px] font-mono text-text-secondary">
                {formatCurrency(retailValue)}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-0.5">
                Billing Period
              </p>
              <p className="text-[13px] font-mono text-text-secondary">
                {billingPlan.periodLabel}
              </p>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Summary Cards */}
    <div className="grid grid-cols-3 gap-4 mb-6">
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
    </div>

    {/* Usage by Model */}
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-muted font-mono text-[11px] uppercase tracking-wider">
          Usage by Model
        </p>
        <span className="text-[12px] font-mono text-text-secondary">
          {formatTokens(totalUsed)} tokens
        </span>
      </div>

      {(() => {
        const sorted = [...modelUsage].sort((a, b) => b.used - a.used);
        const exact = sorted.map((m) => (m.used / totalUsed) * 100);
        const floored = exact.map(Math.floor);
        let remainder = 100 - floored.reduce((s, v) => s + v, 0);
        const remainders = exact.map((v, i) => ({ i, r: v - floored[i] }));
        remainders.sort((a, b) => b.r - a.r);
        for (const { i } of remainders) {
          if (remainder <= 0) break;
          floored[i]++;
          remainder--;
        }

        return (
          <div className="space-y-3">
            {sorted.map((m, i) => (
              <div key={m.model}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${modelColors[i % modelColors.length]}`}
                    />
                    <span className="text-[13px] text-text-primary">
                      {m.model}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {m.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-mono text-text-muted">
                      {formatTokens(m.used)}
                    </span>
                    <span className="text-[12px] font-mono text-text-secondary w-10 text-right">
                      {floored[i]}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${modelColors[i % modelColors.length]}`}
                    style={{ width: `${exact[i]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })()}
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
                            className="h-full rounded-full bg-accent/50"
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
                  className="h-full rounded-full bg-accent/50"
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
