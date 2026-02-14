# Kraken OS — Complete Implementation Specification

> This document is a self-sufficient specification for rebuilding the Kraken OS mock dashboard from scratch. It describes every page, component, data structure, style, and interaction in full detail.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Configuration](#3-project-configuration)
4. [Design System](#4-design-system)
5. [Data Model (mock.ts)](#5-data-model)
6. [Utility Functions](#6-utility-functions)
7. [Layout & Navigation](#7-layout--navigation)
8. [Page: Observability (Dashboard)](#8-page-observability-dashboard)
9. [Page: Agents List](#9-page-agents-list)
10. [Page: Agent Detail](#10-page-agent-detail)
11. [Page: Pipelines](#11-page-pipelines)
12. [Page: Models](#12-page-models)
13. [Page: Usage](#13-page-usage)
14. [Page: Integrations](#14-page-integrations)
15. [Page: Settings](#15-page-settings)

---

## 1. Project Overview

**Kraken OS** is an enterprise AI agent orchestration platform. The mock UI is a Next.js 16 app with Tailwind CSS 4 that displays an operations dashboard for managing AI agents, data pipelines, model providers, integrations, and platform settings.

**Fictional tenant**: Acme Electronics — an e-commerce company using Kraken OS to run AI agents for market intelligence, inventory management, demand forecasting, customer support triage, and price optimization.

**App metadata**:
- Title: "Kraken OS"
- Description: "Enterprise Agent Harness Platform"

### Route Map

| Route | Page Component | Description |
|---|---|---|
| `/` | `ObservabilityPage` | Main dashboard — agent metrics, charts, runs/traces, audit log |
| `/agents` | `AgentsPage` | Agent list with agent stores table and agent cards |
| `/agents/[id]` | Agent detail page | Flow builder, properties, run history for a single agent |
| `/pipelines` | `PipelinesPage` | Data pipeline list, code viewer, compute cluster selector |
| `/models` | `ModelsPage` | LLM provider cards with model lists and usage metrics |
| `/usage` | `UsagePage` | Token allocation, compute hours, cost-by-agent breakdowns |
| `/integrations` | `IntegrationsPage` | Data sources, tools, actions with plugin store management |
| `/settings` | `SettingsPage` | General config, team, API keys, governance, notifications |

---

## 2. Tech Stack & Dependencies

```json
{
  "dependencies": {
    "@xyflow/react": "^12.10.0",
    "lucide-react": "^0.564.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "recharts": "^3.7.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Key libraries**:
- **@xyflow/react** — Flow/graph visualization for agent pipeline builder
- **recharts** — Area, bar, and line charts for metrics
- **lucide-react** — Icon library used throughout

**Package manager**: pnpm

---

## 3. Project Configuration

### tsconfig.json
- `target`: ES2017, `strict`: true, `module`: esnext, `moduleResolution`: bundler
- Path alias: `@/*` → `./src/*`
- JSX: `react-jsx` (React 17+ transform)
- Next.js plugin integrated

### postcss.config.mjs
- Single plugin: `@tailwindcss/postcss`

### eslint.config.mjs
- Flat config format (ESLint v9+)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

### next.config.ts
- Empty/default configuration (no custom options)

### pnpm-workspace.yaml
- `ignoredBuiltDependencies`: sharp, unrs-resolver

### File Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Observability dashboard (/)
│   ├── globals.css             # Theme, custom properties, overrides
│   ├── favicon.ico
│   ├── agents/
│   │   ├── page.tsx            # Agent list (/agents)
│   │   └── [id]/page.tsx       # Agent detail (/agents/[id])
│   ├── pipelines/page.tsx      # Pipelines (/pipelines)
│   ├── models/page.tsx         # Models (/models)
│   ├── usage/page.tsx          # Usage (/usage)
│   ├── integrations/page.tsx   # Integrations (/integrations)
│   └── settings/page.tsx       # Settings (/settings)
├── components/
│   └── layout/
│       ├── sidebar.tsx         # Fixed left sidebar
│       └── page-header.tsx     # Reusable page header
├── data/
│   └── mock.ts                 # All mock data & type definitions
└── lib/
    └── utils.ts                # Formatting & utility functions
```

---

## 4. Design System

### 4.1 Fonts (Google Fonts via `next/font/google`)

| Font | CSS Variable | Usage |
|---|---|---|
| Geist Sans | `--font-geist-sans` | Body text, general UI |
| Geist Mono | `--font-geist-mono` | Code, metrics, tabular data |
| Instrument Serif | `--font-instrument-serif` | Display headings (400 weight) |

### 4.2 Color Tokens (CSS Custom Properties via `@theme inline`)

**Backgrounds**:
| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#080808` | Page background |
| `--color-bg-secondary` | `#111111` | Cards, sidebar |
| `--color-bg-tertiary` | `#1a1a1a` | Inputs, hover states |
| `--color-bg-elevated` | `#222222` | Elevated surfaces |

**Borders**:
| Token | Value |
|---|---|
| `--color-border-subtle` | `rgba(255,255,255,0.06)` |
| `--color-border-default` | `rgba(255,255,255,0.10)` |

**Text**:
| Token | Value |
|---|---|
| `--color-text-primary` | `#ececec` |
| `--color-text-secondary` | `#999999` |
| `--color-text-muted` | `#555555` |

**Accent**:
| Token | Value |
|---|---|
| `--color-accent` | `#e8622c` (burnt orange) |
| `--color-accent-hover` | `#f0753f` |
| `--color-accent-muted` | `rgba(232,98,44,0.12)` |

**Status**:
| Token | Value | Purpose |
|---|---|---|
| `--color-success` | `#4aca8a` | Green, success states |
| `--color-success-muted` | `rgba(74,202,138,0.12)` | Green backgrounds |
| `--color-warning` | `#daa94a` | Golden yellow, warnings |
| `--color-warning-muted` | `rgba(218,169,74,0.12)` | Warning backgrounds |
| `--color-error` | `#e06464` | Red, errors |
| `--color-error-muted` | `rgba(224,100,100,0.12)` | Error backgrounds |

### 4.3 Global CSS Styles (globals.css)

**HTML**: `color-scheme: dark`

**Body**: bg-primary background, text-primary color, Geist Sans font stack, antialiased rendering

**Custom scrollbar** (webkit):
- 6px width/height, transparent track
- Thumb: `rgba(255,255,255,0.08)`, 3px border radius, `0.14` on hover

**Glassmorphism** (`.glass` class):
- Background: `rgba(17,17,17,0.6)`
- Backdrop filter: `blur(20px) saturate(180%)`
- Border: 1px `rgba(255,255,255,0.06)`

**Grain texture** (`.grain::before` pseudo-element):
- Fixed overlay covering entire viewport, z-index 9999, pointer-events none
- Opacity: 0.015 (extremely subtle)
- SVG fractal noise pattern (baseFrequency 0.9, 4 octaves)

**Metric values** (`.metric-value`):
- `font-variant-numeric: tabular-nums`, `letter-spacing: -0.02em`

**Global transitions** (`*` selector):
- Properties: background-color, border-color, color, opacity
- Duration: 150ms, cubic-bezier(0.4, 0, 0.2, 1)

**Recharts overrides**:
- Grid lines: `rgba(255,255,255,0.04)`
- Text: text-muted color, 11px, monospace font

**React Flow overrides**:
- Background: bg-primary
- Minimap: bg-secondary, border-subtle, 8px radius
- Controls: bg-secondary, border-subtle
- Edge paths: `rgba(255,255,255,0.15)`, 1.5px stroke

**Custom animation** (`animate-gentle-pulse`):
- Keyframes: 100% → 40% → 100% opacity over 3s, ease-in-out, infinite

**Text selection**: Orange-tinted background (`rgba(232,98,44,0.3)`), white text

### 4.4 Design Principles

- Dark theme throughout (Apple-esque, high-end aesthetic)
- Minimal borders using very low opacity whites (4–15%)
- 13px default UI font size, monospace for data/metrics
- Consistent status colors: emerald=success, amber=warning, red=error
- 150ms transitions for all interactive elements
- Glassmorphism for card backgrounds, subtle grain texture overlay

---

## 5. Data Model

All types and mock data live in `src/data/mock.ts`. Every export is documented below.

### 5.1 Type Definitions

#### Agent Types
```typescript
type AgentStatus = "running" | "idle" | "error" | "paused" | "killed"
type TriggerType = "scheduled" | "manual" | "webhook" | "event-driven" | "api"

interface Agent {
  id: string
  name: string
  description: string
  status: AgentStatus
  lastRun: string              // ISO 8601
  nextRun?: string             // ISO 8601
  successRate: number          // 0-100
  totalRuns: number
  avgLatency: number           // ms
  triggers: TriggerType[]
  version: string              // semver
  source: IntegrationSource
  sourceDetail?: string
  securityFlags: number
}

interface AgentRun {
  id: string
  agentId: string
  agentName: string
  status: "success" | "error" | "running" | "pending" | "killed"
  startedAt: string
  duration: number             // ms
  tokensUsed: number
  cost: number                 // USD
  trigger: TriggerType
}
```

#### Flow/Pipeline Node Types
```typescript
interface FlowNode {
  id: string
  type: "trigger" | "model" | "tool" | "condition" | "security" | "action" | "human" | "agent" | "report"
  label: string
  x: number                    // pixel position
  y: number
}

interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
}
```

#### Time Series
```typescript
interface TimeSeriesPoint {
  time: string                 // "HH:00" or day name
  value: number
  value2?: number
  value3?: number
}

interface ApiCallsPoint {
  time: string
  success: number
  clientError: number
  serverError: number
}
```

#### Integration & Plugin Store Types
```typescript
type IntegrationSource = "kraken" | "community" | "custom"

interface PluginStore {
  id: string
  name: string
  source: IntegrationSource
  url: string
  description: string
  pluginCount: number
  installedCount: number
  connected: boolean
}

interface AgentStore {
  id: string
  name: string
  source: IntegrationSource
  url: string
  description: string
  agentCount: number
  installedCount: number
  connected: boolean
  version: string
  updateAvailable?: string
}

interface IntegrationConfigField {
  label: string
  value: string
  type: "text" | "secret" | "select" | "toggle"
}

interface Integration {
  id: string
  name: string
  category: "data-source" | "tool" | "action"
  type: string
  status: "connected" | "disconnected" | "error"
  lastSync?: string
  description: string
  subscribed: boolean
  enabled: boolean
  source: IntegrationSource
  sourceDetail?: string
  storeId: string
  mcpEndpoint?: string
  version?: string
  config?: IntegrationConfigField[]
}
```

#### Pipeline & Compute Types
```typescript
interface PipelineRun {
  id: string
  status: "success" | "error"
  startedAt: string
  duration: number             // ms
  recordsProcessed: number
}

interface Pipeline {
  id: string
  name: string
  description: string
  schedule: string             // e.g., "Every 1h", "Daily 06:00 UTC"
  status: "active" | "paused" | "error"
  lastRun: string
  nextRun: string
  avgDuration: number          // ms
  outputFormat: string         // e.g., "Parquet"
  code: string                 // Python source code
  recentRuns: PipelineRun[]
}

interface ComputeCluster {
  id: string
  name: string
  type: "cpu-optimized" | "gpu-accelerated" | "general-purpose"
  vcpus: number
  memoryGb: number
  gpus: number
  gpuModel?: string
  maxConcurrentPipelines: number
  status: "healthy" | "degraded" | "offline"
  utilization: number          // 0-100
}
```

#### Model & Usage Types
```typescript
interface ModelProvider {
  id: string
  name: string
  status: "active" | "inactive"
  models: string[]
  keyConfigured: boolean
  totalRequests: number
  totalTokens: number
  totalCost: number
}

interface ModelUsage {
  model: string
  provider: string
  allocated: number            // tokens
  used: number                 // tokens
}

interface AgentModelUsage {
  agentId: string
  agentName: string
  monthlyLimit: number
  totalUsed: number
  byModel: { model: string; tokens: number }[]
}

interface ComputeUsage {
  includedHours: number
  usedHours: number
  overageRatePerHour: number
  periodLabel: string
  byPipeline: {
    pipelineId: string
    pipelineName: string
    hours: number
    runs: number
  }[]
}
```

#### Team & Security Types
```typescript
interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  lastActive: string
}

interface ApiKey {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed: string
  permissions: string[]
}

interface ActivityItem {
  id: string
  type: "agent_run" | "pipeline_run" | "alert" | "deployment" | "config_change"
  message: string
  timestamp: string
  agentName?: string
  status: "success" | "error" | "warning" | "info"
}
```

#### Audit Types
```typescript
interface AuditEntry {
  id: string
  timestamp: string
  agent: string
  action: string
  status: "success" | "error" | "warning"
  details: string
  duration: number
}

type AuditCategory = "execution" | "config_change" | "access" | "data_access" | "alert"

interface DetailedAuditEntry extends AuditEntry {
  agentId?: string
  user: string
  ipAddress: string
  securityRelevant: boolean
  category: AuditCategory
}
```

#### Execution Trace Types
```typescript
interface TraceStep {
  id: string
  nodeId: string
  nodeLabel: string
  nodeType: FlowNode["type"]
  status: "success" | "error" | "running" | "skipped"
  startedAt: string
  duration: number
  input?: string
  output?: string
}

interface DetailedTraceStep extends TraceStep {
  tokensInput?: number
  tokensOutput?: number
  modelInfo?: {
    provider: string
    model: string
    tokens: number
    cost: number
  }
  toolInfo?: {
    toolName: string
    endpoint: string
    httpStatus: number
    request?: string
    response?: string
  }
  securityInfo?: {
    checks: { name: string; result: "pass" | "warn" | "fail"; detail: string }[]
    findings: string[]
  }
  errorInfo?: {
    code: string
    message: string
    stackTrace?: string
    retryable: boolean
  }
}

interface DetailedAgentRun {
  id: string
  agentId: string
  agentName: string
  status: "success" | "error" | "running" | "pending" | "killed"
  startedAt: string
  completedAt?: string
  duration: number
  tokensUsed: number
  cost: number
  trigger: TriggerType
  triggeredBy: string
  stepCount: number
  errorCount: number
  killedReason?: string
  traceSteps: DetailedTraceStep[]
}
```

### 5.2 Mock Data Summary

#### Agents (5)
| ID | Name | Status | Success Rate | Runs | Latency | Source | Triggers |
|---|---|---|---|---|---|---|---|
| agt-001 | Market Intelligence | running | 98.7% | 23 | 2400ms | kraken | scheduled, webhook |
| agt-002 | Inventory Intelligence | running | 99.2% | 27 | 1800ms | kraken | scheduled, event-driven |
| agt-003 | Demand Forecasting | idle | 97.1% | 1 | 8500ms | kraken | scheduled |
| agt-004 | Customer Support Triage | killed | 94.5% | 19 | 950ms | community (commerce-ai) | webhook, event-driven |
| agt-005 | Price Optimization | paused | 96.8% | 4 | 3200ms | community (commerce-ai) | scheduled, manual |

#### Agent Stores (3)
| ID | Name | Source | Agents | Installed | Version |
|---|---|---|---|---|---|
| astore-logistics | logistics | kraken | 3 | 3 | 2.4.0 |
| astore-commerce-ai | commerce-ai | community | 8 | 2 | 1.2.1 (update: 1.3.0) |
| astore-internal | acme-internal | custom | 3 | 0 | 0.9.0 |

#### Recent Runs (8)
Run IDs: run-001 through run-008. Mix of success/error statuses across agents. Durations range from 890ms to 8200ms. Costs range from $0.03 to $0.52.

#### Market Intelligence Flow (10 nodes, 10 edges)
Nodes: Cron Trigger → Input Validation → (Fetch Market Data + Fetch Competitor Prices) → GPT-5.2 Analyze → Arbitrage Found? → Output Validation → Manager Approval → (Send Slack Alert + Update Dashboard)

#### Dashboard Metrics
- Total runs today: 147, success rate: 97.8%, avg latency: 2180ms, cost today: $18.42
- Active agents: 3 of 5
- Tokens today: 842K in, 391K out (1.233M total)
- Monthly usage: 80.4M of 280M allocated (Feb 2026)
- Usage by agent: Market Intelligence 33.4%, Inventory Intelligence 28.2%, Customer Support Triage 21.7%, Demand Forecasting 12%, Price Optimization 4.7%

#### Recent Activity (8 items)
Events include: PII detection auto-kill, successful agent runs, API rate limits, pipeline completions, config changes, deployments.

#### Time Series Data
- **API Calls**: 24 hourly points (00:00–23:00) with success, clientError, serverError values
- **Token Usage**: 7 daily points (Fri–Thu) with input/output values
- **Latency**: 24 hourly points with avg (value) and P99 (value2)
- **Cost**: 7 daily points with daily cost values ($12–$20)

#### Plugin Stores (4)
| Name | Source | Plugins | Installed |
|---|---|---|---|
| Kraken Verified | kraken | 42 | 10 |
| crawl4ai | community | 6 | 1 |
| datastack-labs | community | 8 | 0 |
| acme-internal | custom | 4 | 2 |

#### Integrations (19 total)
**Data Sources (6)**: Amazon SP-API, Shopify, PostgreSQL, Snowflake (subscribed); Oracle Delta Share, Google BigQuery (available)

**Tools (6)**: Perplexity Search, Web Scraper, Python Runtime, Calculator (subscribed); Wolfram Alpha, Firecrawl (available)

**Actions (7)**: Email SMTP, Slack, Inventory Update API, Price Adjustment API, Zendesk (subscribed); Webhook Dispatcher, Microsoft Teams (available)

Each subscribed integration has full config arrays with fields (text, secret, select, toggle types) and MCP endpoints.

#### Compute Clusters (3)
| Name | Type | vCPUs | Memory | GPUs | Status | Utilization |
|---|---|---|---|---|---|---|
| General Purpose | general-purpose | 8 | 32GB | 0 | healthy | 42% |
| CPU Optimized | cpu-optimized | 32 | 64GB | 0 | healthy | 68% |
| GPU Accelerated | gpu-accelerated | 16 | 128GB | 4x A100 | degraded | 91% |

#### Pipelines (4)
| Name | Schedule | Status | Avg Duration | Output |
|---|---|---|---|---|
| Market Data ETL | Every 1h | active | 3m | Parquet |
| Inventory Sync | Every 30m | active | 45s | Parquet |
| Sales Aggregation | Daily 06:00 UTC | active | ~5m | Parquet |
| Customer Feedback Ingest | Every 4h | paused | ~1.5m | Parquet |

Each pipeline has full Python source code (80–104 lines) and 3–5 recent runs with status, duration, and records processed.

#### Model Providers (4)
| Name | Status | Models | Requests | Tokens | Cost |
|---|---|---|---|---|---|
| OpenAI | active | GPT-5.2, GPT-5-mini, o4-mini | 28.4K | 142M | $892.50 |
| Anthropic | active | Claude Opus 4.6, Claude Sonnet 4.5, Claude Haiku 4.5 | 12.1K | 68M | $524.30 |
| Meta (via LiteLLM) | active | Llama 4 Maverick, Llama 4 Scout | 5.2K | 31M | $0 |
| Google | inactive | Gemini 3 Flash, Gemini 3 Pro | 0 | 0 | $0 |

#### Model Usage (6 models)
Token allocations and usage per model (GPT-5.2: 50M/18.2M, GPT-5-mini: 80M/22.4M, Claude Sonnet 4.5: 40M/8.1M, Claude Opus 4.6: 30M/12.6M, Llama 4 Maverick: 60M/15.3M, o4-mini: 20M/3.8M)

#### Agent Model Usage (5 agents)
Per-agent token consumption broken down by model. Each agent has a monthly limit and a byModel array showing which models consumed how many tokens.

#### Compute Usage
- Included: 200h, Used: 164.2h, Overage rate: $0.48/hr
- By pipeline: Inventory Sync 72.4h/1248 runs, Market Data ETL 54.8h/312 runs, Sales Aggregation 28.6h/13 runs, Customer Feedback Ingest 8.4h/48 runs

#### Team Members (4)
| Name | Email | Role | Last Active |
|---|---|---|---|
| Jordan Reeves | jordan@acme-electronics.com | admin | 14:30 today |
| Sarah Chen | sarah@acme-electronics.com | editor | 13:45 today |
| Marcus Rodriguez | marcus.r@acme-electronics.com | editor | 11:20 today |
| Priya Patel | priya@acme-electronics.com | viewer | yesterday |

#### API Keys (3)
| Name | Prefix | Permissions |
|---|---|---|
| Production SDK | krak_prod_ | agents:read, agents:execute, pipelines:read |
| CI/CD Pipeline | krak_ci_ | agents:deploy, pipelines:deploy |
| Monitoring | krak_mon_ | observability:read, agents:read |

#### Detailed Agent Runs (15)
Comprehensive execution traces for all 5 agents with full DetailedTraceStep data including model info, tool info, security checks, and error details.

#### Detailed Audit Trail (16 entries)
Enhanced audit entries with user, IP, security relevance flags, and categories covering executions, config changes, access events, data access, and alerts. Includes PII detection and auto-kill events.

---

## 6. Utility Functions

File: `src/lib/utils.ts`

### `cn(...classes)` — Class Name Combiner
Accepts variable args of `string | false | null | undefined`. Filters falsy values, joins with spaces.

### `formatNumber(n)` — Compact Number Format
- >= 1,000,000 → `"X.XM"` (e.g., `142000000` → `"142.0M"`)
- >= 1,000 → `"X.XK"` (e.g., `28400` → `"28.4K"`)
- < 1,000 → locale string

### `formatCurrency(n)` — Dollar Format
- >= 1,000 → `"$X.XK"`
- < 1,000 → `"$X.XX"` (2 decimals)

### `formatLatency(ms)` — Duration Format
- >= 1,000 → `"X.Xs"` (seconds with 1 decimal)
- < 1,000 → `"Xms"`

### `formatTokens(n)` — Token Count Format
- >= 1,000,000 → `"X.XM"` (1 decimal)
- >= 1,000 → `"XK"` (0 decimals)
- < 1,000 → locale string

### `timeAgo(date)` — Relative Time
Reference time mocked to `2026-02-13T14:30:00Z`. Returns:
- < 60s: `"just now"`
- < 1h: `"Xm ago"`
- < 1d: `"Xh ago"`
- >= 1d: `"Xd ago"`

### `getGreeting()` — Time-Based Greeting
Mocked to 14:00 (afternoon). Returns `"Good morning"` / `"Good afternoon"` / `"Good evening"`.

---

## 7. Layout & Navigation

### 7.1 Root Layout (`src/app/layout.tsx`)

- `<html lang="en" className="dark">`
- Body applies all three font CSS variables + `antialiased grain` classes
- Structure: `<Sidebar />` (fixed) + `<main className="ml-[240px] min-h-screen">` containing a centered max-width container (`max-w-[1400px] mx-auto px-8 py-8`)

### 7.2 Sidebar (`src/components/layout/sidebar.tsx`)

**Client component** using `usePathname()` for active route detection.

**Container**: `fixed left-0 top-0 bottom-0 w-[240px] bg-bg-secondary border-r border-white/[0.06] flex flex-col z-50`

**Brand Section** (h-14):
- Custom SVG logo: 22x22px rounded box with diamond/line pattern
- Text: "Kraken OS" — 13px, semibold, white/90, tracking-wide

**Main Navigation**:
| Path | Label | Icon (lucide) |
|---|---|---|
| `/` | Observability | Activity |
| `/agents` | Agents | Cpu |
| `/pipelines` | Pipelines | Workflow |
| `/models` | Models | Sparkles |
| `/usage` | Usage | BarChart3 |

**System Navigation** (with "System" section header):
| Path | Label | Icon |
|---|---|---|
| `/integrations` | Integrations | Cable |
| `/settings` | Settings | SlidersHorizontal |

**Nav Item Styling**:
- 13px font, 16px icons (1.5 stroke width)
- Active: `bg-white/[0.08] text-white/90 font-medium`
- Inactive: `text-white/50 hover:bg-white/[0.04] hover:text-white/75`
- Active detection: exact match for `/`, prefix match for others

**Bottom Section**:
- Notifications button with "3" badge (pill, 10px, white/50)
- Divider line
- User profile: avatar (20x20 rounded square, gradient, initial "J"), name "Jordan Reeves" (13px, white/70)

### 7.3 Page Header (`src/components/layout/page-header.tsx`)

**Client component**. Props: `title: string`, `subtitle?: string`, `actions?: ReactNode`

- Container: `flex items-end justify-between mb-8`
- Title: `text-[22px] font-medium text-text-primary leading-tight tracking-tight`
- Subtitle: `text-[13px] text-text-secondary mt-1`
- Actions area: `flex items-center gap-3`

---

## 8. Page: Observability (Dashboard)

**Route**: `/` — **File**: `src/app/page.tsx` — **Client component**

This is the main dashboard. It contains an agent metrics table, 4 charts, a runs/traces inspector, and an audit log.

### 8.1 State Management
```typescript
selectedAgentId: string | null          // Filters all sections to one agent
timeRange: "1h" | "6h" | "24h" | "7d" | "30d"
activeBottomTab: "runs" | "audit"       // Bottom section tab
selectedRunId: string | null            // Selected run in runs list
expandedSteps: Set<string>              // Expanded trace steps
killTargetId: string | null             // Agent kill dialog target
```

### 8.2 Page Header
- Title: "Observability"
- Subtitle: "Monitor agent performance, traces, and audit trails"
- Actions: Time range dropdown (`<select>`) + Export button (`Download` icon)

### 8.3 Agent Selector Table

Full-width table with 11 columns showing all 5 agents:

| Column | Width | Content |
|---|---|---|
| Agent | 220px | Name + status dot + "KILLED" badge if applicable |
| Invocations | auto | `formatNumber(agent.totalRuns)` |
| Calls | auto | `formatNumber(metrics.totalCalls)` |
| Error Rate | auto | Percentage with color coding |
| Latency | auto | `formatLatency(metrics.avgLatency)` |
| Tokens | auto | `formatTokens(metrics.tokensUsed)` |
| Cost | auto | `formatCurrency(metrics.cost)` |
| Last Run | 100px | `timeAgo(agent.lastRun)` |
| Next Run | 100px | Contextual: "in Xm", "Running..." (pulsing), "KILLED", "Event-driven", "Manual" |
| Security | 80px | Shield icon (green) or AlertTriangle + count (orange) |
| Kill | 60px | OctagonX button (hidden if already killed) |

- Row click toggles agent selection (clears run/step selections)
- Selected row: `bg-accent/[0.06]` with accent left border
- Metrics derived from agents array: `totalCalls = totalRuns * 3.2`, `errorRate = 100 - successRate`, etc.

### 8.4 Charts Section (2x2 Grid)

All charts use `ResponsiveContainer` (height 200px) with dark-themed tooltips.

**Chart 1 — API Calls** (Stacked AreaChart):
- Areas: success (#34d399), clientError (#fbbf24), serverError (#f87171)
- Dashed CartesianGrid

**Chart 2 — Latency** (LineChart):
- Lines: Avg (#e8622c, solid, 2px), P99 (#555555, dashed, 1.5px)
- Y-axis: formatLatency, Tooltip: formatLatency

**Chart 3 — Token Usage** (BarChart):
- Bars: Input (#e8622c), Output (#555555) — rounded tops
- Y-axis: formatNumber, Tooltip: formatNumber

**Chart 4 — Daily Cost** (AreaChart):
- Single area: #e8622c, 10% opacity fill
- Y-axis: `$X` format, Tooltip: formatCurrency

When an agent is selected, charts filter to agent-specific time series data.

### 8.5 Runs & Traces Tab

**Split layout**: Runs list (380px when run selected, full width otherwise) + Trace detail panel (flex-1).

**Run Row**: Shows status icon, agent name, trigger badge (colored by type), start time, duration, tokens, cost. Killed runs show red "AUTO-KILLED" badge and reason.

**Trace Detail Panel** (when a run is selected):
- Header: Status icon, agent name, run ID, metadata (started, duration, steps, errors, trigger)
- Kill alert banner (if killed): Red OctagonX icon, "AUTO-KILLED" label, reason text
- Three sub-tabs:

  **Trace tab**: List of `TraceStepRow` components (expandable). Each shows:
  - Node type color dot + badge (9px mono uppercase)
  - Node label, status icon, duration
  - Expanded: Input/output text, model info (provider/model/tokens/cost), tool info (name/endpoint/HTTP status/request/response), security checks (pass/warn/fail per check), error info (code/message/retryable)

  **Timeline tab**: Horizontal bar visualization of all steps. Each step shows as a colored bar positioned/sized proportionally to its start time and duration.

  **Security tab**: Filtered view of steps with security info. Shows checks with pass/warn/fail icons and any findings with amber AlertTriangle icons.

### 8.6 Audit Log Tab

Filterable table of `detailedAuditTrail` entries with:
- **Filters**: Status dropdown (All/Success/Error/Warning) + Category dropdown (All/Execution/Config/Access/Data/Alert)
- **9 Columns**: Timestamp (MMM D HH:MM:SS), Agent, User, Action (mono), Status, Category badge, Details (280px max, truncated), Duration, IP (mono)
- Security-relevant rows have colored left border (2px): error+security=red, warning+security=amber, other security=accent

### 8.7 Kill Confirm Dialog

Modal overlay with blur backdrop. Contains:
- Red-tinted header with OctagonX icon
- Agent info: status, name, version, 3-stat grid (Status, Runs Today, Error Rate)
- Active run details (if running): pulsing green dot, run ID, 2x2 grid (Triggered by, Started, Steps, Model), current step
- Security warnings (if flags > 0)
- Cancel + "Kill Agent" (red) buttons

### 8.8 Color Constants

**Node type colors**: trigger=#60a5fa, model=#a78bfa, tool=#2dd4bf, condition=#fbbf24, security=#f97316, action=#34d399, human=#f472b6, agent=#e8622c, report=#ef4444

**Status dot colors**: running=emerald-400, idle=text-muted, error=red-400, paused=yellow-400, killed=red-500

**Trigger badge colors**: scheduled=blue, manual=violet, webhook=emerald, event-driven=amber, api=cyan

---

## 9. Page: Agents List

**Route**: `/agents` — **File**: `src/app/agents/page.tsx` — **Client component**

### 9.1 Page Header
- Title: "Agents", Subtitle: "Manage and monitor your AI agents"
- Action: "New Agent" button (Plus icon, accent background)

### 9.2 Agent Stores Table

Card container (`bg-bg-secondary rounded-xl`) with:
- Header: "Agent Stores" (mono uppercase)
- Table with 6 columns: Store (name + source badge + truncated URL), Agents (count), Installed (count), Version, Sync (auto-update for kraken, sync button + update available badge for others), External link (hover-reveal)

**Source badges**: kraken = `text-accent/80 bg-accent/8` "Verified", community = muted, custom = muted

**Add Store Section** (bottom of table):
- GitBranch icon + URL input field + Connect button
- Input placeholder: `"github.com/org/kraken-agents"`
- Connect button activates when input has text

### 9.3 Agents Grid

`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4`

Each agent card (wrapped in `<Link href={/agents/${agent.id}}`):
- Header: Agent name + SourceBadge + Status indicator (colored dot + label)
- Description: 13px, line-clamp-2
- Divider
- Metrics row: Success Rate (%), Total Runs (formatted), Avg Latency (formatted)
- Footer: Trigger type tags (bg-bg-tertiary) + Version badge

**Status config**: running=emerald-400 "Running", idle=yellow-400 "Idle", paused=text-muted "Paused", error=red-400 "Error", killed=red-500 "Killed"

### 9.4 SourceBadge Component

Shared inline component showing icon + label. Props: `source: IntegrationSource`, `detail?: string`.
- kraken: BadgeCheck icon, text-accent, "Verified"
- community: GitFork icon, text-text-secondary, "Community" (or detail override)
- custom: Terminal icon, text-text-secondary, "Custom"

---

## 10. Page: Agent Detail

**Route**: `/agents/[id]` — **File**: `src/app/agents/[id]/page.tsx` — **Client component**

> Note: Currently hardcoded to `agents[0]` (Market Intelligence). In production, would use `useParams()` to resolve agent by ID.

### 10.1 Header
- Back link to `/agents` (ArrowLeft icon)
- Agent name (20px), version badge, "Published" badge (emerald), status indicator, SourceBadge
- Action buttons: Kill (red border), Dry Run (FlaskConical icon), Run Now (accent bg, Play icon), More (MoreHorizontal icon)

### 10.2 Tabs
Two tabs: **Builder** and **Runs**

### 10.3 Builder Tab

**ReactFlow Visualization** (520px height):
- 10 nodes from `marketIntelligenceFlow.nodes`, mapped to custom node type
- 10 edges with subtle white stroke and label styling
- Background: dot pattern (`rgba(255,255,255,0.05)`, gap 20, size 1)
- Controls (bottom-right), MiniMap (bottom-left)
- Non-interactive: `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`
- Zoom: 0.5–1.5, pan on scroll, fit view with 0.3 padding

**Custom Node Component**:
- Left handle (target) + Right handle (source): 8x8px, bg-elevated, border-default
- Node body: bg-elevated, border-default, rounded-lg, min-w-160px
- Left colored border (4px) using nodeTypeColors
- Content: type label (9px mono uppercase, colored) + node name (12px medium)

**Node Type Legend**: Flex row of all node types with colored squares and labels

**Agent Properties Section** (6-column grid):
- Trigger, Success Rate, Total Runs, Avg Latency, Permissions ("Workflow-defined"), Concurrency ("1 (sequential)")

### 10.4 Runs Tab

**Latest Execution**:
- Header: "Latest Execution" + success badge + "Total: 2.85s"
- Trace steps from `sampleTrace` array (8 steps): expandable rows with status icon, duration, input/output

**Run History**:
- 5 hardcoded runs with: status icon, time (HH:MM), "Market Intelligence", duration, token count

**TraceStepRow** (expandable):
- Colored dot (nodeTypeColors), node label, status icon, duration, chevron toggle
- Expanded: input/output blocks in bg-primary rounded boxes

---

## 11. Page: Pipelines

**Route**: `/pipelines` — **File**: `src/app/pipelines/page.tsx` — **Client component**

### 11.1 State
```typescript
selected: Pipeline | null     // Default: pipelines[0]
activeCluster: ComputeCluster // Default: computeClusters[0]
```

### 11.2 Page Header
- Title: "Pipelines", Subtitle: "Data transformation and ingestion workflows"
- Action: "New Pipeline" button (Plus icon)

### 11.3 Compute Selector

Card with Server icon, "Compute Cluster" title, cluster status indicator.

**Cluster dropdown** (3-column grid):
- Each cluster card shows: name, status badge, specs (vCPUs, GB, GPUs)
- Selected: accent border + accent bg

**Specs bar**:
- Cpu icon + vCPUs, MemoryStick + GB RAM, Zap + GPU info (conditional), Server + max concurrent
- Utilization progress bar: colored by percentage (>85%=red, 60-85%=yellow, <60%=green)

### 11.4 Pipeline List

Side panel (380px when selected, full width otherwise). Each `PipelineCard`:
- Name + status badge (colored dot + label)
- Description (line-clamp-2)
- Metrics: Clock + schedule, Play + last run (timeAgo), Timer + avg duration

### 11.5 Detail Panel (3 tabs)

**Header**: Pipeline name + status, Run Now button (Play icon), Close button (X icon)

**Code Tab**:
- File bar: `pipelines/{id}.py` + Copy button
- Python code viewer with syntax highlighting and line numbers
- Footer: "Python 3.12 · Kraken SDK v1.4.0" + line count + "Save & Deploy" button

**Python Syntax Highlighting** (PythonLine component):
- Keywords (violet-400/80): import, def, class, return, if, else, for, etc.
- Builtins (sky-400/70): print, len, range, int, str, list, etc.
- Strings (emerald-400/70): single/double/triple quotes, f-strings
- Decorators (amber-400/80): @-prefixed
- Numbers (orange-300/80)
- Comments (text-muted/60, italic)

**Run History Tab**:
- List of recent runs: status icon, time (HH:MM), records processed, duration, replay button

**Config Tab**:
- Schedule, Output Format, Avg Duration, Last Run, Next Run — each as label/value pairs with icons

---

## 12. Page: Models

**Route**: `/models` — **File**: `src/app/models/page.tsx` — **Client component**

### 12.1 Page Header
- Title: "Models", Subtitle: "Model provider configurations via LiteLLM proxy"
- Action: "Add Provider" button (Plus icon)

### 12.2 Provider Cards Grid

`grid grid-cols-1 lg:grid-cols-2 gap-4`

Each card (`bg-bg-secondary rounded-xl p-6`):
- **Header**: Provider name (18px) + status indicator (green dot "Active" or gray "Not configured")
- **API Key Status**: Check icon + "API key configured" (green) OR AlertTriangle + "API key required" (warning)
- **Available Models**: Label (10px mono uppercase) + model name badges (`bg-bg-tertiary text-text-secondary font-mono px-3 py-1 rounded-lg`)
- **Divider**
- **Metrics Grid** (3 columns): Total Requests (formatNumber), Total Tokens (formatNumber), Total Cost (formatCurrency) — all 16px mono with `metric-value` class
- **Configure Button** (only for inactive providers): Full-width, bordered, accent text on hover

Inactive cards have `opacity-60`.

---

## 13. Page: Usage

**Route**: `/usage` — **File**: `src/app/usage/page.tsx` — **No state, read-only**

### 13.1 Page Header
- Title: "Usage", Subtitle: "Platform resource consumption and cost tracking"

### 13.2 Summary Cards (4-column grid)

| Card | Value | Details |
|---|---|---|
| Active Agents | `X` (32px mono font-light) | "of Y" subtext |
| Runs This Month | formatted number | — |
| Tokens This Month | formatted tokens | "X in" and "X out" subtext |
| Cost This Month | formatted currency | — |

### 13.3 Model Token Allocation Card

- Stacked horizontal bar (`h-2 rounded-full`) with 6 colored segments:
  - Colors: `#6b9dd6`, `#9a86c8`, `#5bbfaa`, `#d4a65c`, `#c27e90`, `#72b58e`
- Usage text: `"X% of monthly allowance"` + `"Y remaining"`
- Legend: Flex wrap with colored dots, model names, and percentages

### 13.4 Pipeline Compute Card

Two-column layout with vertical divider:
- **Left**: Used hours (22px), progress bar (colored by barColor: >=90%=red, >=75%=warning, else accent), hour range labels, overage rate
- **Right**: "By Pipeline" list with per-pipeline hours, progress bars, run counts

### 13.5 Cost by Agent Card

- Header with total tokens in/out
- Per-agent rows: name, token breakdown (in/out), cost, progress bar (`bg-accent`)

---

## 14. Page: Integrations

**Route**: `/integrations` — **File**: `src/app/integrations/page.tsx` — **Client component**

### 14.1 State
```typescript
activeTab: "data-source" | "tool" | "action"
selected: Integration | null
storeUrl: string              // Add-store input
```

### 14.2 Page Header
- Title: "Integrations", Subtitle: "Connect data sources, tools, and actions to your agents"

### 14.3 Plugin Stores Section

4-column grid card showing all plugin stores. Each row: source badge + name, installed/total count, external link. Add store section at bottom with input + Connect button.

### 14.4 Category Tabs

Three buttons with icons and subscribed counts:
- Data Sources (Database icon), Tools (Wrench icon), Actions (Zap icon)

**Category colors**: data-source=#60a5fa, tool=#2dd4bf, action=#34d399

### 14.5 Integration List (left column)

Split into "Installed" (subscribed) and "Available" sections.

**Integration Row**: Colored avatar (first letter), name + source badge, type + last sync, status indicator (green/red/muted dot or "Off" label)

**Available Row**: Dashed border, hover-reveal "Add" button with ExternalLink icon

### 14.6 Detail Panel (right column, when selected)

- **Header**: Icon, name, type, version, Enable/Disable toggle (Power icon), Close (X)
- **Status bar**: Connection status, last sync with refresh icon, source badge
- **MCP Endpoint**: Globe icon + endpoint URL (if exists)
- **Description**: Full text
- **Configuration**: Settings2 icon + config fields as label/value pairs
  - Toggle fields: Custom toggle switches (9x5 rounded-full)
  - Text/secret fields: Bordered boxes (secrets in muted color)
- **Footer**: "MCP Adapter" or "Native" label, version, "Save Changes" button

Width: 360px when selected, list contracts accordingly.

---

## 15. Page: Settings

**Route**: `/settings` — **File**: `src/app/settings/page.tsx` — **Client component**

### 15.1 Tab Navigation

5 tabs with icons:
| Tab | Icon | Key |
|---|---|---|
| General | Settings2 | general |
| Team | Users | team |
| API Keys | Key | apiKeys |
| Governance | Shield | governance |
| Notifications | Bell | notifications |

Active: `text-text-primary border-b-2 border-accent font-medium`

### 15.2 General Tab

"Platform Configuration" heading. Form fields (max-w-2xl):
- Platform Name: "Acme Electronics" (text input)
- Platform URL: "https://kraken.acme-electronics.com" (text input)
- Default Timezone: UTC (select)
- Trace Retention: 30 days (select)
- "Save Changes" button

Input styling: `bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-[13px] focus:border-accent/50`

### 15.3 Team Tab

"Team Members" heading + "Invite Member" button (Plus icon).

Table (`bg-bg-secondary rounded-xl`):
- Columns: Name, Email (mono), Role (badge), Last Active (timeAgo)
- Role badges: admin=`bg-accent/15 text-accent`, editor=`bg-bg-tertiary text-text-secondary`, viewer=`bg-bg-tertiary text-text-muted`

### 15.4 API Keys Tab

"API Keys" heading + "Generate New Key" button (Key icon).

Card list. Each card:
- Key name (14px medium), prefix display (`{prefix}••••••••` in mono + Copy icon)
- Metadata: Created date + Last used (timeAgo)
- Permissions as badge array (`text-[10px] font-mono bg-bg-tertiary`)

### 15.5 Governance Tab

**Card 1 — Kill Switch & Guardrails**:
- Global Kill Switch: toggle (default off) + "Immediately halt all running agents"
- Max Cost per Hour: "$100" (text input)
- Max Error Rate: "15%" (text input)
- Anomaly Detection: toggle (default on) + "Auto-pause agents on unusual behavior patterns"

**Card 2 — Compliance**:
- Audit Log Export: "Export" link + "Download complete audit trail as CSV"
- Retention Policy: "90 days — Standard" (select)

**Toggle component**: 9x5 (`w-9 h-5`) rounded-full. Off: bg-bg-tertiary. On: bg-accent. White knob with position transition.

### 15.6 Notifications Tab

**Notification Channels** card:
| Channel | Configured |
|---|---|
| Email (SMTP) | Yes (green dot) |
| Slack | Yes |
| Microsoft Teams | No (gray dot) |
| Custom Webhook | Yes |

**Alert Rules** card list:
| Rule | Severity | Channels |
|---|---|---|
| Agent failure | critical (red badge) | Email, Slack, Teams, Webhook |
| Error rate threshold | warning (amber badge) | Slack, Email |
| Cost threshold | warning | Email |

Severity badges: critical=`bg-red-400/15 text-red-400`, warning=`bg-amber-400/15 text-amber-400`

---

## Appendix: Icon Usage Reference

All icons come from `lucide-react`. Standard size: 12–16px, stroke width: 1.5.

| Icon | Pages Used | Purpose |
|---|---|---|
| Activity | Sidebar, Observability | Observability nav, Runs tab |
| AlertTriangle | Observability, Models, Agent Detail | Warnings, security flags |
| ArrowLeft | Agent Detail | Back navigation |
| ArrowRight | Agents, Integrations | Connect buttons |
| ArrowUpCircle | Agents | Update available indicator |
| BadgeCheck | Agents, Integrations | Kraken verified badge |
| Bar Chart3 | Sidebar | Usage nav |
| Bell | Sidebar, Settings | Notifications |
| Cable | Sidebar | Integrations nav |
| Calendar | Pipelines | Schedule config |
| CheckCircle2 | Observability, Pipelines, Agent Detail | Success status |
| ChevronDown | Observability, Pipelines | Dropdowns, expand |
| ChevronRight | Observability, Agent Detail | Collapse |
| Clock | Observability, Pipelines | Pending status, schedule |
| Copy | Pipelines, Settings | Copy to clipboard |
| Cpu | Sidebar, Pipelines | Agents nav, CPU specs |
| Database | Integrations | Data source tab |
| Download | Observability | Export button |
| ExternalLink | Agents, Integrations | External links |
| FileOutput | Pipelines | Output format |
| FlaskConical | Agent Detail | Dry run button |
| GitBranch | Agents, Integrations | Add store |
| GitFork | Agents, Integrations | Community source |
| Globe | Integrations | MCP endpoint |
| Key | Settings | API keys tab |
| Link | Agents, Integrations | URL input prefix |
| Loader2 | Observability | Running spinner |
| MemoryStick | Pipelines | RAM specs |
| MoreHorizontal | Agent Detail | More menu |
| OctagonX | Observability | Kill agent |
| Package | Integrations | Plugin count |
| Play | Pipelines, Agent Detail | Run now |
| Plus | Agents, Models, Pipelines, Settings | New/add buttons |
| Power | Integrations | Enable/disable |
| RefreshCw | Agents, Integrations | Sync/refresh |
| RotateCcw | Pipelines | Replay run |
| Server | Pipelines | Cluster/compute |
| Settings2 | Settings, Integrations | General tab, config |
| Shield | Sidebar, Observability, Settings | Security, governance |
| SkipForward | Observability | Skipped status |
| SlidersHorizontal | Sidebar | Settings nav |
| Sparkles | Sidebar | Models nav |
| StopCircle | Agent Detail | Kill button |
| Store | Integrations | Plugin stores |
| Terminal | Agents, Integrations | Custom source |
| Timer | Pipelines | Duration |
| Users | Settings | Team tab |
| Workflow | Sidebar | Pipelines nav |
| Wrench | Integrations | Tools tab |
| X | Pipelines, Integrations | Close panel |
| XCircle | Observability, Pipelines, Agent Detail | Error status |
| Zap | Pipelines, Integrations | GPU specs, actions tab |
