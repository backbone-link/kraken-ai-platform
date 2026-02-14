"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <h1 className="text-[22px] font-medium text-text-primary leading-tight tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[13px] text-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
