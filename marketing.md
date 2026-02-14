# Kraken AI — Landing Page Recording Guide

## Page Flow

1. Hero
2. Logo Garden
3. Observe Everything
4. Build Visually
5. Connect Anything
6. Run & Scale
7. Govern & Control
8. Testimonials + Final CTA

**Style reference:** [cursor.com/product](https://cursor.com/product) — terse titles (2-4 words), single-sentence descriptions, one visual per feature, dark theme.

---

## Hero

**Title:** "The operating system for enterprise AI agents"
**Subtitle:** "Build, observe, govern, and scale autonomous agents — all from one platform."

**Record:** Full Observability dashboard (`/`) — agent table + 4 metric charts, sidebar visible, time range on "7d". Screenshot or 3-5s slow pan.

---

## 1. Observe Everything

> "Complete visibility into every agent, every run, every token."

### 1A. Real-time Metrics
Monitor API calls, latency, token usage, and cost across every agent in one dashboard.

**Record (5-8s video):** `/` — click through time ranges 24h → 7d → 30d, crop to chart grid only.

### 1B. Execution Traces
Step-by-step visibility into every agent run — from trigger to model call to tool invocation.

**Record (12-15s video):** `/` Runs & Traces tab — select a run, expand trace steps (model call → tool call), switch to Timeline tab, then Security tab.

### 1C. Immutable Audit Trail
Every agent action logged for compliance — filterable by status, category, and user.

**Record (5-7s video):** `/` Audit Log tab — apply "error" status filter, then "security" category filter.

---

## 2. Build Visually

> "Design agent workflows with code or canvas — your choice."

### 2A. Visual Workflow Builder ★ Hero feature
Drag-and-drop agent logic with model calls, tool invocations, conditions, and human-in-the-loop breakpoints.

**Record (10-15s video):** `/agents/[id]` Builder tab — start zoomed out on full graph, zoom into a model node, pan to tool call node (animated edge), pan to human-in-the-loop node, zoom back out. Keep node legend visible.

### 2B. Agent Stores
Install pre-built agents from official, community, and custom repositories — or build your own.

**Record (6-8s video):** `/agents` — show stores table, scroll to agent cards grid, hover a card.

### 2C. Run & Debug
Execute agents manually, trigger dry runs, and inspect every step in real time.

**Record (6-8s video):** `/agents/[id]` Runs tab — show latest execution with expanded trace, scroll to run history.

---

## 3. Connect Anything

> "One integration layer for data, tools, and actions — powered by MCP."

### 3A. Unified Integrations
Connect data sources, tools, and actions through a single interface built on Model Context Protocol.

**Record (10-12s video):** `/integrations` — click through Data Sources → Tools → Actions tabs, select an integration, show config panel.

### 3B. Plugin Stores
Browse and install integrations from Kraken's official store, community repos, or your own.

**Record (screenshot):** `/integrations` top section — store grid + "Add Store" form.

### 3C. Multi-Model Support
Connect any LLM provider — OpenAI, Anthropic, Google, or self-hosted — through a unified proxy.

**Record (screenshot):** `/models` — provider cards with model badges and metrics.

---

## 4. Run & Scale

> "From data pipelines to compute clusters — production-grade infrastructure."

### 4A. Data Pipelines
Write Python pipelines with syntax highlighting, deploy to compute clusters, and track every run.

**Record (10-12s video):** `/pipelines` — select a pipeline, show Code tab (Python syntax), switch to Run History, open cluster selector.

### 4B. Usage & Cost Tracking
Track token allocation, compute hours, and per-agent costs — with overage alerts.

**Record (8-10s video):** `/usage` — smooth slow scroll from summary cards through token allocation → pipeline compute → cost-by-agent chart.

---

## 5. Govern & Control

> "Enterprise-grade governance, safety, and access control."

### 5A. Kill Switches & Guardrails ★ Key differentiator
Stop any agent instantly — with automatic guardrails for cost, error rates, and anomaly detection.

**Record (2 screenshots):**
1. `/` — click Kill on a running agent, capture the confirmation dialog
2. `/settings` Governance tab — kill switch toggles, thresholds, compliance section

### 5B. Team & RBAC
Role-based access control with admin, editor, and viewer roles — plus API key management.

**Record (5-6s video):** `/settings` Team tab → API Keys tab.

### 5C. Alerts & Notifications
Route alerts to Slack, Teams, email, or webhooks — with configurable severity rules.

**Record (screenshot):** `/settings` Notifications tab — channels + alert rules table.

---

## Recording Checklist

| # | Feature | Type | Duration | Route |
|---|---|---|---|---|
| Hero | — | Screenshot/pan | 3-5s | `/` |
| 1A | Real-time Metrics | Video | 5-8s | `/` |
| 1B | Execution Traces | Video | 12-15s | `/` Runs & Traces |
| 1C | Audit Trail | Video | 5-7s | `/` Audit Log |
| 2A | Workflow Builder | Video | 10-15s | `/agents/[id]` Builder |
| 2B | Agent Stores | Video | 6-8s | `/agents` |
| 2C | Run & Debug | Video | 6-8s | `/agents/[id]` Runs |
| 3A | Integrations | Video | 10-12s | `/integrations` |
| 3B | Plugin Stores | Screenshot | — | `/integrations` |
| 3C | Multi-Model | Screenshot | — | `/models` |
| 4A | Pipelines | Video | 10-12s | `/pipelines` |
| 4B | Usage Tracking | Video | 8-10s | `/usage` |
| 5A | Kill Switches | Screenshot x2 | — | `/` + `/settings` |
| 5B | Team & RBAC | Video | 5-6s | `/settings` |
| 5C | Alerts | Screenshot | — | `/settings` |

**Total: 10 videos + 6 screenshots**

## Recording Order (by page, to minimize navigation)

1. **`/`** — Hero, 1A, 1B, 1C, 5A kill dialog
2. **`/agents` + `/agents/[id]`** — 2B, 2A, 2C
3. **`/integrations`, `/models`, `/pipelines`, `/usage`** — 3A, 3B, 3C, 4A, 4B
4. **`/settings`** — 5A governance, 5B, 5C

## Screen.studio Tips

- Record at 1440x900+ Retina. Export MP4 for video, PNG for screenshots.
- Use cursor smoothing + spotlight effect for polish.
- Use zoom-to-area for detail moments (trace steps, chart labels).
- Record at natural speed, speed-ramp slow on key moments (dialog appears, step expands).
- Crop sidebar out for feature clips. Only show sidebar in the hero shot.
