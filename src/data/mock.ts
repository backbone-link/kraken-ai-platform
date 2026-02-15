// ─── Agent Types ───

export type AgentStatus = "running" | "idle" | "error" | "paused" | "killed";
export type TriggerType = "scheduled" | "manual" | "webhook" | "event-driven" | "api";

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  lastRun: string;
  nextRun?: string;
  successRate: number;
  totalRuns: number;
  avgDuration: number;
  triggers: TriggerType[];
  version: string;
  source: IntegrationSource;
  sourceDetail?: string;
  securityFlags: number;
}

export interface AgentConfig {
  schedule?: {
    type: "cron" | "interval" | "none";
    expression?: string;
    timezone?: string;
    description: string;
  };
  timeout: number;
  retries: {
    maxAttempts: number;
    backoffMs: number;
  };
  concurrency: number;
  notifications: {
    channel: string;
    onSuccess: boolean;
    onFailure: boolean;
    onTimeout: boolean;
  };
  resourceLimits: {
    maxTokensPerRun: number;
    maxCostPerRun: number;
  };
  environment: "production" | "staging" | "development";
  autoRecover: boolean;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status: "success" | "error" | "running" | "pending" | "killed";
  startedAt: string;
  duration: number;
  tokensUsed: number;
  cost: number;
  trigger: TriggerType;
}

// ─── Flow Types ───

export interface FlowNode {
  id: string;
  type: "trigger" | "model" | "tool" | "condition" | "security" | "action" | "human" | "agent" | "report";
  label: string;
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// ─── Metrics Types ───

export interface TimeSeriesPoint {
  time: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface ApiCallsPoint {
  time: string;
  success: number;
  clientError: number;
  serverError: number;
}

// ─── Plugin Marketplace Types ───

export type IntegrationSource = "kraken" | "community" | "custom";

export interface PluginMarketplace {
  id: string;
  name: string;
  source: IntegrationSource;
  url: string;
  description: string;
  pluginCount: number;
  installedCount: number;
  connected: boolean;
  version: string;
  updateAvailable?: string;
}

export interface AgentMarketplace {
  id: string;
  name: string;
  source: IntegrationSource;
  url: string;
  description: string;
  agentCount: number;
  installedCount: number;
  connected: boolean;
  version: string;
  updateAvailable?: string;
}

// ─── Integration Types ───

export interface IntegrationConfigField {
  label: string;
  value: string;
  type: "text" | "secret" | "select" | "toggle";
}

export interface Integration {
  id: string;
  name: string;
  category: "data-source" | "tool" | "action" | "skill";
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  description: string;
  subscribed: boolean;
  enabled: boolean;
  source: IntegrationSource;
  sourceDetail?: string;
  marketplaceId?: string;
  mcpEndpoint?: string;
  mcpCommand?: string;
  transport?: "http" | "stdio";
  version?: string;
  config?: IntegrationConfigField[];
  skillContent?: string;
  skillFilePath?: string;
  githubUrl?: string;
}

// ─── Pipeline Types ───

export interface PipelineRun {
  id: string;
  status: "success" | "error";
  startedAt: string;
  duration: number;
  recordsProcessed: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: "active" | "paused" | "error";
  lastRun: string;
  nextRun: string;
  avgDuration: number;
  outputFormat: string;
  code: string;
  recentRuns: PipelineRun[];
}

export interface ComputeCluster {
  id: string;
  name: string;
  type: "cpu-optimized" | "gpu-accelerated" | "general-purpose";
  vcpus: number;
  memoryGb: number;
  gpus: number;
  gpuModel?: string;
  maxConcurrentPipelines: number;
  status: "healthy" | "degraded" | "offline";
  utilization: number;
}

// ─── Model Types ───

export interface ModelProvider {
  id: string;
  name: string;
  status: "active" | "inactive";
  models: string[];
  keyConfigured: boolean;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
}

// ─── Activity Types ───

export interface ActivityItem {
  id: string;
  type: "agent_run" | "pipeline_run" | "alert" | "deployment" | "config_change";
  message: string;
  timestamp: string;
  agentName?: string;
  status: "success" | "error" | "warning" | "info";
}

// ─── Account Types ───

export type AccountType = "human" | "service";
export type AccountRole = "org-admin" | "security-admin" | "agent-developer" | "agent-operator" | "auditor" | "read-only";
export type AccountStatus = "active" | "suspended" | "pending-invite";
export type JitPolicy = "auto-approve" | "policy-based" | "require-approval";
export type JitStatus = "active" | "expired" | "revoked" | "pending-approval" | "denied";

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  lastActive: string;
  createdAt: string;
  department?: string;
  ssoProvider?: string;
  mfaEnabled?: boolean;
  boundAgentId?: string;
  boundAgentName?: string;
  basePermissions?: string[];
  maxJitDuration?: number;
  jitPolicy?: JitPolicy;
  idpSource?: string;
  lastSyncAt?: string;
  owner?: string;
  authMethod?: string;
  requestablePermissions?: string[];
}

export interface JitGrant {
  id: string;
  accountId: string;
  accountName: string;
  agentId: string;
  agentName: string;
  permissions: string[];
  reason: string;
  status: JitStatus;
  requestedAt: string;
  grantedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  approvedBy?: string;
  approvalMethod: "auto-policy" | "human" | "policy-engine";
  taskContext?: string;
  revokeReason?: string;
}

export const rolePermissions: Record<AccountRole, string[]> = {
  "org-admin": ["*"],
  "security-admin": ["accounts:manage", "audit:read", "audit:export", "governance:manage", "agents:pause", "agents:kill", "jit:approve", "jit:revoke"],
  "agent-developer": ["agents:read", "agents:create", "agents:deploy", "pipelines:read", "pipelines:create", "integrations:read", "integrations:connect", "observability:read"],
  "agent-operator": ["agents:read", "agents:execute", "agents:pause", "pipelines:read", "pipelines:execute", "observability:read", "jit:approve"],
  "auditor": ["audit:read", "audit:export", "observability:read", "agents:read", "accounts:read", "governance:read"],
  "read-only": ["agents:read", "pipelines:read", "observability:read", "integrations:read"],
};

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

// ─── Audit Types ───

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: "success" | "error" | "warning";
  details: string;
  duration: number;
}

// ═══════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════

export const agents: Agent[] = [
  {
    id: "agt-001",
    name: "Market Intelligence",
    description: "Monitors competitor pricing, tracks marketplace trends, and identifies arbitrage opportunities across channels.",
    status: "running",
    lastRun: "2026-02-13T14:15:00Z",
    nextRun: "2026-02-13T15:15:00Z",
    successRate: 98.7,
    totalRuns: 23,
    avgDuration: 2400,
    triggers: ["scheduled", "webhook"],
    version: "2.1.0",
    source: "kraken",
    securityFlags: 0,
  },
  {
    id: "agt-002",
    name: "Inventory Intelligence",
    description: "Tracks real-time stock levels, predicts restock needs, and optimizes inventory allocation across warehouses.",
    status: "running",
    lastRun: "2026-02-13T14:20:00Z",
    nextRun: "2026-02-13T14:50:00Z",
    successRate: 99.2,
    totalRuns: 27,
    avgDuration: 1800,
    triggers: ["scheduled", "event-driven"],
    version: "1.8.3",
    source: "kraken",
    securityFlags: 0,
  },
  {
    id: "agt-003",
    name: "Demand Forecasting",
    description: "Agentic demand forecasting — a single Opus 4.6 orchestrator with four tools (manage_tasks, spawn_agents, query_data, run_analysis) loops dynamically, spawning 0..N parallel sub-agents per iteration until confidence thresholds are met. Mirrors Claude Code's team orchestration pattern.",
    status: "running",
    lastRun: "2026-02-14T06:00:00Z",
    nextRun: "2026-02-15T06:00:00Z",
    successRate: 97.1,
    totalRuns: 14,
    avgDuration: 3_840_000,
    triggers: ["scheduled"],
    version: "2.0.0",
    source: "kraken",
    securityFlags: 0,
  },
  {
    id: "agt-004",
    name: "Customer Support Triage",
    description: "Classifies incoming support tickets by urgency and routes them to the appropriate team with suggested responses.",
    status: "killed",
    lastRun: "2026-02-13T14:32:00Z",
    successRate: 94.5,
    totalRuns: 19,
    avgDuration: 950,
    triggers: ["webhook", "event-driven"],
    version: "3.0.1",
    source: "community",
    sourceDetail: "commerce-ai",
    securityFlags: 1,
  },
  {
    id: "agt-005",
    name: "Price Optimization",
    description: "Dynamically adjusts product pricing based on market conditions, demand signals, and competitor pricing data.",
    status: "paused",
    lastRun: "2026-02-13T10:30:00Z",
    successRate: 96.8,
    totalRuns: 4,
    avgDuration: 3200,
    triggers: ["scheduled", "manual"],
    version: "1.1.0",
    source: "community",
    sourceDetail: "commerce-ai",
    securityFlags: 0,
  },
];

export const agentConfigs: Record<string, AgentConfig> = {
  "agt-001": {
    schedule: { type: "cron", expression: "0 * * * *", timezone: "UTC", description: "Every hour" },
    timeout: 30_000,
    retries: { maxAttempts: 3, backoffMs: 5_000 },
    concurrency: 1,
    notifications: { channel: "#market-alerts", onSuccess: false, onFailure: true, onTimeout: true },
    resourceLimits: { maxTokensPerRun: 15_000, maxCostPerRun: 0.50 },
    environment: "production",
    autoRecover: true,
  },
  "agt-002": {
    schedule: { type: "interval", expression: "*/30 * * * *", timezone: "UTC", description: "Every 30 minutes" },
    timeout: 20_000,
    retries: { maxAttempts: 2, backoffMs: 3_000 },
    concurrency: 1,
    notifications: { channel: "#inventory-ops", onSuccess: false, onFailure: true, onTimeout: true },
    resourceLimits: { maxTokensPerRun: 10_000, maxCostPerRun: 0.30 },
    environment: "production",
    autoRecover: true,
  },
  "agt-003": {
    schedule: { type: "cron", expression: "0 6 * * *", timezone: "America/New_York", description: "Daily at 6:00 AM ET" },
    timeout: 600_000,
    retries: { maxAttempts: 1, backoffMs: 30_000 },
    concurrency: 1,
    notifications: { channel: "#demand-planning", onSuccess: true, onFailure: true, onTimeout: true },
    resourceLimits: { maxTokensPerRun: 500_000, maxCostPerRun: 15.00 },
    environment: "production",
    autoRecover: false,
  },
  "agt-004": {
    schedule: { type: "none", description: "Webhook-triggered" },
    timeout: 15_000,
    retries: { maxAttempts: 2, backoffMs: 2_000 },
    concurrency: 5,
    notifications: { channel: "#support-escalation", onSuccess: false, onFailure: true, onTimeout: true },
    resourceLimits: { maxTokensPerRun: 8_000, maxCostPerRun: 0.20 },
    environment: "production",
    autoRecover: true,
  },
  "agt-005": {
    schedule: { type: "cron", expression: "0 9,17 * * 1-5", timezone: "America/New_York", description: "Weekdays at 9 AM & 5 PM ET" },
    timeout: 60_000,
    retries: { maxAttempts: 2, backoffMs: 10_000 },
    concurrency: 1,
    notifications: { channel: "#pricing-ops", onSuccess: true, onFailure: true, onTimeout: true },
    resourceLimits: { maxTokensPerRun: 20_000, maxCostPerRun: 1.00 },
    environment: "staging",
    autoRecover: false,
  },
};

export const agentMarketplaces: AgentMarketplace[] = [
  {
    id: "amarketplace-logistics",
    name: "logistics",
    source: "kraken",
    url: "https://agents.kraken-ai.com/logistics",
    description: "Supply chain, inventory, and demand planning agents",
    agentCount: 3,
    installedCount: 3,
    connected: true,
    version: "2.4.0",
  },
  {
    id: "amarketplace-commerce-ai",
    name: "commerce-ai",
    source: "community",
    url: "https://github.com/commerce-ai/kraken-agents",
    description: "Community agents for e-commerce automation and optimization",
    agentCount: 8,
    installedCount: 2,
    connected: true,
    version: "1.2.1",
    updateAvailable: "1.3.0",
  },
  {
    id: "amarketplace-internal",
    name: "acme-internal",
    source: "custom",
    url: "https://github.com/acme-electronics/kraken-agents",
    description: "Private agents for Acme Electronics internal workflows",
    agentCount: 3,
    installedCount: 0,
    connected: true,
    version: "0.9.0",
  },
];

export const recentRuns: AgentRun[] = [
  { id: "run-001", agentId: "agt-004", agentName: "Customer Support Triage", status: "success", startedAt: "2026-02-13T14:28:00Z", duration: 890, tokensUsed: 2100, cost: 0.04, trigger: "webhook" },
  { id: "run-002", agentId: "agt-002", agentName: "Inventory Intelligence", status: "success", startedAt: "2026-02-13T14:20:00Z", duration: 1750, tokensUsed: 4800, cost: 0.12, trigger: "scheduled" },
  { id: "run-003", agentId: "agt-001", agentName: "Market Intelligence", status: "success", startedAt: "2026-02-13T14:15:00Z", duration: 2340, tokensUsed: 6200, cost: 0.18, trigger: "scheduled" },
  { id: "run-004", agentId: "agt-004", agentName: "Customer Support Triage", status: "success", startedAt: "2026-02-13T14:12:00Z", duration: 920, tokensUsed: 1950, cost: 0.03, trigger: "webhook" },
  { id: "run-008", agentId: "agt-002", agentName: "Inventory Intelligence", status: "success", startedAt: "2026-02-13T13:50:00Z", duration: 1680, tokensUsed: 4600, cost: 0.11, trigger: "scheduled" },
  { id: "run-005", agentId: "agt-001", agentName: "Market Intelligence", status: "error", startedAt: "2026-02-13T13:15:00Z", duration: 4500, tokensUsed: 3100, cost: 0.09, trigger: "scheduled" },
  { id: "run-006", agentId: "agt-003", agentName: "Demand Forecasting", status: "success", startedAt: "2026-02-14T06:00:00Z", duration: 3_900_000, tokensUsed: 1_284_000, cost: 48.72, trigger: "scheduled" },
  { id: "run-007", agentId: "agt-005", agentName: "Price Optimization", status: "success", startedAt: "2026-02-13T10:30:00Z", duration: 3100, tokensUsed: 7800, cost: 0.22, trigger: "manual" },
];

export const agentFlows: Record<string, { nodes: FlowNode[]; edges: FlowEdge[] }> = {
  // ── Market Intelligence ──
  "agt-001": {
    nodes: [
      { id: "n1", type: "trigger", label: "Cron: Every Hour", x: 50, y: 250 },
      { id: "n2", type: "security", label: "Input Validation", x: 300, y: 250 },
      { id: "n5", type: "model", label: "GPT-5.2: Analyze Trends", x: 620, y: 250 },
      { id: "n3", type: "tool", label: "Fetch Market Data", x: 620, y: 70 },
      { id: "n4", type: "tool", label: "Fetch Competitor Prices", x: 620, y: 430 },
      { id: "n7", type: "security", label: "Output Validation", x: 940, y: 250 },
      { id: "n6", type: "condition", label: "Arbitrage Found?", x: 1230, y: 250 },
      { id: "n10", type: "human", label: "Manager Approval", x: 1500, y: 140 },
      { id: "n8", type: "action", label: "Send Slack Alert", x: 1770, y: 140 },
      { id: "n9", type: "action", label: "Update Dashboard", x: 1500, y: 370 },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n5" },
      { id: "e3", source: "n5", target: "n3", label: "tool call", sourceHandle: "tool-t", targetHandle: "bottom" },
      { id: "e4", source: "n5", target: "n4", label: "tool call", sourceHandle: "tool-b", targetHandle: "top" },
      { id: "e5", source: "n5", target: "n7" },
      { id: "e6", source: "n7", target: "n6" },
      { id: "e7", source: "n6", target: "n10", label: "Yes" },
      { id: "e8", source: "n6", target: "n9", label: "No" },
      { id: "e9", source: "n10", target: "n8", label: "Approved" },
    ],
  },
  // ── Inventory Intelligence ──
  "agt-002": {
    nodes: [
      { id: "t1", type: "trigger", label: "Cron: Every 30m", x: 50, y: 250 },
      { id: "s1", type: "security", label: "Auth & Rate Check", x: 300, y: 250 },
      { id: "m1", type: "model", label: "Claude Sonnet 4.5: Reconcile", x: 620, y: 250 },
      { id: "t2", type: "tool", label: "Query Warehouse DB", x: 620, y: 70 },
      { id: "t3", type: "tool", label: "Sync Shopify Levels", x: 620, y: 430 },
      { id: "s2", type: "security", label: "Data Integrity Check", x: 940, y: 250 },
      { id: "c1", type: "condition", label: "Conflicts Found?", x: 1230, y: 250 },
      { id: "a1", type: "action", label: "Push Inventory Updates", x: 1500, y: 140 },
      { id: "a2", type: "action", label: "Notify Slack", x: 1770, y: 140 },
      { id: "a3", type: "action", label: "Log: No Changes", x: 1500, y: 370 },
    ],
    edges: [
      { id: "e1", source: "t1", target: "s1" },
      { id: "e2", source: "s1", target: "m1" },
      { id: "e3", source: "m1", target: "t2", label: "tool call", sourceHandle: "tool-t", targetHandle: "bottom" },
      { id: "e4", source: "m1", target: "t3", label: "tool call", sourceHandle: "tool-b", targetHandle: "top" },
      { id: "e5", source: "m1", target: "s2" },
      { id: "e6", source: "s2", target: "c1" },
      { id: "e7", source: "c1", target: "a1", label: "Yes" },
      { id: "e8", source: "c1", target: "a3", label: "No" },
      { id: "e9", source: "a1", target: "a2" },
    ],
  },
  // ── Demand Forecasting (Agentic Loop — Claude Code Pattern) ──
  "agt-003": {
    nodes: [
      // Deterministic entry
      { id: "t1", type: "trigger", label: "Scheduled / On-Demand", x: 50, y: 350 },
      { id: "s1", type: "security", label: "Input Auth & Scoping", x: 300, y: 350 },

      // Orchestrator hub — 4 tools in diamond pattern
      { id: "orch", type: "model", label: "Opus 4.6 Orchestrator", x: 700, y: 350 },
      { id: "tool-tasks", type: "tool", label: "manage_tasks", x: 560, y: 120 },
      { id: "tool-spawn", type: "tool", label: "spawn_agents", x: 840, y: 120 },
      { id: "tool-query", type: "tool", label: "query_data", x: 560, y: 580 },
      { id: "tool-code", type: "tool", label: "run_analysis", x: 840, y: 580 },

      // Dynamic agent pool
      { id: "agents", type: "agent", label: "Sub-Agents (0..N)", x: 1180, y: 120 },

      // Deterministic exit
      { id: "s2", type: "security", label: "Output Guardrails", x: 1180, y: 580 },
      { id: "gate", type: "condition", label: "Confidence ≥ 92%?", x: 1500, y: 350 },
      { id: "out-write", type: "action", label: "Write to Snowflake", x: 1780, y: 200 },
      { id: "out-review", type: "human", label: "Analyst Review", x: 1780, y: 500 },
      { id: "out-notify", type: "action", label: "Notify Slack", x: 2060, y: 200 },
    ],
    edges: [
      // Deterministic entry
      { id: "e1", source: "t1", target: "s1" },
      { id: "e2", source: "s1", target: "orch" },

      // Orchestrator → tools (4 tools, fan out from tool-t and tool-b handles)
      { id: "e3", source: "orch", target: "tool-tasks", label: "tool call", sourceHandle: "tool-t", targetHandle: "bottom" },
      { id: "e4", source: "orch", target: "tool-spawn", label: "tool call", sourceHandle: "tool-t", targetHandle: "bottom" },
      { id: "e5", source: "orch", target: "tool-query", label: "tool call", sourceHandle: "tool-b", targetHandle: "top" },
      { id: "e6", source: "orch", target: "tool-code", label: "tool call", sourceHandle: "tool-b", targetHandle: "top" },

      // spawn_agents → Agent Pool (dispatch)
      { id: "e7", source: "tool-spawn", target: "agents", label: "dispatch 0..N" },

      // Agent Pool → Orchestrator (loop-back / report)
      { id: "e8", source: "agents", target: "orch", label: "report", targetHandle: "loop-in" },

      // Deterministic exit
      { id: "e9", source: "orch", target: "s2", label: "done" },
      { id: "e10", source: "s2", target: "gate" },
      { id: "e11", source: "gate", target: "out-write", label: "≥ 92%" },
      { id: "e12", source: "gate", target: "out-review", label: "< 92%" },
      { id: "e13", source: "out-write", target: "out-notify" },
      { id: "e14", source: "out-review", target: "out-write", label: "Approved" },
    ],
  },
  // ── Customer Support Triage ──
  "agt-004": {
    nodes: [
      { id: "t1", type: "trigger", label: "Zendesk Webhook", x: 50, y: 250 },
      { id: "s1", type: "security", label: "Content Safety Check", x: 320, y: 250 },
      { id: "m1", type: "model", label: "GPT-5-mini: Classify & Route", x: 640, y: 250 },
      { id: "tl1", type: "tool", label: "Zendesk: Read Ticket", x: 640, y: 70 },
      { id: "tl2", type: "tool", label: "Knowledge Base Lookup", x: 640, y: 430 },
      { id: "s2", type: "security", label: "Response Safety Scan", x: 960, y: 250 },
      { id: "c1", type: "condition", label: "Priority Level?", x: 1250, y: 250 },
      { id: "a1", type: "action", label: "Update Zendesk Ticket", x: 1520, y: 140 },
      { id: "a2", type: "action", label: "Escalate via Slack", x: 1790, y: 140 },
      { id: "a3", type: "action", label: "Send Auto-Response", x: 1520, y: 370 },
      { id: "r1", type: "report", label: "Incident Report", x: 320, y: 560 },
      { id: "a4", type: "action", label: "Alert #security-incidents", x: 640, y: 560 },
    ],
    edges: [
      { id: "e1", source: "t1", target: "s1" },
      { id: "e2", source: "s1", target: "m1", label: "pass" },
      { id: "e3", source: "s1", target: "r1", label: "PII \u2192 KILL", sourceHandle: "kill" },
      { id: "e4", source: "m1", target: "tl1", label: "tool call", sourceHandle: "tool-t", targetHandle: "bottom" },
      { id: "e5", source: "m1", target: "tl2", label: "tool call", sourceHandle: "tool-b", targetHandle: "top" },
      { id: "e6", source: "m1", target: "s2" },
      { id: "e7", source: "s2", target: "c1" },
      { id: "e8", source: "c1", target: "a1", label: "P1/P2" },
      { id: "e9", source: "c1", target: "a3", label: "P3+" },
      { id: "e10", source: "a1", target: "a2" },
      { id: "e11", source: "r1", target: "a4" },
    ],
  },
  // ── Price Optimization ──
  "agt-005": {
    nodes: [
      { id: "t1", type: "trigger", label: "Schedule / Manual", x: 50, y: 250 },
      { id: "s1", type: "security", label: "Permission Check", x: 300, y: 250 },
      { id: "m1", type: "model", label: "GPT-5.2: Optimize Prices", x: 620, y: 250 },
      { id: "t2", type: "tool", label: "Fetch Current Prices", x: 620, y: 70 },
      { id: "t3", type: "tool", label: "Fetch Competitor Prices", x: 620, y: 430 },
      { id: "s2", type: "security", label: "Price Change Audit", x: 940, y: 250 },
      { id: "c1", type: "condition", label: "Floor Hit?", x: 1230, y: 250 },
      { id: "a1", type: "action", label: "Apply Price Changes", x: 1500, y: 140 },
      { id: "h1", type: "human", label: "Manager Review", x: 1500, y: 370 },
    ],
    edges: [
      { id: "e1", source: "t1", target: "s1" },
      { id: "e2", source: "s1", target: "m1" },
      { id: "e3", source: "m1", target: "t2", label: "tool call", sourceHandle: "tool-t", targetHandle: "bottom" },
      { id: "e4", source: "m1", target: "t3", label: "tool call", sourceHandle: "tool-b", targetHandle: "top" },
      { id: "e5", source: "m1", target: "s2" },
      { id: "e6", source: "s2", target: "c1" },
      { id: "e7", source: "c1", target: "a1", label: "Clear" },
      { id: "e8", source: "c1", target: "h1", label: "Flagged" },
      { id: "e9", source: "h1", target: "a1", label: "Approved" },
    ],
  },
};

export const dashboardMetrics = {
  totalRunsThisMonth: 1_247,
  successRate: 97.8,
  avgDuration: 2180,
  costToday: 328.47,
  activeAgents: 3,
  totalAgents: 5,
  tokensToday: {
    input: 842_000,
    output: 391_000,
    total: 1_233_000,
  },
  monthlyUsage: {
    used: 80_400_000,
    allocated: 280_000_000,
    remaining: 199_600_000,
    periodLabel: "Feb 2026",
  },
  dailyUsagePercent: 62,
  usageByAgent: [
    { agent: "Market Intelligence", tokens: 412_000, percentage: 28.0 },
    { agent: "Inventory Intelligence", tokens: 348_000, percentage: 23.7 },
    { agent: "Customer Support Triage", tokens: 267_000, percentage: 18.2 },
    { agent: "Demand Forecasting", tokens: 384_000, percentage: 26.1 },
    { agent: "Price Optimization", tokens: 58_000, percentage: 4.0 },
  ],
};

export const recentActivity: ActivityItem[] = [
  { id: "act-0", type: "alert", message: "Customer Support Triage AUTO-KILLED \u2014 PII detected in ticket input", timestamp: "2026-02-13T14:32:00Z", agentName: "Customer Support Triage", status: "error" },
  { id: "act-1", type: "agent_run", message: "Customer Support Triage completed successfully", timestamp: "2026-02-13T14:28:00Z", agentName: "Customer Support Triage", status: "success" },
  { id: "act-2", type: "agent_run", message: "Inventory Intelligence sync completed", timestamp: "2026-02-13T14:20:00Z", agentName: "Inventory Intelligence", status: "success" },
  { id: "act-3", type: "agent_run", message: "Market Intelligence analysis complete", timestamp: "2026-02-13T14:15:00Z", agentName: "Market Intelligence", status: "success" },
  { id: "act-4", type: "alert", message: "Market Intelligence encountered API rate limit", timestamp: "2026-02-13T13:15:00Z", agentName: "Market Intelligence", status: "error" },
  { id: "act-5", type: "pipeline_run", message: "Market Data ETL pipeline completed", timestamp: "2026-02-13T13:00:00Z", status: "success" },
  { id: "act-6", type: "config_change", message: "Price Optimization agent paused by admin", timestamp: "2026-02-13T10:45:00Z", agentName: "Price Optimization", status: "warning" },
  { id: "act-7", type: "deployment", message: "Demand Forecasting v1.3.0 published", timestamp: "2026-02-13T09:00:00Z", agentName: "Demand Forecasting", status: "info" },
];

export const apiCallsTimeSeries: ApiCallsPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  success: Math.floor(40 + Math.random() * 60 + (i >= 8 && i <= 18 ? 40 : 0)),
  clientError: i === 14 ? 12 : i === 15 ? 8 : i === 13 ? 4 : [3, 6, 9, 17, 21].includes(i) ? 1 + Math.floor(Math.random() * 2) : 0,
  serverError: i === 14 ? 14 : i === 13 ? 6 : i === 15 ? 3 : [5, 11, 20].includes(i) ? 1 : 0,
}));

export const tokenUsageTimeSeries: TimeSeriesPoint[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date("2026-02-07");
  date.setDate(date.getDate() + i);
  return {
    time: date.toLocaleDateString("en-US", { weekday: "short" }),
    value: Math.floor(80000 + Math.random() * 40000),
    value2: Math.floor(20000 + Math.random() * 15000),
  };
});

export const durationTimeSeries: TimeSeriesPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  value: Math.floor(1500 + Math.random() * 1000 + (i >= 8 && i <= 18 ? 500 : 0)),
  value2: Math.floor(3000 + Math.random() * 2000 + (i >= 8 && i <= 18 ? 1500 : 0)),
}));

export const costTimeSeries: TimeSeriesPoint[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date("2026-02-07");
  date.setDate(date.getDate() + i);
  return {
    time: date.toLocaleDateString("en-US", { weekday: "short" }),
    value: Math.floor(1200 + Math.random() * 800) / 100,
  };
});

const agentCostPerRun: Record<string, number> = {
  "agt-001": 54.25,
  "agt-002": 33.05,
  "agt-003": 131.69,
  "agt-004": 27.59,
  "agt-005": 78.10,
};

export const agentObservabilityMetrics = agents.map((a) => {
  const totalTokens = Math.floor(a.totalRuns * 4200);
  const tokensIn = Math.floor(totalTokens * 0.65);
  const tokensOut = totalTokens - tokensIn;
  return {
    agentId: a.id,
    name: a.name,
    totalCalls: Math.floor(a.totalRuns * 3.2),
    errorRate: (100 - a.successRate).toFixed(1),
    avgDuration: a.avgDuration,
    tokensIn,
    tokensOut,
    tokensUsed: totalTokens,
    cost: Math.floor(a.totalRuns * (agentCostPerRun[a.id] ?? 1) * 100) / 100,
  };
});

export const billingPlan = {
  name: "Enterprise",
  annualCost: 100_000,
  monthlyCost: 10_000,
  apiMultiplier: 15,
  monthlyAllowance: 10_000,
  periodLabel: "Feb 2026",
  renewalDate: "2026-03-01",
};

export const auditTrail: AuditEntry[] = [
  { id: "aud-1", timestamp: "2026-02-13T14:28:00Z", agent: "Customer Support Triage", action: "classify_ticket", status: "success", details: "Ticket #4821 classified as P2, routed to Engineering", duration: 890 },
  { id: "aud-2", timestamp: "2026-02-13T14:20:00Z", agent: "Inventory Intelligence", action: "sync_inventory", status: "success", details: "Synced 1,247 SKUs across 3 warehouses", duration: 1750 },
  { id: "aud-3", timestamp: "2026-02-13T14:15:00Z", agent: "Market Intelligence", action: "analyze_market", status: "success", details: "Processed 342 competitor price points, 2 arbitrage opportunities found", duration: 2340 },
  { id: "aud-4", timestamp: "2026-02-13T13:15:00Z", agent: "Market Intelligence", action: "fetch_data", status: "error", details: "Amazon SP-API rate limit exceeded (429). Retry in 60s.", duration: 4500 },
  { id: "aud-5", timestamp: "2026-02-13T12:00:00Z", agent: "Demand Forecasting", action: "generate_forecast", status: "success", details: "7-day forecast generated for 89 product categories", duration: 3_900_000 },
  { id: "aud-6", timestamp: "2026-02-13T10:30:00Z", agent: "Price Optimization", action: "optimize_prices", status: "warning", details: "Optimization complete, 3 products hit minimum price floor", duration: 3100 },
  { id: "aud-7", timestamp: "2026-02-12T22:00:00Z", agent: "Inventory Intelligence", action: "sync_inventory", status: "success", details: "Nightly full sync completed — 4,891 SKUs processed", duration: 12400 },
  { id: "aud-8", timestamp: "2026-02-12T18:00:00Z", agent: "Market Intelligence", action: "analyze_market", status: "success", details: "End-of-day market summary generated", duration: 3800 },
];

export const pluginMarketplaces: PluginMarketplace[] = [
  {
    id: "marketplace-kraken",
    name: "Kraken Verified",
    source: "kraken",
    url: "https://plugins.kraken-ai.com",
    description: "Official connectors maintained and verified by the Kraken AI team",
    pluginCount: 42,
    installedCount: 10,
    connected: true,
    version: "3.1.0",
  },
  {
    id: "marketplace-internal",
    name: "acme-internal",
    source: "custom",
    url: "https://github.com/acme-electronics/kraken-connectors",
    description: "Private connectors for Acme Electronics internal systems",
    pluginCount: 4,
    installedCount: 2,
    connected: true,
    version: "0.5.1",
  },
  {
    id: "marketplace-community-ecom",
    name: "ecom-toolkit",
    source: "community",
    url: "https://github.com/ecom-community/kraken-toolkit",
    description: "Community-maintained e-commerce integrations and analytics tools",
    pluginCount: 18,
    installedCount: 3,
    connected: true,
    version: "1.2.4",
    updateAvailable: "1.3.0",
  },
];

export const integrations: Integration[] = [
  // ─── Data Sources: Subscribed ───
  { id: "int-01", name: "Amazon SP-API", category: "data-source", type: "Marketplace", status: "connected", lastSync: "2026-02-13T14:15:00Z", description: "Product listings, pricing, and order data from Amazon Seller Central", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/amazon-sp", transport: "http", version: "2.1.0", config: [
    { label: "Seller ID", value: "A3FHKL9EXAMPLE", type: "text" },
    { label: "LWA Client ID", value: "amzn1.application-oa2-client.****", type: "secret" },
    { label: "LWA Client Secret", value: "****", type: "secret" },
    { label: "Refresh Token", value: "Atzr|****", type: "secret" },
    { label: "Region", value: "North America", type: "select" },
    { label: "Sync Interval", value: "15 min", type: "select" },
    { label: "Include FBA Data", value: "true", type: "toggle" },
  ] },
  { id: "int-02", name: "Shopify", category: "data-source", type: "E-commerce", status: "connected", lastSync: "2026-02-13T14:20:00Z", description: "Storefront inventory, orders, and customer data", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/shopify", transport: "http", version: "1.8.2", config: [
    { label: "Store Domain", value: "acme-electronics.myshopify.com", type: "text" },
    { label: "API Access Token", value: "shpat_••••••••••••••••••••••••••••••••", type: "secret" },
    { label: "API Version", value: "2026-01", type: "select" },
    { label: "Sync Orders", value: "true", type: "toggle" },
    { label: "Sync Inventory", value: "true", type: "toggle" },
  ] },
  { id: "int-03", name: "PostgreSQL", category: "data-source", type: "Database", status: "connected", lastSync: "2026-02-13T14:00:00Z", description: "Internal product catalog and historical sales data", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/postgres", transport: "http", version: "1.5.0", config: [
    { label: "Host", value: "db-prod.internal.acme.com", type: "text" },
    { label: "Port", value: "5432", type: "text" },
    { label: "Database", value: "product_catalog", type: "text" },
    { label: "Username", value: "kraken_reader", type: "text" },
    { label: "Password", value: "****", type: "secret" },
    { label: "SSL Mode", value: "require", type: "select" },
  ] },
  { id: "int-04", name: "Snowflake", category: "data-source", type: "Data Warehouse", status: "connected", lastSync: "2026-02-13T12:00:00Z", description: "Enterprise data warehouse with aggregated analytics", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/snowflake", transport: "http", version: "1.2.0", config: [
    { label: "Account", value: "acme-analytics", type: "text" },
    { label: "Warehouse", value: "ANALYTICS_WH", type: "text" },
    { label: "Database", value: "PROD_DW", type: "text" },
    { label: "Schema", value: "PUBLIC", type: "text" },
    { label: "Auth Method", value: "Key Pair", type: "select" },
  ] },
  // ─── Data Sources: Standalone MCP ───
  { id: "int-mcp-03", name: "Oracle Autonomous Database", category: "data-source", type: "Database", status: "connected", lastSync: "2026-02-14T09:12:00Z", description: "Oracle Autonomous Database built-in MCP Server — schema discovery (LIST_SCHEMAS, LIST_OBJECTS, GET_OBJECT_DETAILS) and read-only SQL access (EXECUTE_SQL) to marketplace transactional and analytical data", subscribed: true, enabled: true, source: "custom", sourceDetail: "Direct MCP", mcpEndpoint: "https://dataaccess.adb.us-ashburn-1.oraclecloudapps.com/adb/mcp/v1/databases/ocid1.autonomousdatabase.oc1.iad.anuwcl…", transport: "http", version: "26ai", config: [
    { label: "Region", value: "us-ashburn-1", type: "select" },
    { label: "Database OCID", value: "ocid1.autonomousdatabase.oc1.iad.anuwcl…", type: "text" },
    { label: "Client ID", value: "ocid1.oauthclientid.oc1.iad.amaa…", type: "secret" },
    { label: "Client Secret", value: "****", type: "secret" },
    { label: "Default Schema", value: "MARKETPLACE", type: "select" },
    { label: "Read Only", value: "true", type: "toggle" },
  ] },
  // ─── Data Sources: Available ───
  { id: "int-05", name: "Oracle Delta Share", category: "data-source", type: "Delta Sharing", status: "disconnected", description: "Partner data feed via Delta Sharing protocol", subscribed: false, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.0.0" },
  { id: "int-05b", name: "Google BigQuery", category: "data-source", type: "Data Warehouse", status: "disconnected", description: "Serverless data warehouse with built-in ML and geospatial analysis", subscribed: false, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", version: "0.9.1" },

  // ─── Tools: Subscribed ───
  { id: "int-06", name: "Perplexity", category: "tool", type: "Search", status: "connected", description: "Real-time web search, deep research, and reasoning via Sonar models (perplexity_search, perplexity_ask, perplexity_research, perplexity_reason)", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpCommand: "npx -y @perplexity-ai/mcp-server", transport: "stdio", version: "1.3.0", config: [
    { label: "API Key", value: "pplx-****-****", type: "secret" },
    { label: "Timeout (ms)", value: "600000", type: "text" },
    { label: "Log Level", value: "ERROR", type: "select" },
  ] },
  { id: "int-08", name: "Python Runtime", category: "tool", type: "Compute", status: "connected", description: "Sandboxed Python execution for custom analysis", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/python", transport: "http", version: "3.12.1", config: [
    { label: "Python Version", value: "3.12", type: "select" },
    { label: "Memory Limit", value: "512 MB", type: "select" },
    { label: "Timeout", value: "30s", type: "text" },
    { label: "Network Access", value: "false", type: "toggle" },
  ] },
  { id: "int-09", name: "Calculator", category: "tool", type: "Utility", status: "connected", description: "Mathematical operations and statistical functions", subscribed: true, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/calculator", transport: "http", version: "1.0.0", config: [
    { label: "Precision", value: "15 digits", type: "select" },
  ] },
  // ─── Tools: Available ───
  { id: "int-09b", name: "Firecrawl", category: "tool", type: "Scraping", status: "disconnected", description: "Web Data API for AI — turn websites into LLM-ready markdown or structured data (scrape, crawl, search, map)", subscribed: false, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", version: "3.7.4" },
  // ─── Tools: Standalone MCP ───
  { id: "int-mcp-01", name: "Oracle Database", category: "tool", type: "Database", status: "connected", lastSync: "2026-02-14T09:12:00Z", description: "OCI Database Tools MCP Server — execute SQL scripts, list autonomous databases, manage database connections, and query table metadata via OCI Database Tools service", subscribed: true, enabled: true, source: "custom", sourceDetail: "Direct MCP", mcpCommand: "uvx oracle.dbtools-mcp-server@latest", transport: "stdio", version: "0.1.0", config: [
    { label: "OCI Config Profile", value: "DEFAULT", type: "select" },
    { label: "Compartment OCID", value: "ocid1.compartment.oc1..aaaaaa…", type: "text" },
    { label: "DB Connection Name", value: "prod-marketplace-adb", type: "text" },
    { label: "Region", value: "us-ashburn-1", type: "select" },
    { label: "Log Level", value: "ERROR", type: "select" },
  ] },
  { id: "int-mcp-02", name: "Playwright", category: "tool", type: "Browser Automation", status: "connected", lastSync: "2026-02-14T11:45:00Z", description: "Microsoft Playwright MCP Server — browser automation for competitor monitoring, scraping, and UI testing", subscribed: true, enabled: true, source: "custom", sourceDetail: "Direct MCP", mcpCommand: "npx @playwright/mcp@latest", transport: "stdio", version: "0.0.64", config: [
    { label: "Headless", value: "true", type: "toggle" },
    { label: "Browser", value: "Chromium", type: "select" },
    { label: "Viewport", value: "1280x720", type: "text" },
    { label: "Navigation Timeout", value: "60000", type: "text" },
  ] },

  // ─── Actions: Subscribed ───
  { id: "int-10", name: "Email (SMTP)", category: "action", type: "Notification", status: "connected", description: "Send emails via configured SMTP server", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/smtp", transport: "http", version: "1.1.0", config: [
    { label: "SMTP Host", value: "smtp.acme-electronics.com", type: "text" },
    { label: "Port", value: "587", type: "text" },
    { label: "From Address", value: "kraken@acme-electronics.com", type: "text" },
    { label: "Auth Password", value: "****", type: "secret" },
    { label: "TLS", value: "true", type: "toggle" },
  ] },
  { id: "int-11", name: "Slack", category: "action", type: "Notification", status: "connected", lastSync: "2026-02-13T14:15:00Z", description: "Post messages and alerts to Slack channels", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/slack", transport: "http", version: "2.0.1", config: [
    { label: "Workspace", value: "acme-electronics", type: "text" },
    { label: "Bot Token", value: "xoxb-****-****-****", type: "secret" },
    { label: "Default Channel", value: "#kraken-alerts", type: "text" },
    { label: "Thread Replies", value: "true", type: "toggle" },
  ] },
  { id: "int-12", name: "Inventory Update API", category: "action", type: "System", status: "connected", description: "Push inventory adjustments to warehouse management system", subscribed: true, enabled: true, source: "custom", sourceDetail: "internal/wms-bridge", marketplaceId: "marketplace-internal", mcpEndpoint: "https://wms.internal.acme.com/mcp", transport: "http", version: "0.3.0", config: [
    { label: "API Base URL", value: "https://wms.internal.acme.com/api/v2", type: "text" },
    { label: "API Key", value: "wms-****-****", type: "secret" },
    { label: "Batch Size", value: "100", type: "text" },
    { label: "Dry Run", value: "false", type: "toggle" },
  ] },
  { id: "int-13", name: "Price Adjustment API", category: "action", type: "System", status: "connected", description: "Update product pricing across connected marketplaces", subscribed: true, enabled: false, source: "custom", sourceDetail: "internal/pricing-sync", marketplaceId: "marketplace-internal", mcpEndpoint: "https://pricing.internal.acme.com/mcp", transport: "http", version: "0.2.1", config: [
    { label: "API Endpoint", value: "https://pricing.internal.acme.com/sync", type: "text" },
    { label: "Auth Token", value: "price-****-****", type: "secret" },
    { label: "Max Price Delta", value: "15%", type: "text" },
    { label: "Require Approval", value: "true", type: "toggle" },
  ] },
  { id: "int-13b", name: "Zendesk", category: "action", type: "Ticketing", status: "connected", lastSync: "2026-02-13T14:28:00Z", description: "Ticket management, classification, and routing via Zendesk Support API", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", mcpEndpoint: "https://connectors.kraken-ai.com/mcp/zendesk", transport: "http", version: "1.6.0", config: [
    { label: "Subdomain", value: "acme-electronics", type: "text" },
    { label: "Email", value: "[email protected]", type: "text" },
    { label: "API Token", value: "••••••••••••••••••••••••••••••••••••", type: "secret" },
    { label: "Webhook Secret", value: "••••••••••••••••••••••==", type: "secret" },
    { label: "Auto-Assign", value: "true", type: "toggle" },
  ] },
  // ─── Actions: Available ───
  { id: "int-14", name: "Webhook Dispatcher", category: "action", type: "Integration", status: "disconnected", description: "Dispatch webhooks to external systems on trigger events", subscribed: false, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.4.0" },
  { id: "int-14b", name: "Microsoft Teams", category: "action", type: "Notification", status: "disconnected", description: "Post alerts and reports to Microsoft Teams channels", subscribed: false, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", version: "0.7.0" },
  // ─── Community: ecom-toolkit ───
  { id: "int-com-01", name: "eBay Listings", category: "data-source", type: "Marketplace", status: "connected", lastSync: "2026-02-13T13:50:00Z", description: "Listing data, sales history, and seller metrics from eBay", subscribed: true, enabled: true, source: "community", marketplaceId: "marketplace-community-ecom", mcpEndpoint: "https://ecom-toolkit.dev/mcp/ebay", transport: "http", version: "0.8.3" },
  { id: "int-com-02", name: "Margin Calculator", category: "tool", type: "Analytics", status: "connected", description: "Profit margin analysis across channels with fee breakdowns", subscribed: true, enabled: true, source: "community", marketplaceId: "marketplace-community-ecom", mcpEndpoint: "https://ecom-toolkit.dev/mcp/margin-calc", transport: "http", version: "1.0.1" },
  { id: "int-com-03", name: "Review Aggregator", category: "tool", type: "Analytics", status: "connected", description: "Aggregate and analyze product reviews across marketplaces", subscribed: true, enabled: true, source: "community", marketplaceId: "marketplace-community-ecom", mcpEndpoint: "https://ecom-toolkit.dev/mcp/reviews", transport: "http", version: "0.6.0" },
  // ─── Skills: Installed ───
  { id: "int-sk1", name: "Competitor Deep Dive", category: "skill", type: "Analysis", status: "connected", description: "Multi-source competitor analysis with pricing matrix, trend identification, and market positioning insights", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "2.0.1", githubUrl: "https://github.com/kraken-ai/skills/tree/main/competitor-deep-dive", skillFilePath: "skills/competitor-deep-dive/SKILL.md", skillContent: `# Competitor Deep Dive

This skill performs comprehensive competitor analysis. When activated, follow these instructions exactly.

## Gathering Intelligence

Start by identifying the target company and resolving its direct competitors. If no competitors are specified, detect them automatically using the connected data sources. Pull data from all available integrations — prioritize web search results, pricing pages, review aggregators, and job board postings. For public companies, also pull SEC filings and earnings transcripts when available.

Never fabricate data points. If a source is unavailable or returns incomplete data, note the gap explicitly in the output rather than guessing.

## Building the Pricing Matrix

Collect current pricing across all product tiers for the target and each competitor. Normalize pricing to a common unit (monthly per-seat, annual flat, usage-based) so tiers are directly comparable. Flag any recent price changes detected in the lookback window and include the delta.

When pricing is not publicly listed, mark the tier as \`undisclosed\` and note whether a "Contact Sales" gate was observed.

## Trend Analysis

Compare the current data snapshot against historical baselines from the lookback period. Compute directional trends for: market share estimates, pricing movement, product feature velocity (based on changelog or release notes), and hiring signals from job postings.

Present trends as directional indicators (\`rising\`, \`stable\`, \`declining\`) with supporting evidence, not raw numbers alone.

## SWOT and Positioning

Run a SWOT analysis for the target company relative to the competitive set. Keep each quadrant to 3-5 bullet points maximum — be specific, not generic. Generate a positioning summary that identifies the target's primary differentiator and most vulnerable flank.

## Output Format

Structure the final output as:
- **Executive Summary** — 2-3 sentence overview of the competitive landscape
- **Pricing Matrix** — Normalized comparison table
- **Trend Signals** — Directional indicators with evidence
- **SWOT Analysis** — Four-quadrant breakdown
- **Recommendations** — 3-5 actionable next steps ranked by impact

Always include a \`confidence_score\` (0.0-1.0) and \`sources_used\` count in the metadata. If confidence falls below 0.5, prepend a warning to the executive summary.
` },
  { id: "int-sk2", name: "Report Builder", category: "skill", type: "Output", status: "connected", description: "Generate formatted business intelligence reports from agent run data with charts, summaries, and recommendations", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.8.0" },
  { id: "int-sk3", name: "Response Drafter", category: "skill", type: "Communication", status: "connected", description: "Context-aware customer response generation with tone matching, knowledge base grounding, and brand voice consistency", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.5.2" },
  { id: "int-sk4", name: "Price Validator", category: "skill", type: "Compliance", status: "connected", description: "Validate proposed price changes against business rules, margin thresholds, MAP policies, and competitive floor limits", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.3.0" },
  { id: "int-sk5", name: "Inventory Reconciler", category: "skill", type: "Automation", status: "connected", description: "Cross-channel inventory reconciliation with automatic discrepancy detection and corrective action generation", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.6.0" },
  { id: "int-sk6", name: "Ticket Summarizer", category: "skill", type: "Communication", status: "connected", description: "Extract priority signals, product category, customer sentiment, and key details from support tickets for fast routing", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "0.9.3" },
  { id: "int-sk7", name: "Bulk Updater", category: "skill", type: "Automation", status: "connected", description: "Batch operations for inventory adjustments and pricing updates across thousands of SKUs with rollback support", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.2.0" },
  { id: "int-sk8", name: "Compliance Auditor", category: "skill", type: "Compliance", status: "connected", description: "Generate audit trails, compliance documentation, and regulatory reports for agent operations", subscribed: true, enabled: true, source: "kraken", marketplaceId: "marketplace-kraken", version: "1.1.0" },
  // ─── Skills: Available ───
  { id: "int-sk12", name: "Safety Scanner", category: "skill", type: "Compliance", status: "disconnected", description: "Content safety, PII detection, prompt injection defense, and policy compliance checking for agent I/O", subscribed: false, enabled: false, source: "kraken", marketplaceId: "marketplace-kraken", version: "2.1.0" },
];

export const computeClusters: ComputeCluster[] = [
  {
    id: "cluster-general",
    name: "General Purpose",
    type: "general-purpose",
    vcpus: 8,
    memoryGb: 32,
    gpus: 0,
    maxConcurrentPipelines: 6,
    status: "healthy",
    utilization: 42,
  },
  {
    id: "cluster-cpu",
    name: "CPU Optimized",
    type: "cpu-optimized",
    vcpus: 32,
    memoryGb: 64,
    gpus: 0,
    maxConcurrentPipelines: 12,
    status: "healthy",
    utilization: 68,
  },
  {
    id: "cluster-gpu",
    name: "GPU Accelerated",
    type: "gpu-accelerated",
    vcpus: 16,
    memoryGb: 128,
    gpus: 4,
    gpuModel: "NVIDIA A100",
    maxConcurrentPipelines: 4,
    status: "degraded",
    utilization: 91,
  },
];

export const pipelines: Pipeline[] = [
  {
    id: "pip-001",
    name: "Market Data ETL",
    description: "Ingests marketplace pricing data from Amazon, Shopify, and competitor feeds. Normalizes and deduplicates across sources.",
    schedule: "Every 1h",
    status: "active",
    lastRun: "2026-02-13T13:00:00Z",
    nextRun: "2026-02-13T14:00:00Z",
    avgDuration: 180000,
    outputFormat: "Parquet",
    code: `import pyarrow as pa
import pyarrow.parquet as pq
from kraken_sdk import DataSource, Pipeline, Output
from datetime import datetime, timedelta

pipeline = Pipeline("market-data-etl")

@pipeline.transform
def extract_and_normalize(ctx):
    """Fetch pricing data from all marketplace sources and normalize."""
    amazon = ctx.source("amazon-sp-api")
    shopify = ctx.source("shopify")

    # Pull last hour of pricing updates
    cutoff = datetime.utcnow() - timedelta(hours=1)

    amazon_prices = amazon.query(
        "SELECT asin, price, currency, marketplace, updated_at "
        "FROM pricing WHERE updated_at > :cutoff",
        params={"cutoff": cutoff},
    )

    shopify_prices = shopify.query(
        "SELECT product_id, variant_id, price, compare_at_price "
        "FROM product_variants WHERE updated_at > :cutoff",
        params={"cutoff": cutoff},
    )

    # Normalize to common schema
    normalized = []
    for row in amazon_prices:
        normalized.append({
            "source": "amazon",
            "product_id": row["asin"],
            "price_usd": convert_currency(row["price"], row["currency"]),
            "marketplace": row["marketplace"],
            "timestamp": row["updated_at"],
        })

    for row in shopify_prices:
        normalized.append({
            "source": "shopify",
            "product_id": row["product_id"],
            "price_usd": float(row["price"]),
            "marketplace": "shopify-direct",
            "timestamp": cutoff.isoformat(),
        })

    return normalized


@pipeline.transform
def deduplicate(ctx, records):
    """Remove duplicate entries, keeping the most recent per product."""
    seen = {}
    for record in records:
        key = (record["source"], record["product_id"])
        if key not in seen or record["timestamp"] > seen[key]["timestamp"]:
            seen[key] = record

    ctx.log(f"Deduplicated {len(records)} -> {len(seen)} records")
    return list(seen.values())


@pipeline.output
def write_parquet(ctx, records):
    """Write normalized pricing data to Parquet."""
    table = pa.Table.from_pylist(records)
    output_path = ctx.storage.path("market-data", partition_by="date")

    pq.write_table(table, output_path, compression="snappy")
    ctx.log(f"Wrote {len(records)} records to {output_path}")

    return Output(
        records_written=len(records),
        path=output_path,
        schema=table.schema,
    )


def convert_currency(amount, currency, target="USD"):
    rates = {"USD": 1.0, "EUR": 1.08, "GBP": 1.27, "CAD": 0.74}
    return round(float(amount) * rates.get(currency, 1.0), 2)
`,
    recentRuns: [
      { id: "pr-001", status: "success", startedAt: "2026-02-13T13:00:00Z", duration: 178000, recordsProcessed: 342 },
      { id: "pr-002", status: "success", startedAt: "2026-02-13T12:00:00Z", duration: 182000, recordsProcessed: 318 },
      { id: "pr-003", status: "success", startedAt: "2026-02-13T11:00:00Z", duration: 175000, recordsProcessed: 356 },
      { id: "pr-004", status: "error", startedAt: "2026-02-13T10:00:00Z", duration: 42000, recordsProcessed: 0 },
      { id: "pr-005", status: "success", startedAt: "2026-02-13T09:00:00Z", duration: 190000, recordsProcessed: 291 },
    ],
  },
  {
    id: "pip-002",
    name: "Inventory Sync",
    description: "Synchronizes inventory levels across all warehouse locations and sales channels. Resolves conflicts using last-write-wins.",
    schedule: "Every 30m",
    status: "active",
    lastRun: "2026-02-13T14:00:00Z",
    nextRun: "2026-02-13T14:30:00Z",
    avgDuration: 45000,
    outputFormat: "Parquet",
    code: `from kraken_sdk import Pipeline, DataSource, Output
import pyarrow as pa
import pyarrow.parquet as pq
from collections import defaultdict

pipeline = Pipeline("inventory-sync")

WAREHOUSES = ["us-east-1", "us-west-2", "eu-central-1"]


@pipeline.transform
def pull_inventory(ctx):
    """Pull current inventory from all warehouse systems."""
    db = ctx.source("postgres")
    shopify = ctx.source("shopify")

    warehouse_data = db.query(
        "SELECT sku, warehouse_id, quantity, reserved, "
        "       last_updated "
        "FROM inventory "
        "WHERE last_updated > NOW() - INTERVAL '30 minutes'"
    )

    channel_data = shopify.query(
        "SELECT sku, available_quantity, committed_quantity "
        "FROM inventory_levels "
        "WHERE updated_at > :cutoff",
        params={"cutoff": ctx.last_run},
    )

    return {
        "warehouses": warehouse_data,
        "channels": channel_data,
    }


@pipeline.transform
def reconcile(ctx, data):
    """Reconcile inventory across warehouses using last-write-wins."""
    inventory = defaultdict(lambda: {
        "total_quantity": 0,
        "total_reserved": 0,
        "locations": [],
    })

    for row in data["warehouses"]:
        sku = row["sku"]
        inventory[sku]["total_quantity"] += row["quantity"]
        inventory[sku]["total_reserved"] += row["reserved"]
        inventory[sku]["locations"].append({
            "warehouse": row["warehouse_id"],
            "quantity": row["quantity"],
            "reserved": row["reserved"],
        })

    # Flag conflicts where channel != sum(warehouses)
    conflicts = []
    for row in data["channels"]:
        sku = row["sku"]
        if sku in inventory:
            expected = inventory[sku]["total_quantity"]
            actual = row["available_quantity"]
            if abs(expected - actual) > 0:
                conflicts.append({
                    "sku": sku,
                    "warehouse_total": expected,
                    "channel_total": actual,
                    "delta": expected - actual,
                })

    if conflicts:
        ctx.log(f"Resolved {len(conflicts)} inventory conflicts")

    return {
        "inventory": dict(inventory),
        "conflicts_resolved": len(conflicts),
    }


@pipeline.output
def write_output(ctx, result):
    """Write reconciled inventory snapshot."""
    records = []
    for sku, data in result["inventory"].items():
        records.append({
            "sku": sku,
            "available": data["total_quantity"] - data["total_reserved"],
            "reserved": data["total_reserved"],
            "total": data["total_quantity"],
            "location_count": len(data["locations"]),
        })

    table = pa.Table.from_pylist(records)
    path = ctx.storage.path("inventory", partition_by="snapshot_time")
    pq.write_table(table, path, compression="snappy")

    return Output(records_written=len(records), path=path)
`,
    recentRuns: [
      { id: "pr-010", status: "success", startedAt: "2026-02-13T14:00:00Z", duration: 44000, recordsProcessed: 1247 },
      { id: "pr-011", status: "success", startedAt: "2026-02-13T13:30:00Z", duration: 46000, recordsProcessed: 1243 },
      { id: "pr-012", status: "success", startedAt: "2026-02-13T13:00:00Z", duration: 43000, recordsProcessed: 1251 },
      { id: "pr-013", status: "success", startedAt: "2026-02-13T12:30:00Z", duration: 47000, recordsProcessed: 1239 },
    ],
  },
  {
    id: "pip-003",
    name: "Sales Aggregation",
    description: "Aggregates daily sales data across all channels for demand forecasting input. Computes rolling averages and seasonality indices.",
    schedule: "Daily 06:00 UTC",
    status: "active",
    lastRun: "2026-02-13T06:00:00Z",
    nextRun: "2026-02-14T06:00:00Z",
    avgDuration: 320000,
    outputFormat: "Parquet",
    code: `import pyarrow as pa
import pyarrow.parquet as pq
import numpy as np
from kraken_sdk import Pipeline, Output
from datetime import datetime, timedelta

pipeline = Pipeline("sales-aggregation")

ROLLING_WINDOW = 28  # days
SEASONALITY_PERIOD = 7  # weekly


@pipeline.transform
def aggregate_sales(ctx):
    """Pull and aggregate sales from all channels."""
    db = ctx.source("postgres")
    snowflake = ctx.source("snowflake")

    # Yesterday's sales from transactional DB
    daily_sales = db.query(
        "SELECT product_category, channel, "
        "       SUM(quantity) as units_sold, "
        "       SUM(revenue) as revenue, "
        "       COUNT(DISTINCT order_id) as order_count "
        "FROM orders "
        "WHERE DATE(created_at) = CURRENT_DATE - 1 "
        "GROUP BY product_category, channel"
    )

    # Historical data for rolling averages
    historical = snowflake.query(
        "SELECT product_category, date, "
        "       total_units, total_revenue "
        "FROM daily_sales_summary "
        f"WHERE date >= DATEADD(day, -{ROLLING_WINDOW}, CURRENT_DATE) "
        "ORDER BY product_category, date"
    )

    return {"daily": daily_sales, "historical": historical}


@pipeline.transform
def compute_metrics(ctx, data):
    """Compute rolling averages and seasonality indices."""
    categories = {}

    for row in data["daily"]:
        cat = row["product_category"]
        if cat not in categories:
            categories[cat] = {
                "units_sold": 0,
                "revenue": 0.0,
                "order_count": 0,
                "channels": [],
            }
        categories[cat]["units_sold"] += row["units_sold"]
        categories[cat]["revenue"] += row["revenue"]
        categories[cat]["order_count"] += row["order_count"]
        categories[cat]["channels"].append(row["channel"])

    # Compute rolling averages from historical data
    hist_by_cat = {}
    for row in data["historical"]:
        cat = row["product_category"]
        if cat not in hist_by_cat:
            hist_by_cat[cat] = []
        hist_by_cat[cat].append(row["total_units"])

    for cat, daily_units in hist_by_cat.items():
        if cat in categories:
            arr = np.array(daily_units, dtype=float)
            categories[cat]["rolling_avg"] = round(np.mean(arr), 1)
            categories[cat]["rolling_std"] = round(np.std(arr), 1)

            # Weekly seasonality index
            if len(arr) >= SEASONALITY_PERIOD:
                weekly = arr[-SEASONALITY_PERIOD:]
                avg = np.mean(weekly)
                categories[cat]["seasonality_idx"] = round(
                    weekly[-1] / avg if avg > 0 else 1.0, 3
                )

    ctx.log(f"Computed metrics for {len(categories)} categories")
    return categories


@pipeline.output
def write_output(ctx, categories):
    """Write aggregated sales data to Parquet."""
    records = [
        {
            "category": cat,
            "date": datetime.utcnow().date().isoformat(),
            **{k: v for k, v in metrics.items() if k != "channels"},
        }
        for cat, metrics in categories.items()
    ]

    table = pa.Table.from_pylist(records)
    path = ctx.storage.path("sales-agg", partition_by="date")
    pq.write_table(table, path, compression="snappy")

    return Output(records_written=len(records), path=path)
`,
    recentRuns: [
      { id: "pr-020", status: "success", startedAt: "2026-02-13T06:00:00Z", duration: 318000, recordsProcessed: 89 },
      { id: "pr-021", status: "success", startedAt: "2026-02-12T06:00:00Z", duration: 325000, recordsProcessed: 89 },
      { id: "pr-022", status: "success", startedAt: "2026-02-11T06:00:00Z", duration: 312000, recordsProcessed: 87 },
    ],
  },
  {
    id: "pip-004",
    name: "Customer Feedback Ingest",
    description: "Pulls customer reviews and support tickets, extracts sentiment scores and product mentions for agent consumption.",
    schedule: "Every 4h",
    status: "paused",
    lastRun: "2026-02-12T18:00:00Z",
    nextRun: "-",
    avgDuration: 95000,
    outputFormat: "Parquet",
    code: `import pyarrow as pa
import pyarrow.parquet as pq
from kraken_sdk import Pipeline, Output
from kraken_sdk.nlp import sentiment_score, extract_entities

pipeline = Pipeline("customer-feedback-ingest")

BATCH_SIZE = 100


@pipeline.transform
def fetch_feedback(ctx):
    """Pull reviews and tickets from all sources."""
    amazon = ctx.source("amazon-sp-api")
    db = ctx.source("postgres")

    reviews = amazon.query(
        "SELECT review_id, asin, rating, title, body, "
        "       reviewer_name, review_date "
        "FROM product_reviews "
        "WHERE review_date > :cutoff "
        "ORDER BY review_date DESC",
        params={"cutoff": ctx.last_run},
    )

    tickets = db.query(
        "SELECT ticket_id, subject, description, "
        "       priority, created_at, product_sku "
        "FROM support_tickets "
        "WHERE created_at > :cutoff "
        "AND status != 'spam'",
        params={"cutoff": ctx.last_run},
    )

    ctx.log(f"Fetched {len(reviews)} reviews, {len(tickets)} tickets")
    return {"reviews": reviews, "tickets": tickets}


@pipeline.transform
def analyze_sentiment(ctx, data):
    """Extract sentiment and product mentions from text."""
    results = []

    for review in data["reviews"]:
        text = f"{review['title']} {review['body']}"
        results.append({
            "source": "review",
            "source_id": review["review_id"],
            "product_id": review["asin"],
            "text": text[:500],
            "sentiment": sentiment_score(text),
            "rating": review["rating"],
            "entities": extract_entities(text),
            "timestamp": review["review_date"],
        })

    for ticket in data["tickets"]:
        text = f"{ticket['subject']} {ticket['description']}"
        results.append({
            "source": "support_ticket",
            "source_id": ticket["ticket_id"],
            "product_id": ticket.get("product_sku"),
            "text": text[:500],
            "sentiment": sentiment_score(text),
            "rating": None,
            "entities": extract_entities(text),
            "timestamp": ticket["created_at"],
        })

    # Aggregate sentiment by product
    product_sentiment = {}
    for r in results:
        pid = r["product_id"]
        if pid:
            if pid not in product_sentiment:
                product_sentiment[pid] = []
            product_sentiment[pid].append(r["sentiment"])

    for pid, scores in product_sentiment.items():
        avg = sum(scores) / len(scores)
        ctx.log(f"  {pid}: avg sentiment {avg:.2f} ({len(scores)} mentions)")

    return results


@pipeline.output
def write_output(ctx, results):
    """Write analyzed feedback to Parquet."""
    table = pa.Table.from_pylist(results)
    path = ctx.storage.path("customer-feedback", partition_by="date")
    pq.write_table(table, path, compression="snappy")

    return Output(records_written=len(results), path=path)
`,
    recentRuns: [
      { id: "pr-030", status: "success", startedAt: "2026-02-12T18:00:00Z", duration: 92000, recordsProcessed: 156 },
      { id: "pr-031", status: "success", startedAt: "2026-02-12T14:00:00Z", duration: 98000, recordsProcessed: 142 },
      { id: "pr-032", status: "error", startedAt: "2026-02-12T10:00:00Z", duration: 15000, recordsProcessed: 0 },
      { id: "pr-033", status: "success", startedAt: "2026-02-12T06:00:00Z", duration: 94000, recordsProcessed: 178 },
    ],
  },
];

export const modelProviders: ModelProvider[] = [
  { id: "mp-001", name: "OpenAI", status: "active", models: ["GPT-5.2", "GPT-5-mini", "o4-mini"], keyConfigured: true, totalRequests: 28400, totalTokens: 142_000_000, totalCost: 892.50 },
  { id: "mp-002", name: "Anthropic", status: "active", models: ["Claude Opus 4.6", "Claude Sonnet 4.5", "Claude Haiku 4.5"], keyConfigured: true, totalRequests: 12100, totalTokens: 68_000_000, totalCost: 524.30 },
  { id: "mp-003", name: "Meta (via LiteLLM)", status: "active", models: ["Llama 4 Maverick", "Llama 4 Scout"], keyConfigured: true, totalRequests: 5200, totalTokens: 31_000_000, totalCost: 0 },
  { id: "mp-004", name: "Google", status: "inactive", models: ["Gemini 3 Flash", "Gemini 3 Pro"], keyConfigured: false, totalRequests: 0, totalTokens: 0, totalCost: 0 },
];

export const accounts: Account[] = [
  // Human accounts
  { id: "usr-001", type: "human", name: "Jordan Reeves", email: "jordan@acme-electronics.com", role: "org-admin", status: "active", lastActive: "2026-02-13T14:28:00Z", createdAt: "2025-06-01T10:00:00Z", department: "Engineering", ssoProvider: "Okta", mfaEnabled: true },
  { id: "usr-002", type: "human", name: "Sarah Chen", email: "sarah@acme-electronics.com", role: "agent-developer", status: "active", lastActive: "2026-02-13T11:15:00Z", createdAt: "2025-08-15T14:00:00Z", department: "Data Science", ssoProvider: "Okta", mfaEnabled: true },
  { id: "usr-003", type: "human", name: "Marcus Rodriguez", email: "marcus.r@acme-electronics.com", role: "agent-operator", status: "active", lastActive: "2026-02-12T17:45:00Z", createdAt: "2025-09-01T09:00:00Z", department: "Operations", ssoProvider: "Okta", mfaEnabled: true },
  { id: "usr-004", type: "human", name: "Priya Patel", email: "priya@acme-electronics.com", role: "auditor", status: "active", lastActive: "2026-02-11T09:30:00Z", createdAt: "2025-10-10T11:00:00Z", department: "Compliance", ssoProvider: "Okta", mfaEnabled: true },
  // Service accounts
  { id: "svc-001", type: "service", name: "svc-market-intel", email: "svc-market-intel@agents.kraken.internal", role: "agent-operator", status: "active", lastActive: "2026-02-13T14:30:00Z", createdAt: "2025-11-01T10:00:00Z", boundAgentId: "agt-001", boundAgentName: "Market Intelligence", basePermissions: ["data:read", "integrations:read"], maxJitDuration: 60, jitPolicy: "auto-approve", idpSource: "Okta", lastSyncAt: "2026-02-14T08:15:00Z", owner: "Sarah Chen", authMethod: "OIDC + mTLS", requestablePermissions: ["data:write", "integrations:write"] },
  { id: "svc-002", type: "service", name: "svc-inventory", email: "svc-inventory@agents.kraken.internal", role: "agent-operator", status: "active", lastActive: "2026-02-13T13:50:00Z", createdAt: "2025-11-01T10:00:00Z", boundAgentId: "agt-002", boundAgentName: "Inventory Intelligence", basePermissions: ["data:read", "data:write"], maxJitDuration: 30, jitPolicy: "policy-based", idpSource: "Okta", lastSyncAt: "2026-02-14T08:15:00Z", owner: "Marcus Rodriguez", authMethod: "OIDC + mTLS", requestablePermissions: ["data:delete", "integrations:write"] },
  { id: "svc-003", type: "service", name: "svc-demand-forecast", email: "svc-demand-forecast@agents.kraken.internal", role: "agent-operator", status: "active", lastActive: "2026-02-13T14:29:00Z", createdAt: "2025-11-15T09:00:00Z", boundAgentId: "agt-003", boundAgentName: "Demand Forecasting", basePermissions: ["data:read", "compute:read"], maxJitDuration: 120, jitPolicy: "require-approval", idpSource: "Okta", lastSyncAt: "2026-02-14T08:12:00Z", owner: "Jordan Reeves", authMethod: "OIDC + mTLS", requestablePermissions: ["compute:execute", "agents:spawn", "data:write", "pipelines:execute"] },
  { id: "svc-004", type: "service", name: "svc-price-optimizer", email: "svc-price-optimizer@agents.kraken.internal", role: "agent-operator", status: "suspended", lastActive: "2026-02-12T22:47:00Z", createdAt: "2025-12-01T10:00:00Z", boundAgentId: "agt-005", boundAgentName: "Price Optimization", basePermissions: ["data:read"], maxJitDuration: 15, jitPolicy: "require-approval", idpSource: "Okta", lastSyncAt: "2026-02-14T07:30:00Z", owner: "Marcus Rodriguez", authMethod: "OIDC + mTLS", requestablePermissions: ["data:write", "integrations:write"] },
];

export const jitGrants: JitGrant[] = [
  // Active + auto-approved
  { id: "jit-001", accountId: "svc-001", accountName: "svc-market-intel", agentId: "agt-001", agentName: "Market Intelligence", permissions: ["data:write"], reason: "Writing arbitrage alert results to shared datastore for downstream consumers", status: "active", requestedAt: "2026-02-14T09:00:00Z", grantedAt: "2026-02-14T09:00:01Z", expiresAt: "2026-02-14T10:00:00Z", approvalMethod: "auto-policy", taskContext: "Arbitrage alerting cycle #247" },
  // Active + human-approved
  { id: "jit-002", accountId: "svc-003", accountName: "svc-demand-forecast", agentId: "agt-003", agentName: "Demand Forecasting", permissions: ["compute:execute", "agents:spawn"], reason: "Spawning parallel sub-agents for Q2 demand model retraining across 12 product categories", status: "active", requestedAt: "2026-02-14T05:50:00Z", grantedAt: "2026-02-14T05:52:00Z", expiresAt: "2026-02-14T07:52:00Z", approvedBy: "Jordan Reeves", approvalMethod: "human", taskContext: "Q2 forecast model retraining" },
  // Pending approval
  { id: "jit-003", accountId: "svc-002", accountName: "svc-inventory", agentId: "agt-002", agentName: "Inventory Intelligence", permissions: ["data:delete"], reason: "Cleanup of 2,340 orphaned SKU records from decommissioned warehouse WH-07", status: "pending-approval", requestedAt: "2026-02-14T09:22:00Z", approvalMethod: "policy-engine", taskContext: "Orphaned SKU cleanup batch" },
  // Expired — naturally timed out
  { id: "jit-004", accountId: "svc-001", accountName: "svc-market-intel", agentId: "agt-001", agentName: "Market Intelligence", permissions: ["integrations:write"], reason: "Updating competitor pricing feed configuration after API schema change", status: "expired", requestedAt: "2026-02-13T14:00:00Z", grantedAt: "2026-02-13T14:00:01Z", expiresAt: "2026-02-13T15:00:00Z", approvalMethod: "auto-policy", taskContext: "Feed config migration v3.2" },
  // Expired — another natural expiry
  { id: "jit-005", accountId: "svc-003", accountName: "svc-demand-forecast", agentId: "agt-003", agentName: "Demand Forecasting", permissions: ["data:write", "pipelines:execute"], reason: "Writing forecast outputs and triggering distribution pipeline", status: "expired", requestedAt: "2026-02-13T06:00:00Z", grantedAt: "2026-02-13T06:02:00Z", expiresAt: "2026-02-13T08:02:00Z", approvedBy: "Marcus Rodriguez", approvalMethod: "human", taskContext: "Daily forecast run #189" },
  // Revoked by guardrail
  { id: "jit-006", accountId: "svc-004", accountName: "svc-price-optimizer", agentId: "agt-005", agentName: "Price Optimization", permissions: ["data:write", "integrations:write"], reason: "Pushing dynamic pricing updates to marketplace connectors", status: "revoked", requestedAt: "2026-02-13T22:30:00Z", grantedAt: "2026-02-13T22:31:00Z", expiresAt: "2026-02-13T22:46:00Z", revokedAt: "2026-02-13T22:47:00Z", approvedBy: "Marcus Rodriguez", approvalMethod: "human", revokeReason: "Price floor guardrail triggered — agent attempted to set price below $2.99 minimum", taskContext: "Dynamic repricing session" },
  // Denied
  { id: "jit-007", accountId: "svc-002", accountName: "svc-inventory", agentId: "agt-002", agentName: "Inventory Intelligence", permissions: ["integrations:admin"], reason: "Requesting admin access to reconfigure warehouse management connector", status: "denied", requestedAt: "2026-02-12T11:00:00Z", approvalMethod: "policy-engine", revokeReason: "Permission scope too broad for automated operations — requires human-initiated change request", taskContext: "WMS connector reconfiguration" },
];

export const apiKeys: ApiKey[] = [
  { id: "key-001", name: "Production SDK", prefix: "krak_prod_", created: "2026-01-15T10:00:00Z", lastUsed: "2026-02-13T14:28:00Z", permissions: ["agents:read", "agents:execute", "pipelines:read"] },
  { id: "key-002", name: "CI/CD Pipeline", prefix: "krak_ci_", created: "2026-01-20T14:00:00Z", lastUsed: "2026-02-13T06:00:00Z", permissions: ["agents:deploy", "pipelines:deploy"] },
  { id: "key-003", name: "Monitoring", prefix: "krak_mon_", created: "2026-02-01T09:00:00Z", lastUsed: "2026-02-13T14:30:00Z", permissions: ["observability:read", "agents:read"] },
];

// ─── Usage Types ───

export interface ModelUsage {
  model: string;
  provider: string;
  allocated: number;
  used: number;
}

export interface AgentModelUsage {
  agentId: string;
  agentName: string;
  monthlyLimit: number;
  totalUsed: number;
  byModel: { model: string; tokens: number }[];
}

export const modelUsage: ModelUsage[] = [
  { model: "GPT-5.2", provider: "OpenAI", allocated: 50_000_000, used: 18_200_000 },
  { model: "GPT-5-mini", provider: "OpenAI", allocated: 80_000_000, used: 22_400_000 },
  { model: "Claude Sonnet 4.5", provider: "Anthropic", allocated: 40_000_000, used: 8_100_000 },
  { model: "Claude Opus 4.6", provider: "Anthropic", allocated: 30_000_000, used: 12_600_000 },
  { model: "Llama 4 Maverick", provider: "Meta", allocated: 60_000_000, used: 15_300_000 },
  { model: "o4-mini", provider: "OpenAI", allocated: 20_000_000, used: 3_800_000 },
];

export const agentModelUsage: AgentModelUsage[] = [
  {
    agentId: "agt-001",
    agentName: "Market Intelligence",
    monthlyLimit: 25_000_000,
    totalUsed: 18_400_000,
    byModel: [
      { model: "GPT-5.2", tokens: 9_200_000 },
      { model: "Claude Sonnet 4.5", tokens: 5_100_000 },
      { model: "Llama 4 Maverick", tokens: 4_100_000 },
    ],
  },
  {
    agentId: "agt-002",
    agentName: "Inventory Intelligence",
    monthlyLimit: 20_000_000,
    totalUsed: 14_800_000,
    byModel: [
      { model: "GPT-5-mini", tokens: 8_400_000 },
      { model: "GPT-5.2", tokens: 4_200_000 },
      { model: "Llama 4 Maverick", tokens: 2_200_000 },
    ],
  },
  {
    agentId: "agt-003",
    agentName: "Demand Forecasting",
    monthlyLimit: 30_000_000,
    totalUsed: 12_100_000,
    byModel: [
      { model: "Claude Opus 4.6", tokens: 7_800_000 },
      { model: "o4-mini", tokens: 2_500_000 },
      { model: "Claude Sonnet 4.5", tokens: 1_800_000 },
    ],
  },
  {
    agentId: "agt-004",
    agentName: "Customer Support Triage",
    monthlyLimit: 15_000_000,
    totalUsed: 11_200_000,
    byModel: [
      { model: "GPT-5-mini", tokens: 6_800_000 },
      { model: "Claude Opus 4.6", tokens: 3_200_000 },
      { model: "Claude Sonnet 4.5", tokens: 1_200_000 },
    ],
  },
  {
    agentId: "agt-005",
    agentName: "Price Optimization",
    monthlyLimit: 10_000_000,
    totalUsed: 3_900_000,
    byModel: [
      { model: "GPT-5.2", tokens: 2_100_000 },
      { model: "Llama 4 Maverick", tokens: 1_800_000 },
    ],
  },
];

// ─── Compute Usage Types ───

export interface ComputeUsage {
  includedHours: number;
  usedHours: number;
  overageRatePerHour: number;
  periodLabel: string;
  byPipeline: {
    pipelineId: string;
    pipelineName: string;
    hours: number;
    runs: number;
  }[];
}

export const computeUsage: ComputeUsage = {
  includedHours: 200,
  usedHours: 164.2,
  overageRatePerHour: 0.60,
  periodLabel: "Feb 2026",
  byPipeline: [
    { pipelineId: "pip-002", pipelineName: "Inventory Sync", hours: 72.4, runs: 1248 },
    { pipelineId: "pip-001", pipelineName: "Market Data ETL", hours: 54.8, runs: 312 },
    { pipelineId: "pip-003", pipelineName: "Sales Aggregation", hours: 28.6, runs: 13 },
    { pipelineId: "pip-004", pipelineName: "Customer Feedback Ingest", hours: 8.4, runs: 48 },
  ],
};

// ─── Execution Trace (for Agent Builder detail) ───

export interface TraceStep {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: FlowNode["type"];
  status: "success" | "error" | "running" | "skipped" | "pending";
  startedAt: string;
  duration: number;
  input?: string;
  output?: string;
}

export const sampleTrace: TraceStep[] = [
  { id: "ts-1", nodeId: "n1", nodeLabel: "Cron: Every Hour", nodeType: "trigger", status: "success", startedAt: "2026-02-13T14:15:00Z", duration: 2, input: "Scheduled trigger fired", output: "Execution context initialized" },
  { id: "ts-2", nodeId: "n2", nodeLabel: "Input Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T14:15:00Z", duration: 45, input: "Validating execution context", output: "All checks passed" },
  { id: "ts-3", nodeId: "n3", nodeLabel: "Fetch Market Data", nodeType: "tool", status: "success", startedAt: "2026-02-13T14:15:01Z", duration: 820, input: "GET amazon-sp-api/pricing?categories=electronics", output: "342 price points retrieved" },
  { id: "ts-4", nodeId: "n4", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "success", startedAt: "2026-02-13T14:15:01Z", duration: 640, input: "Scraping 5 competitor storefronts", output: "189 competitor prices collected" },
  { id: "ts-5", nodeId: "n5", nodeLabel: "GPT-5.2: Analyze Trends", nodeType: "model", status: "success", startedAt: "2026-02-13T14:15:02Z", duration: 1100, input: "Analyze 531 price points for arbitrage...", output: "2 arbitrage opportunities identified with >15% margin" },
  { id: "ts-6", nodeId: "n7", nodeLabel: "Output Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T14:15:03Z", duration: 30, input: "Validating outputs for PII/sensitive data", output: "No sensitive data detected" },
  { id: "ts-7", nodeId: "n6", nodeLabel: "Arbitrage Found?", nodeType: "condition", status: "success", startedAt: "2026-02-13T14:15:04Z", duration: 3, input: "opportunities.length > 0", output: "true → Yes branch" },
  { id: "ts-8", nodeId: "n8", nodeLabel: "Send Slack Alert", nodeType: "action", status: "success", startedAt: "2026-02-13T14:15:04Z", duration: 210, input: "Post to #market-alerts", output: "Message sent to #market-alerts" },
];

// ─── Detailed Observability Types ───

export interface DetailedTraceStep extends TraceStep {
  tokensInput?: number;
  tokensOutput?: number;
  modelInfo?: {
    provider: string;
    model: string;
    tokens: number;
    cost: number;
  };
  toolInfo?: {
    toolName: string;
    endpoint: string;
    httpStatus: number;
    request?: string;
    response?: string;
  };
  securityInfo?: {
    checks: { name: string; result: "pass" | "warn" | "fail"; detail: string }[];
    findings: string[];
  };
  errorInfo?: {
    code: string;
    message: string;
    stackTrace?: string;
    retryable: boolean;
  };
}

export interface DetailedAgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status: "success" | "error" | "running" | "pending" | "killed";
  startedAt: string;
  completedAt?: string;
  duration: number;
  tokensUsed: number;
  cost: number;
  trigger: TriggerType;
  triggeredBy: string;
  stepCount: number;
  errorCount: number;
  killedReason?: string;
  traceSteps: DetailedTraceStep[];
}

export type AuditCategory = "execution" | "config_change" | "access" | "data_access" | "alert";

export interface DetailedAuditEntry extends AuditEntry {
  agentId?: string;
  user: string;
  ipAddress: string;
  securityRelevant: boolean;
  category: AuditCategory;
}

// ─── Detailed Mock Data ───

export const detailedAgentRuns: DetailedAgentRun[] = [
  // ── Market Intelligence runs ──
  {
    id: "drun-001", agentId: "agt-001", agentName: "Market Intelligence", status: "success",
    startedAt: "2026-02-13T14:15:00Z", completedAt: "2026-02-13T14:15:03Z", duration: 2340, tokensUsed: 6200, cost: 0.18, trigger: "scheduled", triggeredBy: "Cron (hourly)", stepCount: 8, errorCount: 0,
    traceSteps: [
      { id: "dt-001-1", nodeId: "n1", nodeLabel: "Cron: Every Hour", nodeType: "trigger", status: "success", startedAt: "2026-02-13T14:15:00Z", duration: 2, input: "Scheduled trigger fired", output: "Execution context initialized" },
      { id: "dt-001-2", nodeId: "n2", nodeLabel: "Input Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T14:15:00Z", duration: 45, input: "Validating execution context", output: "All checks passed",
        securityInfo: { checks: [{ name: "Input sanitization", result: "pass", detail: "No injection patterns detected" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "Rate limit check", result: "pass", detail: "42/100 calls this hour" }, { name: "Auth token valid", result: "pass", detail: "Token expires in 47m" }], findings: [] } },
      { id: "dt-001-3", nodeId: "n3", nodeLabel: "Fetch Market Data", nodeType: "tool", status: "success", startedAt: "2026-02-13T14:15:01Z", duration: 820, input: "GET amazon-sp-api/pricing?categories=electronics", output: "342 price points retrieved",
        toolInfo: { toolName: "Amazon SP-API", endpoint: "GET /pricing/v2/items", httpStatus: 200, request: '{"categories": ["electronics"], "marketplace": "US"}', response: '{"items": 342, "truncated": false}' } },
      { id: "dt-001-4", nodeId: "n4", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "success", startedAt: "2026-02-13T14:15:01Z", duration: 640, input: "Scraping 5 competitor storefronts", output: "189 competitor prices collected",
        toolInfo: { toolName: "Web Scraper", endpoint: "POST /scrape/batch", httpStatus: 200, request: '{"targets": 5, "selector": "product-price"}', response: '{"results": 189, "failed": 0}' } },
      { id: "dt-001-5", nodeId: "n5", nodeLabel: "GPT-5.2: Analyze Trends", nodeType: "model", status: "success", startedAt: "2026-02-13T14:15:02Z", duration: 1100, input: "Analyze 531 price points for arbitrage...", output: "2 arbitrage opportunities identified with >15% margin", tokensInput: 4200, tokensOutput: 2000,
        modelInfo: { provider: "OpenAI", model: "GPT-5.2", tokens: 6200, cost: 0.18 } },
      { id: "dt-001-6", nodeId: "n7", nodeLabel: "Output Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T14:15:03Z", duration: 30, input: "Validating outputs for PII/sensitive data", output: "No sensitive data detected",
        securityInfo: { checks: [{ name: "PII detection", result: "pass", detail: "No PII found in output" }, { name: "Data classification", result: "pass", detail: "Output classified as PUBLIC" }], findings: [] } },
      { id: "dt-001-7", nodeId: "n6", nodeLabel: "Arbitrage Found?", nodeType: "condition", status: "success", startedAt: "2026-02-13T14:15:03Z", duration: 3, input: "opportunities.length > 0", output: "true → Yes branch" },
      { id: "dt-001-8", nodeId: "n8", nodeLabel: "Send Slack Alert", nodeType: "action", status: "success", startedAt: "2026-02-13T14:15:03Z", duration: 210, input: "Post to #market-alerts", output: "Message sent to #market-alerts",
        toolInfo: { toolName: "Slack", endpoint: "POST /chat.postMessage", httpStatus: 200, request: '{"channel": "#market-alerts"}', response: '{"ok": true, "ts": "1739..."}' } },
    ],
  },
  {
    id: "drun-002", agentId: "agt-001", agentName: "Market Intelligence", status: "error",
    startedAt: "2026-02-13T13:15:00Z", completedAt: "2026-02-13T13:15:05Z", duration: 4500, tokensUsed: 3100, cost: 0.09, trigger: "scheduled", triggeredBy: "Cron (hourly)", stepCount: 4, errorCount: 1,
    traceSteps: [
      { id: "dt-002-1", nodeId: "n1", nodeLabel: "Cron: Every Hour", nodeType: "trigger", status: "success", startedAt: "2026-02-13T13:15:00Z", duration: 2, input: "Scheduled trigger fired", output: "Execution context initialized" },
      { id: "dt-002-2", nodeId: "n2", nodeLabel: "Input Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T13:15:00Z", duration: 38, input: "Validating execution context", output: "All checks passed",
        securityInfo: { checks: [{ name: "Input sanitization", result: "pass", detail: "Clean" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "Rate limit check", result: "warn", detail: "89/100 calls this hour — approaching limit" }], findings: ["Rate limit approaching threshold"] } },
      { id: "dt-002-3", nodeId: "n3", nodeLabel: "Fetch Market Data", nodeType: "tool", status: "error", startedAt: "2026-02-13T13:15:01Z", duration: 4200, input: "GET amazon-sp-api/pricing?categories=electronics", output: "HTTP 429 — Rate limit exceeded",
        toolInfo: { toolName: "Amazon SP-API", endpoint: "GET /pricing/v2/items", httpStatus: 429, request: '{"categories": ["electronics"]}', response: '{"error": "TooManyRequests", "retryAfter": 60}' },
        errorInfo: { code: "RATE_LIMIT_EXCEEDED", message: "Amazon SP-API rate limit exceeded (429). Retry in 60s.", retryable: true } },
      { id: "dt-002-4", nodeId: "n4", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "skipped", startedAt: "2026-02-13T13:15:05Z", duration: 0, input: "Skipped due to upstream error", output: "—" },
    ],
  },
  {
    id: "drun-003", agentId: "agt-001", agentName: "Market Intelligence", status: "success",
    startedAt: "2026-02-13T12:15:00Z", completedAt: "2026-02-13T12:15:02Z", duration: 2180, tokensUsed: 5800, cost: 0.17, trigger: "scheduled", triggeredBy: "Cron (hourly)", stepCount: 8, errorCount: 0,
    traceSteps: [
      { id: "dt-003-1", nodeId: "n1", nodeLabel: "Cron: Every Hour", nodeType: "trigger", status: "success", startedAt: "2026-02-13T12:15:00Z", duration: 2, input: "Scheduled trigger fired", output: "Execution context initialized" },
      { id: "dt-003-2", nodeId: "n2", nodeLabel: "Input Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T12:15:00Z", duration: 40, input: "Validating execution context", output: "All checks passed",
        securityInfo: { checks: [{ name: "Input sanitization", result: "pass", detail: "Clean" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "Rate limit check", result: "pass", detail: "28/100 calls this hour" }], findings: [] } },
      { id: "dt-003-3", nodeId: "n3", nodeLabel: "Fetch Market Data", nodeType: "tool", status: "success", startedAt: "2026-02-13T12:15:00Z", duration: 780, input: "GET amazon-sp-api/pricing", output: "318 price points",
        toolInfo: { toolName: "Amazon SP-API", endpoint: "GET /pricing/v2/items", httpStatus: 200 } },
      { id: "dt-003-4", nodeId: "n4", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "success", startedAt: "2026-02-13T12:15:00Z", duration: 610, input: "Scraping competitors", output: "175 prices collected",
        toolInfo: { toolName: "Web Scraper", endpoint: "POST /scrape/batch", httpStatus: 200 } },
      { id: "dt-003-5", nodeId: "n5", nodeLabel: "GPT-5.2: Analyze Trends", nodeType: "model", status: "success", startedAt: "2026-02-13T12:15:01Z", duration: 980, input: "Analyze 493 price points...", output: "No arbitrage opportunities found", tokensInput: 3900, tokensOutput: 1900,
        modelInfo: { provider: "OpenAI", model: "GPT-5.2", tokens: 5800, cost: 0.17 } },
      { id: "dt-003-6", nodeId: "n6", nodeLabel: "Arbitrage Found?", nodeType: "condition", status: "success", startedAt: "2026-02-13T12:15:02Z", duration: 2, input: "opportunities.length > 0", output: "false → No branch" },
      { id: "dt-003-7", nodeId: "n7", nodeLabel: "Output Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T12:15:02Z", duration: 28, input: "Validating outputs", output: "Clean",
        securityInfo: { checks: [{ name: "PII detection", result: "pass", detail: "No PII" }], findings: [] } },
      { id: "dt-003-8", nodeId: "n9", nodeLabel: "Update Dashboard", nodeType: "action", status: "success", startedAt: "2026-02-13T12:15:02Z", duration: 150, input: "Update metrics dashboard", output: "Dashboard updated" },
    ],
  },
  // ── Inventory Intelligence runs ──
  {
    id: "drun-004", agentId: "agt-002", agentName: "Inventory Intelligence", status: "success",
    startedAt: "2026-02-13T14:20:00Z", completedAt: "2026-02-13T14:20:02Z", duration: 1750, tokensUsed: 4800, cost: 0.12, trigger: "scheduled", triggeredBy: "Cron (30m)", stepCount: 6, errorCount: 0,
    traceSteps: [
      { id: "dt-004-1", nodeId: "t1", nodeLabel: "Cron: Every 30m", nodeType: "trigger", status: "success", startedAt: "2026-02-13T14:20:00Z", duration: 2, input: "Scheduled trigger", output: "Context ready" },
      { id: "dt-004-2", nodeId: "s1", nodeLabel: "Auth & Rate Check", nodeType: "security", status: "success", startedAt: "2026-02-13T14:20:00Z", duration: 35, input: "Validate credentials", output: "All checks passed",
        securityInfo: { checks: [{ name: "DB credentials valid", result: "pass", detail: "Rotated 3d ago" }, { name: "Shopify token valid", result: "pass", detail: "Expires in 12h" }], findings: [] } },
      { id: "dt-004-3", nodeId: "t2", nodeLabel: "Query Warehouse DB", nodeType: "tool", status: "success", startedAt: "2026-02-13T14:20:00Z", duration: 420, input: "SELECT sku, quantity, reserved FROM inventory", output: "1,247 rows returned",
        toolInfo: { toolName: "PostgreSQL", endpoint: "SELECT inventory", httpStatus: 200, request: "SELECT sku, warehouse_id, quantity, reserved FROM inventory WHERE last_updated > NOW() - INTERVAL '30 minutes'", response: '{"rows": 1247}' } },
      { id: "dt-004-4", nodeId: "t3", nodeLabel: "Sync Shopify Levels", nodeType: "tool", status: "success", startedAt: "2026-02-13T14:20:01Z", duration: 380, input: "GET shopify inventory_levels", output: "1,180 levels fetched",
        toolInfo: { toolName: "Shopify", endpoint: "GET /admin/inventory_levels.json", httpStatus: 200 } },
      { id: "dt-004-5", nodeId: "m1", nodeLabel: "Claude Sonnet 4.5: Reconcile", nodeType: "model", status: "success", startedAt: "2026-02-13T14:20:01Z", duration: 850, input: "Reconcile 1,247 warehouse vs 1,180 channel records", output: "12 conflicts resolved, 3 restock alerts", tokensInput: 3200, tokensOutput: 1600,
        modelInfo: { provider: "Anthropic", model: "Claude Sonnet 4.5", tokens: 4800, cost: 0.12 } },
      { id: "dt-004-6", nodeId: "a1", nodeLabel: "Push Inventory Updates", nodeType: "action", status: "success", startedAt: "2026-02-13T14:20:02Z", duration: 180, input: "Update WMS with reconciled data", output: "12 SKUs updated",
        toolInfo: { toolName: "Inventory Update API", endpoint: "POST /api/v2/inventory/batch", httpStatus: 200 } },
    ],
  },
  {
    id: "drun-005", agentId: "agt-002", agentName: "Inventory Intelligence", status: "success",
    startedAt: "2026-02-13T13:50:00Z", completedAt: "2026-02-13T13:50:02Z", duration: 1680, tokensUsed: 4600, cost: 0.11, trigger: "scheduled", triggeredBy: "Cron (30m)", stepCount: 6, errorCount: 0,
    traceSteps: [
      { id: "dt-005-1", nodeId: "t1", nodeLabel: "Cron: Every 30m", nodeType: "trigger", status: "success", startedAt: "2026-02-13T13:50:00Z", duration: 2, input: "Scheduled trigger", output: "Context ready" },
      { id: "dt-005-2", nodeId: "s1", nodeLabel: "Auth & Rate Check", nodeType: "security", status: "success", startedAt: "2026-02-13T13:50:00Z", duration: 30, input: "Validate credentials", output: "All checks passed",
        securityInfo: { checks: [{ name: "DB credentials valid", result: "pass", detail: "OK" }], findings: [] } },
      { id: "dt-005-3", nodeId: "t2", nodeLabel: "Query Warehouse DB", nodeType: "tool", status: "success", startedAt: "2026-02-13T13:50:00Z", duration: 410, input: "SELECT inventory", output: "1,243 rows",
        toolInfo: { toolName: "PostgreSQL", endpoint: "SELECT inventory", httpStatus: 200 } },
      { id: "dt-005-4", nodeId: "t3", nodeLabel: "Sync Shopify Levels", nodeType: "tool", status: "success", startedAt: "2026-02-13T13:50:00Z", duration: 360, input: "GET inventory_levels", output: "1,175 levels",
        toolInfo: { toolName: "Shopify", endpoint: "GET /admin/inventory_levels.json", httpStatus: 200 } },
      { id: "dt-005-5", nodeId: "m1", nodeLabel: "Claude Sonnet 4.5: Reconcile", nodeType: "model", status: "success", startedAt: "2026-02-13T13:50:01Z", duration: 780, input: "Reconcile records", output: "8 conflicts resolved", tokensInput: 3100, tokensOutput: 1500,
        modelInfo: { provider: "Anthropic", model: "Claude Sonnet 4.5", tokens: 4600, cost: 0.11 } },
      { id: "dt-005-6", nodeId: "a1", nodeLabel: "Push Inventory Updates", nodeType: "action", status: "success", startedAt: "2026-02-13T13:50:01Z", duration: 160, input: "Update WMS", output: "8 SKUs updated",
        toolInfo: { toolName: "Inventory Update API", endpoint: "POST /api/v2/inventory/batch", httpStatus: 200 } },
    ],
  },
  {
    id: "drun-006", agentId: "agt-002", agentName: "Inventory Intelligence", status: "success",
    startedAt: "2026-02-13T13:20:00Z", completedAt: "2026-02-13T13:20:02Z", duration: 1720, tokensUsed: 4700, cost: 0.11, trigger: "event-driven", triggeredBy: "Shopify webhook (bulk update)", stepCount: 6, errorCount: 0,
    traceSteps: [
      { id: "dt-006-1", nodeId: "t1", nodeLabel: "Shopify Webhook", nodeType: "trigger", status: "success", startedAt: "2026-02-13T13:20:00Z", duration: 5, input: "inventory_levels/update webhook", output: "45 SKUs changed" },
      { id: "dt-006-2", nodeId: "s1", nodeLabel: "Auth & Rate Check", nodeType: "security", status: "success", startedAt: "2026-02-13T13:20:00Z", duration: 32, input: "Validate webhook HMAC", output: "Signature verified",
        securityInfo: { checks: [{ name: "HMAC verification", result: "pass", detail: "Signature valid" }, { name: "Replay protection", result: "pass", detail: "Timestamp within 5m window" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }], findings: [] } },
      { id: "dt-006-3", nodeId: "t2", nodeLabel: "Query Warehouse DB", nodeType: "tool", status: "success", startedAt: "2026-02-13T13:20:00Z", duration: 390, input: "Fetch matching SKUs", output: "45 rows",
        toolInfo: { toolName: "PostgreSQL", endpoint: "SELECT inventory", httpStatus: 200 } },
      { id: "dt-006-4", nodeId: "t3", nodeLabel: "Sync Shopify Levels", nodeType: "tool", status: "success", startedAt: "2026-02-13T13:20:01Z", duration: 340, input: "GET updated levels", output: "45 levels",
        toolInfo: { toolName: "Shopify", endpoint: "GET /admin/inventory_levels.json", httpStatus: 200 } },
      { id: "dt-006-5", nodeId: "m1", nodeLabel: "Claude Sonnet 4.5: Reconcile", nodeType: "model", status: "success", startedAt: "2026-02-13T13:20:01Z", duration: 810, input: "Reconcile 45 webhook updates", output: "2 conflicts resolved", tokensInput: 3200, tokensOutput: 1500,
        modelInfo: { provider: "Anthropic", model: "Claude Sonnet 4.5", tokens: 4700, cost: 0.11 } },
      { id: "dt-006-6", nodeId: "a1", nodeLabel: "Push Inventory Updates", nodeType: "action", status: "success", startedAt: "2026-02-13T13:20:02Z", duration: 140, input: "Update WMS", output: "2 SKUs updated",
        toolInfo: { toolName: "Inventory Update API", endpoint: "POST /api/v2/inventory/batch", httpStatus: 200 } },
    ],
  },
  // ── Customer Support Triage runs ──
  {
    id: "drun-016", agentId: "agt-004", agentName: "Customer Support Triage", status: "killed",
    startedAt: "2026-02-13T14:32:00Z", completedAt: "2026-02-13T14:32:00Z", duration: 58, tokensUsed: 0, cost: 0, trigger: "webhook", triggeredBy: "Zendesk webhook (new ticket)", stepCount: 3, errorCount: 0,
    killedReason: "AUTO-KILLED — PII detected in input. Customer home address found in Zendesk ticket payload. Agent terminated due to security policy violation.",
    traceSteps: [
      { id: "dt-016-1", nodeId: "t1", nodeLabel: "Zendesk Webhook", nodeType: "trigger", status: "success", startedAt: "2026-02-13T14:32:00Z", duration: 3, input: "New ticket #4822 received", output: "Ticket payload parsed" },
      { id: "dt-016-2", nodeId: "s1", nodeLabel: "Content Safety Check", nodeType: "security", status: "error", startedAt: "2026-02-13T14:32:00Z", duration: 55, input: "Scan ticket payload for sensitive data before model invocation", output: "CRITICAL — PII DETECTED IN INPUT",
        securityInfo: { checks: [{ name: "XSS detection", result: "pass", detail: "No script tags" }, { name: "SQL injection scan", result: "pass", detail: "No injection patterns" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "PII detection — input", result: "fail", detail: "Customer home address detected in ticket body" }], findings: ["CRITICAL: Customer home address found in ticket input", "Agent terminated due to security policy violation (DHP-003)"] },
        errorInfo: { code: "SECURITY_KILL", message: "PII detected in input — customer home address found in Zendesk ticket #4822 payload. Agent terminated due to security policy violation (DHP-003).", retryable: false } },
      { id: "dt-016-3", nodeId: "r1", nodeLabel: "Incident Report Dispatched", nodeType: "report", status: "success", startedAt: "2026-02-13T14:32:01Z", duration: 120, input: "Generate and dispatch incident report for security violation", output: "Report INC-2026-0213-001 delivered to #security-incidents (Slack) and Jordan Reeves (email)" },
    ],
  },
  {
    id: "drun-007", agentId: "agt-004", agentName: "Customer Support Triage", status: "success",
    startedAt: "2026-02-13T14:28:00Z", completedAt: "2026-02-13T14:28:01Z", duration: 890, tokensUsed: 2100, cost: 0.04, trigger: "webhook", triggeredBy: "Zendesk webhook (new ticket)", stepCount: 5, errorCount: 0,
    traceSteps: [
      { id: "dt-007-1", nodeId: "t1", nodeLabel: "Zendesk Webhook", nodeType: "trigger", status: "success", startedAt: "2026-02-13T14:28:00Z", duration: 3, input: "New ticket #4821 received", output: "Ticket payload parsed" },
      { id: "dt-007-2", nodeId: "s1", nodeLabel: "Content Safety Check", nodeType: "security", status: "success", startedAt: "2026-02-13T14:28:00Z", duration: 52, input: "Scan ticket content for malicious payloads", output: "Content safe",
        securityInfo: { checks: [{ name: "XSS detection", result: "pass", detail: "No script tags" }, { name: "SQL injection scan", result: "pass", detail: "No injection patterns" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "PII detection", result: "warn", detail: "Email address found in body — will be masked" }], findings: ["Customer email detected in ticket body"] } },
      { id: "dt-007-3", nodeId: "m1", nodeLabel: "GPT-5-mini: Classify", nodeType: "model", status: "success", startedAt: "2026-02-13T14:28:00Z", duration: 420, input: "Classify ticket urgency and route...", output: "P2 — Engineering (build quality issue)", tokensInput: 1400, tokensOutput: 700,
        modelInfo: { provider: "OpenAI", model: "GPT-5-mini", tokens: 2100, cost: 0.04 } },
      { id: "dt-007-4", nodeId: "a1", nodeLabel: "Update Zendesk Ticket", nodeType: "action", status: "success", startedAt: "2026-02-13T14:28:01Z", duration: 180, input: "Set priority=P2, assign=Engineering", output: "Ticket updated",
        toolInfo: { toolName: "Zendesk API", endpoint: "PUT /tickets/4821", httpStatus: 200 } },
      { id: "dt-007-5", nodeId: "a2", nodeLabel: "Send Slack Notification", nodeType: "action", status: "success", startedAt: "2026-02-13T14:28:01Z", duration: 145, input: "Notify #support-eng", output: "Sent",
        toolInfo: { toolName: "Slack", endpoint: "POST /chat.postMessage", httpStatus: 200 } },
    ],
  },
  {
    id: "drun-008", agentId: "agt-004", agentName: "Customer Support Triage", status: "success",
    startedAt: "2026-02-13T14:12:00Z", completedAt: "2026-02-13T14:12:01Z", duration: 920, tokensUsed: 1950, cost: 0.03, trigger: "webhook", triggeredBy: "Zendesk webhook (new ticket)", stepCount: 5, errorCount: 0,
    traceSteps: [
      { id: "dt-008-1", nodeId: "t1", nodeLabel: "Zendesk Webhook", nodeType: "trigger", status: "success", startedAt: "2026-02-13T14:12:00Z", duration: 3, input: "New ticket #4820 received", output: "Ticket payload parsed" },
      { id: "dt-008-2", nodeId: "s1", nodeLabel: "Content Safety Check", nodeType: "security", status: "success", startedAt: "2026-02-13T14:12:00Z", duration: 48, input: "Scan content", output: "Content safe",
        securityInfo: { checks: [{ name: "XSS detection", result: "pass", detail: "Clean" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "PII detection", result: "pass", detail: "No PII found" }], findings: [] } },
      { id: "dt-008-3", nodeId: "m1", nodeLabel: "GPT-5-mini: Classify", nodeType: "model", status: "success", startedAt: "2026-02-13T14:12:00Z", duration: 450, input: "Classify ticket...", output: "P3 — Returns (shipping damage)", tokensInput: 1300, tokensOutput: 650,
        modelInfo: { provider: "OpenAI", model: "GPT-5-mini", tokens: 1950, cost: 0.03 } },
      { id: "dt-008-4", nodeId: "a1", nodeLabel: "Update Zendesk Ticket", nodeType: "action", status: "success", startedAt: "2026-02-13T14:12:01Z", duration: 190, input: "Set priority=P3, assign=Returns", output: "Ticket updated",
        toolInfo: { toolName: "Zendesk API", endpoint: "PUT /tickets/4820", httpStatus: 200 } },
      { id: "dt-008-5", nodeId: "a2", nodeLabel: "Send Auto-Response", nodeType: "action", status: "success", startedAt: "2026-02-13T14:12:01Z", duration: 160, input: "Send template response to customer", output: "Email queued",
        toolInfo: { toolName: "Email (SMTP)", endpoint: "POST /send", httpStatus: 200 } },
    ],
  },
  {
    id: "drun-009", agentId: "agt-004", agentName: "Customer Support Triage", status: "success",
    startedAt: "2026-02-13T13:45:00Z", completedAt: "2026-02-13T13:45:01Z", duration: 850, tokensUsed: 1800, cost: 0.03, trigger: "webhook", triggeredBy: "Zendesk webhook", stepCount: 5, errorCount: 0,
    traceSteps: [
      { id: "dt-009-1", nodeId: "t1", nodeLabel: "Zendesk Webhook", nodeType: "trigger", status: "success", startedAt: "2026-02-13T13:45:00Z", duration: 3, input: "Ticket #4819", output: "Parsed" },
      { id: "dt-009-2", nodeId: "s1", nodeLabel: "Content Safety Check", nodeType: "security", status: "success", startedAt: "2026-02-13T13:45:00Z", duration: 45, input: "Scan", output: "Safe",
        securityInfo: { checks: [{ name: "Content safety", result: "pass", detail: "Clean" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }], findings: [] } },
      { id: "dt-009-3", nodeId: "m1", nodeLabel: "GPT-5-mini: Classify", nodeType: "model", status: "success", startedAt: "2026-02-13T13:45:00Z", duration: 400, input: "Classify...", output: "P1 — Billing (payment failed)", tokensInput: 1200, tokensOutput: 600,
        modelInfo: { provider: "OpenAI", model: "GPT-5-mini", tokens: 1800, cost: 0.03 } },
      { id: "dt-009-4", nodeId: "a1", nodeLabel: "Update Zendesk Ticket", nodeType: "action", status: "success", startedAt: "2026-02-13T13:45:01Z", duration: 175, input: "P1, assign=Billing", output: "Updated",
        toolInfo: { toolName: "Zendesk API", endpoint: "PUT /tickets/4819", httpStatus: 200 } },
      { id: "dt-009-5", nodeId: "a2", nodeLabel: "Page On-Call", nodeType: "action", status: "success", startedAt: "2026-02-13T13:45:01Z", duration: 120, input: "P1 escalation to on-call", output: "PagerDuty alert sent",
        toolInfo: { toolName: "Slack", endpoint: "POST /chat.postMessage", httpStatus: 200 } },
    ],
  },
  // ── Demand Forecasting runs (Orchestrator + Sub-Agents) ──
  {
    id: "drun-010", agentId: "agt-003", agentName: "Demand Forecasting", status: "success",
    startedAt: "2026-02-14T06:00:00Z", completedAt: "2026-02-14T07:05:00Z", duration: 3_900_000, tokensUsed: 1_284_000, cost: 48.72, trigger: "scheduled", triggeredBy: "Cron (daily 06:00 UTC)", stepCount: 18, errorCount: 0,
    traceSteps: [
      // ── Deterministic entry ──
      { id: "dt-010-01", nodeId: "t1", nodeLabel: "Scheduled / On-Demand", nodeType: "trigger", status: "success", startedAt: "2026-02-14T06:00:00Z", duration: 3, input: "Daily forecast trigger", output: "Context initialized — 89 product categories queued" },
      { id: "dt-010-02", nodeId: "s1", nodeLabel: "Input Auth & Scoping", nodeType: "security", status: "success", startedAt: "2026-02-14T06:00:00Z", duration: 145, input: "Verify Snowflake + DB + API credentials, scope data access for orchestrator and sub-agents", output: "All credentials valid, scoped tokens issued for up to 8 sub-agents",
        securityInfo: { checks: [{ name: "Snowflake auth", result: "pass", detail: "Key pair valid" }, { name: "PostgreSQL auth", result: "pass", detail: "Connection pooled" }, { name: "Sub-agent token scope", result: "pass", detail: "Read-only scoped, max 8 agents" }, { name: "Data access scope", result: "pass", detail: "Read-only confirmed" }], findings: [] } },

      // ── Orchestrator Iteration 1: Assess, plan tasks, query data, spawn 3 agents ──
      { id: "dt-010-03", nodeId: "orch", nodeLabel: "Opus 4.6 Orchestrator", nodeType: "model", status: "success", startedAt: "2026-02-14T06:00:01Z", duration: 180_000, input: "Iteration 1 — Initial assessment. 89 product categories, no prior data loaded. Decide which tools to use and how many sub-agents to spawn.", output: "Plan: use manage_tasks to create 3 tasks, query_data for historical sales, then spawn_agents to dispatch 3 parallel sub-agents.", tokensInput: 42_000, tokensOutput: 18_000,
        modelInfo: { provider: "Anthropic", model: "Claude Opus 4.6", tokens: 60_000, cost: 3.60 } },
      { id: "dt-010-04", nodeId: "tool-tasks", nodeLabel: "manage_tasks", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:03:01Z", duration: 800, input: "TaskCreate × 3: (1) Data Collection — collect & normalize 89 categories, (2) Time Series — STL + ARIMA decomposition, (3) Market Signals — scan 6 market feeds", output: "3 tasks created: task-001 (Data Collection), task-002 (Time Series), task-003 (Market Signals). All pending, no dependencies.",
        toolInfo: { toolName: "Task Manager", endpoint: "POST /tasks/create", httpStatus: 200, request: '{"tasks": 3, "status": "pending"}', response: '{"created": ["task-001","task-002","task-003"]}' } },
      { id: "dt-010-05", nodeId: "tool-query", nodeLabel: "query_data", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:03:02Z", duration: 14_400, input: "Query Snowflake: 2-year sales history across 89 product categories, join with inventory snapshots", output: "847,000 data points loaded — 89 categories, 730 days, 3 data quality issues flagged",
        toolInfo: { toolName: "Snowflake", endpoint: "SELECT sales_history JOIN inventory", httpStatus: 200, request: '{"categories": 89, "window": "2y"}', response: '{"rows": 847000, "quality_issues": 3}' } },
      { id: "dt-010-06", nodeId: "tool-spawn", nodeLabel: "spawn_agents", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:03:16Z", duration: 1_200, input: "Spawn 3 sub-agents: Data Collection Agent (task-001), Time Series Agent (task-002), Market Signals Agent (task-003). Each gets scoped context + read-only credentials.", output: "3 sub-agents launched in parallel. Agent IDs: sa-dc-01, sa-ts-01, sa-ms-01. All assigned to pending tasks.",
        toolInfo: { toolName: "Agent Spawner", endpoint: "POST /agents/spawn", httpStatus: 200, request: '{"count": 3, "roles": ["data-collection","time-series","market-signals"]}', response: '{"spawned": 3, "agent_ids": ["sa-dc-01","sa-ts-01","sa-ms-01"]}' } },
      { id: "dt-010-07", nodeId: "agents", nodeLabel: "Sub-Agents (3 spawned)", nodeType: "agent", status: "success", startedAt: "2026-02-14T06:03:18Z", duration: 480_000, input: "3 agents working in parallel:\n• sa-dc-01: Collect & normalize 89 categories from Snowflake\n• sa-ts-01: STL decomposition + ARIMA fitting per category\n• sa-ms-01: Scan Google Trends, social sentiment, competitor pricing, macro indicators, weather, events", output: "All 3 agents reported back:\n• sa-dc-01: 847K points normalized, 3 quality issues auto-corrected\n• sa-ts-01: 89 models fitted, 7 regime changes detected, 12 highly seasonal categories\n• sa-ms-01: 1,240 signals across 6 feeds — 3 strong buy signals (post-CES electronics), 2 caution flags (tariff uncertainty)" },

      // ── Orchestrator Iteration 2: Merge reports, update tasks, spawn 2 more agents ──
      { id: "dt-010-08", nodeId: "orch", nodeLabel: "Opus 4.6 Orchestrator", nodeType: "model", status: "success", startedAt: "2026-02-14T06:11:18Z", duration: 540_000, input: "Iteration 2 — Received SendMessage reports from 3 sub-agents. Merge 847K data points + 89 models + 1,240 signals. Resolve conflicts. Decide next actions.", output: "Merged and validated. 4 conflicts resolved (categories #12, #34, #67, #88). Decision: update tasks (mark 3 complete, create 2 new), use run_analysis for cross-validation + enrichment, then spawn 2 targeted sub-agents.", tokensInput: 186_000, tokensOutput: 94_000,
        modelInfo: { provider: "Anthropic", model: "Claude Opus 4.6", tokens: 280_000, cost: 16.80 } },
      { id: "dt-010-09", nodeId: "tool-tasks", nodeLabel: "manage_tasks", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:20:18Z", duration: 600, input: "TaskUpdate × 3: mark task-001, task-002, task-003 as completed. TaskCreate × 2: (4) Scenario Planning — 3 scenarios × 89 categories, (5) Anomaly Detection — Z-score sweep. task-004 blockedBy: [task-001, task-002, task-003].", output: "3 tasks completed. 2 new tasks: task-004 (Scenario Planning), task-005 (Anomaly Detection). Dependencies resolved — both unblocked.",
        toolInfo: { toolName: "Task Manager", endpoint: "POST /tasks/batch", httpStatus: 200, request: '{"completed": 3, "created": 2}', response: '{"total_tasks": 5, "pending": 2}' } },
      { id: "dt-010-10", nodeId: "tool-code", nodeLabel: "run_analysis", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:20:19Z", duration: 96_000, input: "Cross-validate: 14-day holdout per category. Enrich: freight indices + supplier lead times + 142 promotional events.", output: "MAPE 4.2% (within 5% threshold). 3 enrichment datasets merged — 142 promos mapped to 58 categories.",
        toolInfo: { toolName: "Compute Cluster", endpoint: "POST /jobs/validate-and-enrich", httpStatus: 200, request: '{"holdout_days": 14, "enrich_sources": ["freight","lead_times","promos"]}', response: '{"mape": 4.2, "enriched": 89}' } },
      { id: "dt-010-11", nodeId: "tool-spawn", nodeLabel: "spawn_agents", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:21:55Z", duration: 900, input: "Spawn 2 sub-agents: Scenario Planning Agent (task-004), Anomaly Detection Agent (task-005). Context includes merged results from iteration 1.", output: "2 sub-agents launched. Agent IDs: sa-sp-01, sa-ad-01.",
        toolInfo: { toolName: "Agent Spawner", endpoint: "POST /agents/spawn", httpStatus: 200, request: '{"count": 2, "roles": ["scenario-planning","anomaly-detection"]}', response: '{"spawned": 2, "agent_ids": ["sa-sp-01","sa-ad-01"]}' } },
      { id: "dt-010-12", nodeId: "agents", nodeLabel: "Sub-Agents (2 spawned)", nodeType: "agent", status: "success", startedAt: "2026-02-14T06:21:56Z", duration: 600_000, input: "2 agents working:\n• sa-sp-01: Generate base/optimistic/pessimistic scenarios × 89 categories\n• sa-ad-01: Z-score outliers, impossible demand patterns, cross-category correlation breaks", output: "Both reported back:\n• sa-sp-01: 267 scenario forecasts (base 60%, optimistic 25%, pessimistic 15%)\n• sa-ad-01: 4 anomalies detected & corrected (negative demand in #23, correlation break #56, duplicate signal #71-72)" },

      // ── Orchestrator Iteration 3: Final synthesis, no more agents needed ──
      { id: "dt-010-13", nodeId: "orch", nodeLabel: "Opus 4.6 Orchestrator", nodeType: "model", status: "success", startedAt: "2026-02-14T06:31:56Z", duration: 780_000, input: "Iteration 3 — All 5 sub-agents complete. 267 scenario forecasts + 4 anomaly corrections available. Assess: synthesize or iterate?", output: "Sufficient data for final synthesis. Decision: use run_analysis for Monte Carlo (12K iterations/category) and confidence intervals. No more sub-agents needed. Mark remaining tasks complete, then exit loop.", tokensInput: 248_000, tokensOutput: 136_000,
        modelInfo: { provider: "Anthropic", model: "Claude Opus 4.6", tokens: 384_000, cost: 23.04 } },
      { id: "dt-010-14", nodeId: "tool-tasks", nodeLabel: "manage_tasks", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:44:56Z", duration: 400, input: "TaskUpdate × 2: mark task-004 and task-005 as completed. TaskList: all 5/5 tasks complete.", output: "All tasks complete. Task list: 5/5 done. Ready to finalize.",
        toolInfo: { toolName: "Task Manager", endpoint: "POST /tasks/batch", httpStatus: 200, request: '{"completed": 2}', response: '{"total_tasks": 5, "all_complete": true}' } },
      { id: "dt-010-15", nodeId: "tool-code", nodeLabel: "run_analysis", nodeType: "tool", status: "success", startedAt: "2026-02-14T06:44:57Z", duration: 300_000, input: "Monte Carlo: 12,000 iterations × 89 categories (GPU-accelerated). Bootstrap confidence intervals (BCa, n=5000).", output: "1,068,000 simulations complete. Overall weighted confidence: 94.6%, range [91.2%, 97.8%].",
        toolInfo: { toolName: "Compute Cluster (GPU)", endpoint: "POST /jobs/monte-carlo-and-ci", httpStatus: 200, request: '{"mc_iterations": 12000, "categories": 89, "ci_method": "BCa", "ci_n": 5000}', response: '{"sims": 1068000, "confidence": 94.6, "range": [91.2, 97.8]}' } },

      // ── Deterministic exit ──
      { id: "dt-010-16", nodeId: "s2", nodeLabel: "Output Guardrails", nodeType: "security", status: "success", startedAt: "2026-02-14T06:59:42Z", duration: 92, input: "Audit forecast outputs: bounds check, data lineage, classification", output: "All forecasts within bounds — full lineage: 3 orchestrator loops, 5 sub-agents, 5 tasks, 10 tool calls",
        securityInfo: { checks: [{ name: "Forecast bounds check", result: "pass", detail: "All predictions within 3σ" }, { name: "Data lineage recorded", result: "pass", detail: "3 loops, 5 agents, 5 tasks, 10 tool calls" }, { name: "Data classification", result: "pass", detail: "Output classified as INTERNAL" }], findings: [] } },
      { id: "dt-010-17", nodeId: "gate", nodeLabel: "Confidence ≥ 92%?", nodeType: "condition", status: "success", startedAt: "2026-02-14T06:59:42Z", duration: 5, input: "weighted_confidence >= 0.92", output: "94.6% ≥ 92% → Yes" },
      { id: "dt-010-18", nodeId: "out-write", nodeLabel: "Write to Snowflake", nodeType: "action", status: "success", startedAt: "2026-02-14T06:59:43Z", duration: 143_760, input: "INSERT 89 × 2 forecast matrices (7d + 30d) + confidence intervals + scenario breakdowns", output: "1,246 forecast rows + 5,607 interval records + 267 scenario records inserted",
        toolInfo: { toolName: "Snowflake", endpoint: "INSERT forecasts", httpStatus: 200 } },
      { id: "dt-010-19", nodeId: "out-notify", nodeLabel: "Notify Slack", nodeType: "action", status: "success", startedAt: "2026-02-14T07:02:08Z", duration: 340, input: "Post forecast summary to #demand-planning", output: "Summary posted — 94.6% confidence, 89 categories, 3 loop iterations, 5 sub-agents, 5 tasks",
        toolInfo: { toolName: "Slack", endpoint: "POST /chat.postMessage", httpStatus: 200, request: '{"channel": "#demand-planning"}', response: '{"ok": true}' } },
    ],
  },
  {
    id: "drun-011", agentId: "agt-003", agentName: "Demand Forecasting", status: "success",
    startedAt: "2026-02-13T06:00:00Z", completedAt: "2026-02-13T07:03:00Z", duration: 3_780_000, tokensUsed: 1_196_000, cost: 46.38, trigger: "scheduled", triggeredBy: "Cron (daily)", stepCount: 17, errorCount: 0,
    traceSteps: [
      // ── Entry ──
      { id: "dt-011-01", nodeId: "t1", nodeLabel: "Scheduled / On-Demand", nodeType: "trigger", status: "success", startedAt: "2026-02-13T06:00:00Z", duration: 2, input: "Daily trigger", output: "89 categories queued" },
      { id: "dt-011-02", nodeId: "s1", nodeLabel: "Input Auth & Scoping", nodeType: "security", status: "success", startedAt: "2026-02-13T06:00:00Z", duration: 128, input: "Verify access", output: "Credentials valid, scoped tokens issued",
        securityInfo: { checks: [{ name: "Snowflake auth", result: "pass", detail: "OK" }, { name: "Sub-agent scope", result: "pass", detail: "Max 8 agents" }], findings: [] } },

      // ── Iteration 1: Plan, query, spawn 3 ──
      { id: "dt-011-03", nodeId: "orch", nodeLabel: "Opus 4.6 Orchestrator", nodeType: "model", status: "success", startedAt: "2026-02-13T06:00:01Z", duration: 168_000, input: "Iteration 1 — 89 categories, fresh start. Decide actions.", output: "Create 3 tasks, query historical data, spawn 3 sub-agents.", tokensInput: 38_000, tokensOutput: 16_000,
        modelInfo: { provider: "Anthropic", model: "Claude Opus 4.6", tokens: 54_000, cost: 3.24 } },
      { id: "dt-011-04", nodeId: "tool-tasks", nodeLabel: "manage_tasks", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:02:49Z", duration: 700, input: "Create 3 tasks: Data Collection, Time Series, Market Signals", output: "3 tasks created, all pending",
        toolInfo: { toolName: "Task Manager", endpoint: "POST /tasks/create", httpStatus: 200 } },
      { id: "dt-011-05", nodeId: "tool-query", nodeLabel: "query_data", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:02:50Z", duration: 12_600, input: "Query 2-year sales history", output: "831,000 data points loaded",
        toolInfo: { toolName: "Snowflake", endpoint: "SELECT sales_history", httpStatus: 200 } },
      { id: "dt-011-06", nodeId: "tool-spawn", nodeLabel: "spawn_agents", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:03:03Z", duration: 1_100, input: "Spawn 3: Data Collection, Time Series, Market Signals", output: "3 agents launched",
        toolInfo: { toolName: "Agent Spawner", endpoint: "POST /agents/spawn", httpStatus: 200 } },
      { id: "dt-011-07", nodeId: "agents", nodeLabel: "Sub-Agents (3 spawned)", nodeType: "agent", status: "success", startedAt: "2026-02-13T06:03:04Z", duration: 468_000, input: "3 agents: data collection, time series, market signals", output: "All 3 done: 831K normalized, 89 models (6 regime changes), 1,180 signals (2 strong)" },

      // ── Iteration 2: Merge, update tasks, spawn 2 more ──
      { id: "dt-011-08", nodeId: "orch", nodeLabel: "Opus 4.6 Orchestrator", nodeType: "model", status: "success", startedAt: "2026-02-13T06:10:52Z", duration: 516_000, input: "Iteration 2 — 3 agents reported. Merge, resolve conflicts, decide next.", output: "3 conflicts resolved. Mark tasks done, create 2 new. Spawn 2 more agents.", tokensInput: 172_000, tokensOutput: 86_000,
        modelInfo: { provider: "Anthropic", model: "Claude Opus 4.6", tokens: 258_000, cost: 15.48 } },
      { id: "dt-011-09", nodeId: "tool-tasks", nodeLabel: "manage_tasks", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:19:28Z", duration: 500, input: "Complete 3 tasks, create 2 new (Scenario Planning, Anomaly Detection)", output: "5 total tasks, 3 complete, 2 pending",
        toolInfo: { toolName: "Task Manager", endpoint: "POST /tasks/batch", httpStatus: 200 } },
      { id: "dt-011-10", nodeId: "tool-code", nodeLabel: "run_analysis", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:19:29Z", duration: 84_000, input: "Cross-validate + enrich (freight, promos, lead times)", output: "MAPE 4.5%, 128 promos mapped",
        toolInfo: { toolName: "Compute Cluster", endpoint: "POST /jobs/validate-and-enrich", httpStatus: 200 } },
      { id: "dt-011-11", nodeId: "tool-spawn", nodeLabel: "spawn_agents", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:20:53Z", duration: 900, input: "Spawn 2: Scenario Planning, Anomaly Detection", output: "2 agents launched",
        toolInfo: { toolName: "Agent Spawner", endpoint: "POST /agents/spawn", httpStatus: 200 } },
      { id: "dt-011-12", nodeId: "agents", nodeLabel: "Sub-Agents (2 spawned)", nodeType: "agent", status: "success", startedAt: "2026-02-13T06:20:54Z", duration: 576_000, input: "2 agents: scenario planning, anomaly detection", output: "267 scenarios generated, 2 anomalies corrected" },

      // ── Iteration 3: Synthesize, no more agents ──
      { id: "dt-011-13", nodeId: "orch", nodeLabel: "Opus 4.6 Orchestrator", nodeType: "model", status: "success", startedAt: "2026-02-13T06:30:30Z", duration: 756_000, input: "Iteration 3 — All sub-agents done. Synthesize or iterate?", output: "Sufficient. Run Monte Carlo, mark tasks done, exit loop.", tokensInput: 232_000, tokensOutput: 128_000,
        modelInfo: { provider: "Anthropic", model: "Claude Opus 4.6", tokens: 360_000, cost: 21.60 } },
      { id: "dt-011-14", nodeId: "tool-tasks", nodeLabel: "manage_tasks", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:43:06Z", duration: 350, input: "Complete remaining 2 tasks. All 5/5 done.", output: "Task list: 5/5 complete",
        toolInfo: { toolName: "Task Manager", endpoint: "POST /tasks/batch", httpStatus: 200 } },
      { id: "dt-011-15", nodeId: "tool-code", nodeLabel: "run_analysis", nodeType: "tool", status: "success", startedAt: "2026-02-13T06:43:07Z", duration: 174_000, input: "Monte Carlo: 12K × 89 categories", output: "1,068,000 simulations. Confidence: 93.8%",
        toolInfo: { toolName: "Compute Cluster (GPU)", endpoint: "POST /jobs/monte-carlo", httpStatus: 200 } },

      // ── Exit ──
      { id: "dt-011-16", nodeId: "s2", nodeLabel: "Output Guardrails", nodeType: "security", status: "success", startedAt: "2026-02-13T06:57:31Z", duration: 78, input: "Audit outputs", output: "Clean — 3 loops, 5 agents, 5 tasks",
        securityInfo: { checks: [{ name: "Bounds check", result: "pass", detail: "Within 3σ" }, { name: "Lineage", result: "pass", detail: "3 loops, 5 agents, 5 tasks" }], findings: [] } },
      { id: "dt-011-17", nodeId: "gate", nodeLabel: "Confidence ≥ 92%?", nodeType: "condition", status: "success", startedAt: "2026-02-13T06:57:32Z", duration: 4, input: "93.8% ≥ 92%", output: "Yes" },
      { id: "dt-011-18", nodeId: "out-write", nodeLabel: "Write to Snowflake", nodeType: "action", status: "success", startedAt: "2026-02-13T06:57:32Z", duration: 131_792, input: "INSERT forecast matrices", output: "1,246 rows + intervals inserted",
        toolInfo: { toolName: "Snowflake", endpoint: "INSERT", httpStatus: 200 } },
      { id: "dt-011-19", nodeId: "out-notify", nodeLabel: "Notify Slack", nodeType: "action", status: "success", startedAt: "2026-02-13T07:00:06Z", duration: 280, input: "Post summary", output: "93.8% confidence, 3 loops, 5 agents",
        toolInfo: { toolName: "Slack", endpoint: "POST /chat.postMessage", httpStatus: 200 } },
    ],
  },
  // ── Price Optimization runs ──
  {
    id: "drun-012", agentId: "agt-005", agentName: "Price Optimization", status: "success",
    startedAt: "2026-02-13T10:30:00Z", completedAt: "2026-02-13T10:30:03Z", duration: 3100, tokensUsed: 7800, cost: 0.22, trigger: "manual", triggeredBy: "Sarah Chen (manual)", stepCount: 7, errorCount: 0,
    traceSteps: [
      { id: "dt-012-1", nodeId: "t1", nodeLabel: "Manual Trigger", nodeType: "trigger", status: "success", startedAt: "2026-02-13T10:30:00Z", duration: 3, input: "Triggered by Sarah Chen", output: "Context ready" },
      { id: "dt-012-2", nodeId: "s1", nodeLabel: "Permission Check", nodeType: "security", status: "success", startedAt: "2026-02-13T10:30:00Z", duration: 55, input: "Verify user permissions", output: "Editor role — authorized",
        securityInfo: { checks: [{ name: "User authorization", result: "pass", detail: "Sarah Chen has 'editor' role" }, { name: "Manual run quota", result: "pass", detail: "3/10 manual runs today" }, { name: "Price change scope", result: "warn", detail: "Max delta set to 15% — review recommended" }], findings: ["Price change scope at maximum configured limit"] } },
      { id: "dt-012-3", nodeId: "t2", nodeLabel: "Fetch Current Prices", nodeType: "tool", status: "success", startedAt: "2026-02-13T10:30:00Z", duration: 520, input: "Query current pricing across channels", output: "2,156 products loaded",
        toolInfo: { toolName: "PostgreSQL", endpoint: "SELECT product_pricing", httpStatus: 200 } },
      { id: "dt-012-4", nodeId: "t3", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "success", startedAt: "2026-02-13T10:30:01Z", duration: 680, input: "Latest competitor data", output: "1,890 competitor prices",
        toolInfo: { toolName: "Web Scraper", endpoint: "POST /scrape/batch", httpStatus: 200 } },
      { id: "dt-012-5", nodeId: "m1", nodeLabel: "GPT-5.2: Optimize Prices", nodeType: "model", status: "success", startedAt: "2026-02-13T10:30:01Z", duration: 1400, input: "Optimize 2,156 products against competitor data...", output: "428 price adjustments suggested, 3 hit minimum floor", tokensInput: 5200, tokensOutput: 2600,
        modelInfo: { provider: "OpenAI", model: "GPT-5.2", tokens: 7800, cost: 0.22 } },
      { id: "dt-012-6", nodeId: "s2", nodeLabel: "Price Change Audit", nodeType: "security", status: "success", startedAt: "2026-02-13T10:30:03Z", duration: 48, input: "Audit price changes for anomalies", output: "3 products at minimum price floor flagged",
        securityInfo: { checks: [{ name: "Price delta check", result: "warn", detail: "3 products at minimum floor" }, { name: "Revenue impact estimate", result: "pass", detail: "Projected +2.3% revenue" }], findings: ["3 products at minimum price floor"] } },
      { id: "dt-012-7", nodeId: "a1", nodeLabel: "Apply Price Changes", nodeType: "action", status: "success", startedAt: "2026-02-13T10:30:03Z", duration: 320, input: "Update 428 prices via Price Adjustment API", output: "425 updated, 3 at floor",
        toolInfo: { toolName: "Price Adjustment API", endpoint: "POST /sync", httpStatus: 200 } },
    ],
  },
  {
    id: "drun-013", agentId: "agt-005", agentName: "Price Optimization", status: "success",
    startedAt: "2026-02-12T10:30:00Z", completedAt: "2026-02-12T10:30:03Z", duration: 2950, tokensUsed: 7200, cost: 0.20, trigger: "scheduled", triggeredBy: "Cron (daily 10:30)", stepCount: 7, errorCount: 0,
    traceSteps: [
      { id: "dt-013-1", nodeId: "t1", nodeLabel: "Daily Schedule", nodeType: "trigger", status: "success", startedAt: "2026-02-12T10:30:00Z", duration: 2, input: "Scheduled", output: "Ready" },
      { id: "dt-013-2", nodeId: "s1", nodeLabel: "Permission Check", nodeType: "security", status: "success", startedAt: "2026-02-12T10:30:00Z", duration: 42, input: "System auth", output: "Authorized",
        securityInfo: { checks: [{ name: "System authorization", result: "pass", detail: "Service account" }], findings: [] } },
      { id: "dt-013-3", nodeId: "t2", nodeLabel: "Fetch Current Prices", nodeType: "tool", status: "success", startedAt: "2026-02-12T10:30:00Z", duration: 480, input: "Query prices", output: "2,156 products",
        toolInfo: { toolName: "PostgreSQL", endpoint: "SELECT", httpStatus: 200 } },
      { id: "dt-013-4", nodeId: "t3", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "success", startedAt: "2026-02-12T10:30:01Z", duration: 650, input: "Scrape competitors", output: "1,845 prices",
        toolInfo: { toolName: "Web Scraper", endpoint: "POST /scrape/batch", httpStatus: 200 } },
      { id: "dt-013-5", nodeId: "m1", nodeLabel: "GPT-5.2: Optimize Prices", nodeType: "model", status: "success", startedAt: "2026-02-12T10:30:01Z", duration: 1320, input: "Optimize...", output: "392 adjustments", tokensInput: 4800, tokensOutput: 2400,
        modelInfo: { provider: "OpenAI", model: "GPT-5.2", tokens: 7200, cost: 0.20 } },
      { id: "dt-013-6", nodeId: "s2", nodeLabel: "Price Change Audit", nodeType: "security", status: "success", startedAt: "2026-02-12T10:30:03Z", duration: 40, input: "Audit", output: "No anomalies",
        securityInfo: { checks: [{ name: "Price delta check", result: "pass", detail: "All within bounds" }], findings: [] } },
      { id: "dt-013-7", nodeId: "a1", nodeLabel: "Apply Price Changes", nodeType: "action", status: "success", startedAt: "2026-02-12T10:30:03Z", duration: 290, input: "Update 392 prices", output: "All applied",
        toolInfo: { toolName: "Price Adjustment API", endpoint: "POST /sync", httpStatus: 200 } },
    ],
  },
  // ── Additional mixed runs ──
  {
    id: "drun-014", agentId: "agt-004", agentName: "Customer Support Triage", status: "error",
    startedAt: "2026-02-13T11:30:00Z", completedAt: "2026-02-13T11:30:01Z", duration: 1200, tokensUsed: 800, cost: 0.01, trigger: "webhook", triggeredBy: "Zendesk webhook", stepCount: 3, errorCount: 1,
    traceSteps: [
      { id: "dt-014-1", nodeId: "t1", nodeLabel: "Zendesk Webhook", nodeType: "trigger", status: "success", startedAt: "2026-02-13T11:30:00Z", duration: 3, input: "Ticket #4815", output: "Parsed" },
      { id: "dt-014-2", nodeId: "s1", nodeLabel: "Content Safety Check", nodeType: "security", status: "success", startedAt: "2026-02-13T11:30:00Z", duration: 50, input: "Scan content", output: "Safe",
        securityInfo: { checks: [{ name: "Content safety", result: "pass", detail: "Clean" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }], findings: [] } },
      { id: "dt-014-3", nodeId: "m1", nodeLabel: "GPT-5-mini: Classify", nodeType: "model", status: "error", startedAt: "2026-02-13T11:30:00Z", duration: 1100, input: "Classify ticket...", output: "Model timeout",
        modelInfo: { provider: "OpenAI", model: "GPT-5-mini", tokens: 800, cost: 0.01 },
        errorInfo: { code: "MODEL_TIMEOUT", message: "OpenAI API request timed out after 30s", retryable: true } },
    ],
  },
  {
    id: "drun-015", agentId: "agt-001", agentName: "Market Intelligence", status: "running",
    startedAt: "2026-02-13T15:15:00Z", duration: 0, tokensUsed: 4200, cost: 0.12, trigger: "scheduled", triggeredBy: "Cron (hourly)", stepCount: 8, errorCount: 0,
    traceSteps: [
      { id: "dt-015-1", nodeId: "n1", nodeLabel: "Cron: Every Hour", nodeType: "trigger", status: "success", startedAt: "2026-02-13T15:15:00Z", duration: 2, input: "Scheduled trigger fired", output: "Execution context initialized" },
      { id: "dt-015-2", nodeId: "n2", nodeLabel: "Input Validation", nodeType: "security", status: "success", startedAt: "2026-02-13T15:15:00Z", duration: 45, input: "Validating execution context", output: "All checks passed",
        securityInfo: { checks: [{ name: "Input sanitization", result: "pass", detail: "No injection patterns detected" }, { name: "Prompt injection", result: "pass", detail: "No prompt injection detected" }, { name: "Rate limit check", result: "pass", detail: "43/100 calls this hour" }, { name: "Auth token valid", result: "pass", detail: "Token expires in 52m" }], findings: [] } },
      { id: "dt-015-3", nodeId: "n3", nodeLabel: "Fetch Market Data", nodeType: "tool", status: "success", startedAt: "2026-02-13T15:15:01Z", duration: 790, input: "GET amazon-sp-api/pricing?categories=electronics", output: "358 price points retrieved",
        toolInfo: { toolName: "Amazon SP-API", endpoint: "GET /pricing/v2/items", httpStatus: 200, request: '{"categories": ["electronics"], "marketplace": "US"}', response: '{"items": 358, "truncated": false}' } },
      { id: "dt-015-4", nodeId: "n4", nodeLabel: "Fetch Competitor Prices", nodeType: "tool", status: "success", startedAt: "2026-02-13T15:15:01Z", duration: 680, input: "Scraping 5 competitor storefronts", output: "195 competitor prices collected",
        toolInfo: { toolName: "Web Scraper", endpoint: "POST /scrape/batch", httpStatus: 200, request: '{"targets": 5, "selector": "product-price"}', response: '{"results": 195, "failed": 0}' } },
      { id: "dt-015-5", nodeId: "n5", nodeLabel: "GPT-5.2: Analyze Trends", nodeType: "model", status: "running", startedAt: "2026-02-13T15:15:02Z", duration: 0, input: "Analyze 553 price points for arbitrage opportunities...", output: "\u2014", tokensInput: 4200, tokensOutput: 0,
        modelInfo: { provider: "OpenAI", model: "GPT-5.2", tokens: 4200, cost: 0.12 } },
      { id: "dt-015-6", nodeId: "n7", nodeLabel: "Output Validation", nodeType: "security", status: "pending", startedAt: "2026-02-13T15:15:02Z", duration: 0 },
      { id: "dt-015-7", nodeId: "n6", nodeLabel: "Arbitrage Found?", nodeType: "condition", status: "pending", startedAt: "2026-02-13T15:15:02Z", duration: 0 },
      { id: "dt-015-8", nodeId: "n8", nodeLabel: "Send Slack Alert", nodeType: "action", status: "pending", startedAt: "2026-02-13T15:15:02Z", duration: 0 },
    ],
  },
];

// ─── Detailed Audit Trail ───

export const detailedAuditTrail: DetailedAuditEntry[] = [
  { id: "daud-00a", timestamp: "2026-02-13T14:32:00Z", agent: "Customer Support Triage", agentId: "agt-004", action: "AGENT_AUTO_KILLED", status: "error", details: "AUTO-KILLED \u2014 PII detected in input (customer address). Agent terminated due to security policy violation (DHP-003).", duration: 0, user: "security-policy", ipAddress: "10.0.1.42", securityRelevant: true, category: "alert" },
  { id: "daud-00b", timestamp: "2026-02-13T14:32:00Z", agent: "Customer Support Triage", agentId: "agt-004", action: "PII_DETECTED", status: "error", details: "Customer home address detected in Zendesk ticket #4822 payload", duration: 55, user: "security-policy", ipAddress: "10.0.1.42", securityRelevant: true, category: "alert" },
  { id: "daud-01", timestamp: "2026-02-13T14:28:00Z", agent: "Customer Support Triage", agentId: "agt-004", action: "classify_ticket", status: "success", details: "Ticket #4821 classified as P2, routed to Engineering", duration: 890, user: "system", ipAddress: "10.0.1.42", securityRelevant: false, category: "execution" },
  { id: "daud-02", timestamp: "2026-02-13T14:20:00Z", agent: "Inventory Intelligence", agentId: "agt-002", action: "sync_inventory", status: "success", details: "Synced 1,247 SKUs across 3 warehouses", duration: 1750, user: "system", ipAddress: "10.0.1.42", securityRelevant: false, category: "execution" },
  { id: "daud-03", timestamp: "2026-02-13T14:15:00Z", agent: "Market Intelligence", agentId: "agt-001", action: "analyze_market", status: "success", details: "Processed 342 competitor price points, 2 arbitrage opportunities found", duration: 2340, user: "system", ipAddress: "10.0.1.42", securityRelevant: false, category: "execution" },
  { id: "daud-04", timestamp: "2026-02-13T13:15:00Z", agent: "Market Intelligence", agentId: "agt-001", action: "fetch_data", status: "error", details: "Amazon SP-API rate limit exceeded (429). Retry in 60s.", duration: 4500, user: "system", ipAddress: "10.0.1.42", securityRelevant: true, category: "alert" },
  { id: "daud-05", timestamp: "2026-02-13T12:00:00Z", agent: "Demand Forecasting", agentId: "agt-003", action: "generate_forecast", status: "success", details: "7-day forecast generated for 89 product categories", duration: 3_900_000, user: "system", ipAddress: "10.0.1.42", securityRelevant: false, category: "execution" },
  { id: "daud-06", timestamp: "2026-02-13T10:45:00Z", agent: "Price Optimization", agentId: "agt-005", action: "agent_paused", status: "warning", details: "Agent paused by admin \u2014 pending review of price change scope", duration: 0, user: "Jordan Reeves", ipAddress: "192.168.1.105", securityRelevant: true, category: "config_change" },
  { id: "daud-07", timestamp: "2026-02-13T10:30:00Z", agent: "Price Optimization", agentId: "agt-005", action: "optimize_prices", status: "warning", details: "Optimization complete, 3 products hit minimum price floor", duration: 3100, user: "Sarah Chen", ipAddress: "192.168.1.108", securityRelevant: false, category: "execution" },
  { id: "daud-08", timestamp: "2026-02-13T09:15:00Z", agent: "\u2014", action: "api_key_used", status: "success", details: "Production SDK key (krak_prod_) authenticated \u2014 agents:execute scope", duration: 12, user: "API Client", ipAddress: "203.0.113.42", securityRelevant: true, category: "access" },
  { id: "daud-09", timestamp: "2026-02-13T09:00:00Z", agent: "Demand Forecasting", agentId: "agt-003", action: "version_deployed", status: "success", details: "v1.3.0 deployed \u2014 added seasonality indices", duration: 0, user: "Marcus Rodriguez", ipAddress: "192.168.1.112", securityRelevant: false, category: "config_change" },
  { id: "daud-10", timestamp: "2026-02-13T08:30:00Z", agent: "\u2014", action: "login", status: "success", details: "SSO login via Okta", duration: 0, user: "Jordan Reeves", ipAddress: "192.168.1.105", securityRelevant: true, category: "access" },
  { id: "daud-11", timestamp: "2026-02-13T08:28:00Z", agent: "\u2014", action: "login_failed", status: "error", details: "Invalid MFA token \u2014 2 attempts remaining", duration: 0, user: "unknown@acme.com", ipAddress: "198.51.100.77", securityRelevant: true, category: "access" },
  { id: "daud-12", timestamp: "2026-02-12T22:00:00Z", agent: "Inventory Intelligence", agentId: "agt-002", action: "sync_inventory", status: "success", details: "Nightly full sync \u2014 4,891 SKUs processed", duration: 12400, user: "system", ipAddress: "10.0.1.42", securityRelevant: false, category: "execution" },
  { id: "daud-13", timestamp: "2026-02-12T18:00:00Z", agent: "Market Intelligence", agentId: "agt-001", action: "data_export", status: "success", details: "Market report exported to S3 (s3://reports/market/2026-02-12.parquet)", duration: 2400, user: "Sarah Chen", ipAddress: "192.168.1.108", securityRelevant: true, category: "data_access" },
  { id: "daud-14", timestamp: "2026-02-12T16:00:00Z", agent: "\u2014", action: "permission_change", status: "warning", details: "Priya Patel role changed from 'agent-developer' to 'auditor'", duration: 0, user: "Jordan Reeves", ipAddress: "192.168.1.105", securityRelevant: true, category: "config_change" },
  { id: "daud-15", timestamp: "2026-02-12T14:00:00Z", agent: "Customer Support Triage", agentId: "agt-004", action: "model_timeout", status: "error", details: "GPT-5-mini timeout after 30s \u2014 ticket #4815 not classified", duration: 1200, user: "system", ipAddress: "10.0.1.42", securityRelevant: true, category: "alert" },
];

// ─── Per-Agent Time Series ───

const scaleTimeSeries = (base: ApiCallsPoint[], factor: number): ApiCallsPoint[] =>
  base.map((p) => ({
    time: p.time,
    success: Math.floor(p.success * factor),
    clientError: Math.floor(p.clientError * factor),
    serverError: Math.floor(p.serverError * factor),
  }));

const scaleDuration = (base: TimeSeriesPoint[], avgMs: number): TimeSeriesPoint[] =>
  base.map((p) => ({
    time: p.time,
    value: Math.floor((p.value / 2000) * avgMs),
    value2: Math.floor(((p.value2 ?? p.value * 1.8) / 2000) * avgMs * 1.8),
  }));

const scaleTokens = (base: TimeSeriesPoint[], factor: number): TimeSeriesPoint[] =>
  base.map((p) => ({
    time: p.time,
    value: Math.floor(p.value * factor),
    value2: Math.floor((p.value2 ?? 0) * factor),
  }));

const scaleCost = (base: TimeSeriesPoint[], factor: number): TimeSeriesPoint[] =>
  base.map((p) => ({
    time: p.time,
    value: Math.round(p.value * factor * 100) / 100,
  }));

export const agentTimeSeries: Record<string, {
  apiCalls: ApiCallsPoint[];
  duration: TimeSeriesPoint[];
  tokens: TimeSeriesPoint[];
  cost: TimeSeriesPoint[];
}> = {
  "agt-001": { apiCalls: scaleTimeSeries(apiCallsTimeSeries, 0.28), duration: scaleDuration(durationTimeSeries, 2400), tokens: scaleTokens(tokenUsageTimeSeries, 0.25), cost: scaleCost(costTimeSeries, 0.30) },
  "agt-002": { apiCalls: scaleTimeSeries(apiCallsTimeSeries, 0.30), duration: scaleDuration(durationTimeSeries, 1800), tokens: scaleTokens(tokenUsageTimeSeries, 0.28), cost: scaleCost(costTimeSeries, 0.22) },
  "agt-003": { apiCalls: scaleTimeSeries(apiCallsTimeSeries, 0.08), duration: scaleDuration(durationTimeSeries, 3_840_000), tokens: scaleTokens(tokenUsageTimeSeries, 0.22), cost: scaleCost(costTimeSeries, 0.25) },
  "agt-004": { apiCalls: scaleTimeSeries(apiCallsTimeSeries, 0.25), duration: scaleDuration(durationTimeSeries, 950), tokens: scaleTokens(tokenUsageTimeSeries, 0.15), cost: scaleCost(costTimeSeries, 0.10) },
  "agt-005": { apiCalls: scaleTimeSeries(apiCallsTimeSeries, 0.09), duration: scaleDuration(durationTimeSeries, 3200), tokens: scaleTokens(tokenUsageTimeSeries, 0.10), cost: scaleCost(costTimeSeries, 0.13) },
};
