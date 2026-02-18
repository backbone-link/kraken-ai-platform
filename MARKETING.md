# Kraken AI — Screen Recording Guide

Single continuous click-through video following the sidebar top-to-bottom. ~60-90s total.

**Style reference:** [cursor.com/product](https://cursor.com/product) — dark theme, terse.

---

## Video: Full Platform Walkthrough (~60-90s)

### 1. Agents (~15s)

`/agents` → `/agents/[id]`

1. Start on agent list — show marketplace table, scroll to agent cards grid, hover a card
2. Click into agent → **Builder** tab — zoomed-out graph, zoom into model node, pan to tool call (animated edge), pan to human-in-the-loop node, zoom back out
3. Switch to **Runs** tab — show latest execution with expanded trace
4. Switch to **Swarm** tab — show config (mode, workers, budget), expand a recent execution
5. Switch to **Memory** tab — show attached memories with type/role badges

### 2. Pipelines (~5s)

`/pipelines`

1. Expand compute cluster selector, select a pipeline
2. Show **Code** tab (Python syntax), switch to **Run History**

### 3. Models (~5s)

`/models`

1. Show provider cards (OpenAI, Anthropic, Meta, Google) with model badges and metrics

### 4. Observability (~15s)

`/observability`

1. Start on dashboard — click through time ranges 1h → 7d → 30d (charts update)
2. Switch to **Runs & Traces** tab — select a run, expand trace steps (model → tool → security)
3. Switch to **Incidents** tab — show summary metrics, expand a critical incident

### 5. Usage (~5-10s)

`/usage`

1. Show API usage card (spend vs. allowance, plan badge, progress bar)
2. Slow scroll through summary metrics, **Usage by Model** + **Cost by Agent**
3. Finish on **Pipeline Compute** section

### 6. Integrations (~10s)

`/integrations`

1. Click through **Data Sources → Tools → Actions → Skills** tabs, select an integration to show config panel
2. Show marketplace table + **MCP server** connection panel

### 7. Governance (~10s)

`/governance`

1. **Guardrails** tab — show global kill switch toggle, cost/error thresholds, anomaly detection
2. **Policies** tab — filter by type, expand a policy to show rules + attachments
3. **JIT** tab — show active sessions with progress bars

### 8. Settings (~5s)

`/settings`

1. **Accounts** tab — show directory + roles
2. Switch to **API Keys** tab

---

## Screen.studio Tips

- Record at 1440x900+ Retina. Export MP4.
- Cursor smoothing + spotlight effect.
- Zoom-to-area for detail moments (trace steps, chart labels, policy rules).
- Natural speed, speed-ramp slow on key moments (dialog appears, step expands).
- Keep sidebar visible throughout to show navigation context.
