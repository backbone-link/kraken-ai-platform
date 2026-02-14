"use client";

import { Plus } from "lucide-react";
import { modelProviders } from "@/data/mock";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

const providerColors: Record<string, string> = {
  OpenAI: "#6b9dd6",
  Anthropic: "#d4a65c",
  "Meta (via LiteLLM)": "#5bbfaa",
  Google: "#9a86c8",
};

const defaultColor = "#888888";

const maxRequests = Math.max(...modelProviders.map((p) => p.totalRequests), 1);
const maxTokens = Math.max(...modelProviders.map((p) => p.totalTokens), 1);
const maxCost = Math.max(
  ...modelProviders.filter((p) => p.totalCost > 0).map((p) => p.totalCost),
  1
);

const ModelsPage = () => {
  return (
    <div>
      <PageHeader
        title="Models"
        subtitle="Model provider configurations via LiteLLM proxy"
        actions={
          <button className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 text-[13px] font-medium transition-colors">
            <Plus size={15} />
            Add Provider
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {modelProviders.map((provider) => {
          const color = providerColors[provider.name] ?? defaultColor;
          const isActive = provider.status === "active";

          return (
            <div
              key={provider.id}
              className={
                isActive
                  ? "relative bg-bg-secondary border border-border-subtle rounded-xl p-6 hover:border-border-default overflow-hidden transition-colors"
                  : "relative bg-bg-secondary/40 border border-dashed border-border-default rounded-xl p-6 hover:border-white/30 overflow-hidden transition-colors"
              }
            >
              {/* Subtle top accent gradient */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: isActive
                    ? `linear-gradient(90deg, ${color}50, ${color}10)`
                    : `linear-gradient(90deg, ${color}25, transparent)`,
                }}
              />

              <div className="flex items-center justify-between">
                <span className="text-[18px] font-medium text-text-primary">
                  {provider.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-success" : "bg-text-muted"}`}
                  />
                  <span className="text-[12px] text-text-secondary">
                    {isActive ? "Active" : "Not configured"}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Available Models
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {provider.models.map((model) => (
                    <span
                      key={model}
                      className="text-[12px] font-mono px-3 py-1 rounded-lg"
                      style={
                        isActive
                          ? {
                              backgroundColor: `${color}14`,
                              color: `${color}cc`,
                            }
                          : {
                              backgroundColor: `${color}0a`,
                              color: undefined,
                            }
                      }
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border-subtle my-4" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Total Requests
                  </span>
                  <p className="text-[16px] font-mono metric-value text-text-primary mt-1">
                    {formatNumber(provider.totalRequests)}
                  </p>
                  {provider.totalRequests > 0 && (
                    <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(provider.totalRequests / maxRequests) * 100}%`,
                          backgroundColor: `${color}50`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Total Tokens
                  </span>
                  <p className="text-[16px] font-mono metric-value text-text-primary mt-1">
                    {formatNumber(provider.totalTokens)}
                  </p>
                  {provider.totalTokens > 0 && (
                    <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(provider.totalTokens / maxTokens) * 100}%`,
                          backgroundColor: `${color}50`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Total Cost
                  </span>
                  {provider.totalCost > 0 ? (
                    <>
                      <p className="text-[16px] font-mono metric-value text-text-primary mt-1">
                        {formatCurrency(provider.totalCost)}
                      </p>
                      <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(provider.totalCost / maxCost) * 100}%`,
                            backgroundColor: `${color}50`,
                          }}
                        />
                      </div>
                    </>
                  ) : isActive ? (
                    <p className="text-[16px] font-mono metric-value text-success mt-1">
                      Free
                    </p>
                  ) : (
                    <p className="text-[16px] font-mono metric-value text-text-muted mt-1">
                      —
                    </p>
                  )}
                </div>
              </div>

              <button className="mt-4 w-full text-center text-accent text-[13px] font-medium py-2 rounded-lg border border-border-subtle hover:border-accent transition-colors">
                Configure
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelsPage;
