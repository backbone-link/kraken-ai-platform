# Kraken AI — Implementation Guide

> Implementation strategy for the Kraken AI platform. For exact data shapes, mock values, and styling, refer to the source files in `src/`.

---

## Overview

**Kraken AI** is an enterprise AI agent orchestration platform — a dark-themed, Apple-esque Next.js dashboard for managing AI agents, data pipelines, model providers, integrations, and platform settings.

**Fictional tenant**: Acme Electronics — e-commerce company running agents for market intelligence, inventory management, demand forecasting, customer support triage, and price optimization.

**Long-running agents**: The Demand Forecasting agent is deliberately configured with ~65-minute runtimes to prove the platform handles long-running executions. All related durations, timestamps, token counts, and costs are consistent with this profile.

---

## Design System

> Tokens and animations: `src/app/globals.css`

Three fonts via `next/font/google`: **Geist Sans** (body), **Geist Mono** (metrics/code), **Instrument Serif** (display headings).

Accent color is burnt orange (`#e8622c`). Status colors: emerald=success, amber=warning, red=error. Borders use very low opacity whites (4–15%). 13px default font, monospace for data. Glassmorphism cards with backdrop blur. Subtle grain texture overlay across the entire viewport.

Key CSS features beyond tokens: dark-themed Recharts and React Flow overrides, execution visualization animations (node glow states, marching-ants edges, badge pulse, staggered trace step entrances), custom scrollbar, text selection tinting.

---

## Data Model

> All types and data: `src/data/mock.ts` — Utilities: `src/lib/utils.ts`

5 agents (3 kraken-verified, 2 community), 3 agent stores, 33 integrations (6 data sources, 6 tools, 7 actions, 14 skills), 4 pipelines with Python source, 4 model providers (OpenAI, Anthropic, Meta via LiteLLM, Google), 15 detailed agent runs with full trace steps.

Key design decisions in the data model:
- **Integration sources**: Every agent, integration, and store has a `source` field (`kraken | community | custom`) with optional `sourceDetail` to show provenance.
- **Skills as integrations**: Skills are a 4th integration category alongside data-source/tool/action. They carry `skillContent` (rendered markdown) and `githubUrl`.
- **Trace step status**: Includes `"pending"` for steps not yet reached, enabling the builder to show upcoming steps during live execution.
- **Node types**: 9 types (trigger, model, tool, condition, security, action, human, agent, report) each with distinct colors and node component styling.
- **Flow node configs**: Per-agent, per-node configuration data (system prompts, selected tools, selected skills) for model nodes in the builder.

---

## Layout

> Sidebar: `src/components/layout/sidebar.tsx` — Page header: `src/components/layout/page-header.tsx`

Fixed 240px sidebar with brand logo ("Kraken AI"), main nav (Observability, Agents, Pipelines, Models, Usage), system nav (Integrations, Settings), and bottom section (notifications badge + user profile). Active route uses exact match for `/`, prefix match for others.

Reusable `PageHeader` component takes `title`, `subtitle?`, and `actions?` (ReactNode).

---

## Observability Dashboard (`/`)

> `src/app/page.tsx` — client component wrapped in `<Suspense>` for `useSearchParams`

The main dashboard stacks vertically:

1. **Agent Selector Table** — 11-column table of all agents with metrics (invocations, calls, error rate, avg duration, tokens, cost, last/next run, security flags, kill button). Row click filters the entire page to that agent.

2. **Charts** — 2x2 grid: API Calls (stacked area), Run Duration (line with avg + P99), Token Usage (bar with in/out), Daily Cost (area). All filter when an agent is selected.

3. **Runs & Traces** — Split-panel list/detail. Run list shows status, agent, trigger badge (colored by type), duration, cost. Trace detail has three sub-tabs:
   - **Trace**: Expandable step rows with node-type color coding, execution badges ("EXECUTING" for running steps), model/tool/security/error info on expand. Running steps glow blue. Staggered entrance animation. Supports deep-link highlighting.
   - **Timeline**: Horizontal bars proportional to step durations with animated fill.
   - **Security**: Filtered view of steps that have security checks (pass/warn/fail).

4. **Audit Log** — Filterable table (status + category dropdowns) with 9 columns. Security-relevant rows get colored left borders.

5. **Kill Confirm Dialog** — Modal with agent info, active run details, security warnings, cancel/kill buttons.

**Deep-linking**: Reads `?runId=X&stepId=Y` from URL. Auto-selects agent, run, and highlights the target step. This enables clicking executing nodes in the Builder to jump directly to the corresponding trace.

---

## Agents List (`/agents`)

> `src/app/agents/page.tsx`

1. **Agent Stores Table** — Table of connected stores showing name, source badge, GitHub URL, agent/installed counts, version, update status (Auto for kraken, version available, or "On latest"). Bottom: URL input to connect new stores.

2. **Agent Cards Grid** — 3-column responsive grid. Each card links to `/agents/[id]` and shows: name + source badge, status indicator, description, metrics (success rate, total runs, avg duration), trigger tags, version.

**SourceBadge**: Shared component — kraken shows BadgeCheck "Verified", community shows GitFork, custom shows Terminal.

---

## Agent Detail (`/agents/[id]`)

> `src/app/agents/[id]/page.tsx`

The most complex page. Two tabs: **Builder** and **Runs**.

### Builder Tab

**ReactFlow canvas** rendering the agent's pipeline graph with three custom node components:
- **Custom node** (trigger, condition, security, action, human, agent, report): Colored left border, type icon + label, node name. Security nodes have an extra "kill" handle.
- **ModelNode** (model): Purple-themed, larger, 4 handles (left/right + top/bottom for tool connections), subtle purple glow.
- **ToolNode** (tool): Teal pill shape, dashed border, connects via top/bottom handles to model nodes.

**Edge types**: Standard (white 20%), tool calls (animated dashed teal), KILL paths (red dashed with arrow marker), and animated execution edges (blue stroke with traveling circle dot).

**Execution simulation** (`src/hooks/use-execution-simulation.ts`): When an agent has a running run, the hook steps through trace steps via setTimeout. Each step transitions the previous node to completed/error, sets current to executing, and lights up the connecting edge. Model steps use 10s duration, others 1.8s. Nodes glow blue (executing), green (completed), red (error). Clicking executing/completed nodes deep-links to Observability via `/?runId=X&stepId=Y`.

**Run Info Bar**: Glass overlay at top of canvas showing live indicator, run ID, step progress ("Step X of Y"), elapsed time.

**Component Palette**: Row of draggable cards (one per node type). Drag onto canvas to create new nodes. New nodes are draggable and auto-open the config panel.

**Node Config Panel**: Side panel for configuring nodes — title input, and for model nodes: model selector dropdown, system prompt textarea, toggleable tool/skill pill buttons.

**Agent Properties**: 6-column grid below canvas (trigger, success rate, runs, duration, permissions, concurrency).

### Runs Tab

- **Latest Execution**: Trace view of most recent run with expandable step rows (status icon, duration, input/output on expand). Kill reason banner if applicable.
- **Run History**: Chronological list of all runs with status, time, duration, tokens, kill badge.

---

## Pipelines (`/pipelines`)

> `src/app/pipelines/page.tsx`

1. **Compute Cluster Selector** — 3 clusters (general/cpu-optimized/gpu-accelerated) with specs and utilization bar colored by load.

2. **Pipeline List** — Side panel cards with name, status, schedule, last run, avg duration.

3. **Detail Panel** with 3 tabs:
   - **Code**: Python source with custom syntax highlighting (`PythonLine` component handles keywords, strings, decorators, comments, numbers) and line numbers.
   - **Run History**: Recent runs with status, records processed, duration.
   - **Config**: Schedule, output format, duration, run times.

---

## Models (`/models`)

> `src/app/models/page.tsx`

2-column grid of provider cards: name + status, model name badges, metrics (requests, tokens, cost), configure button. Inactive providers use dashed border style.

---

## Usage (`/usage`)

> `src/app/usage/page.tsx` — read-only, no state

1. **Summary Cards** — 4-column: active agents, runs this month, tokens (in/out), cost
2. **Model Token Allocation** — Stacked horizontal bar (6 colored segments per model) + legend
3. **Pipeline Compute** — Split: used hours with progress bar vs. per-pipeline breakdown
4. **Cost by Agent** — Per-agent rows with token breakdown, cost, progress bar

---

## Integrations (`/integrations`)

> `src/app/integrations/page.tsx`

1. **Plugin Stores** — Grid of connected stores with add-store URL input.

2. **Category Tabs** — Data Sources, Tools, Actions, Skills — each with distinct color (`data-source=#60a5fa`, `tool=#2dd4bf`, `action=#34d399`, `skill=#c084fc`) and subscribed count.

3. **Integration List** — Split into "Installed" and "Available". Each row: colored avatar, name + source badge, type, status. Available items have hover-reveal "Add" button.

4. **Detail Panel** (360px):
   - Enable/disable toggle, status bar, MCP endpoint, GitHub URL (skills)
   - Config fields (text/secret/select/toggle)
   - Skills show a "Clean" security badge and render `skillContent` markdown via `RenderedMarkdown` component (headings, code blocks, inline code, bold, lists) instead of the description.

---

## Settings (`/settings`)

> `src/app/settings/page.tsx`

5 tabs:

- **General**: Platform name, URL, timezone, trace retention form fields
- **Team**: Member table (name, email, role badge, last active) + invite button
- **API Keys**: Card list with name, masked prefix, permissions badges
- **Governance**: Kill switch toggle, cost/error rate limit inputs, anomaly detection toggle, audit export
- **Notifications**: Channel status grid (Email, Slack, Teams, Webhook) + alert rules with severity badges (critical=red, warning=amber)
