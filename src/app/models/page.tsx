"use client";

import { Plus, Check, AlertTriangle } from "lucide-react";
import { modelProviders } from "@/data/mock";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

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
          const isInactive = provider.status === "inactive";

          return (
            <div
              key={provider.id}
              className={`bg-bg-secondary border border-border-subtle rounded-xl p-6 hover:border-border-default transition-colors ${isInactive ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-medium text-text-primary">
                    {provider.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${provider.status === "active" ? "bg-success" : "bg-text-muted"}`}
                  />
                  <span className="text-[12px] text-text-secondary">
                    {provider.status === "active" ? "Active" : "Not configured"}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                {provider.keyConfigured ? (
                  <>
                    <Check size={12} className="text-success" />
                    <span className="text-success text-[12px]">
                      API key configured
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} className="text-warning" />
                    <span className="text-warning text-[12px]">
                      API key required
                    </span>
                  </>
                )}
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Available Models
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {provider.models.map((model) => (
                    <span
                      key={model}
                      className="bg-bg-tertiary text-text-secondary text-[12px] font-mono px-3 py-1 rounded-lg"
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
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Total Tokens
                  </span>
                  <p className="text-[16px] font-mono metric-value text-text-primary mt-1">
                    {formatNumber(provider.totalTokens)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Total Cost
                  </span>
                  <p className="text-[16px] font-mono metric-value text-text-primary mt-1">
                    {formatCurrency(provider.totalCost)}
                  </p>
                </div>
              </div>

              {isInactive && (
                <button className="mt-4 w-full text-center text-accent text-[13px] font-medium py-2 rounded-lg border border-border-subtle hover:border-accent transition-colors">
                  Configure
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelsPage;
