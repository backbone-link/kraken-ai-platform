# Research: Recursion Feature (Agent Sub-Agent Spawning)

Research conducted across 15 parallel agents covering: Claude Code teams/tasks architecture, CrewAI/AutoGen/LangGraph/OpenAI Agents SDK patterns, orchestration UX, visual workflow builders, and agent lifecycle management.

---

## Current Codebase State

Frontend-only Next.js 16 mock. No backend, no database, no auth. All data from `src/data/mock.ts`.

### Key Files for This Feature

| File | Role | What Changes |
|---|---|---|
| `src/app/agents/[id]/page.tsx` | Agent detail (2004 lines). Three tabs: **Builder**, **Runs**, **Identity**. Uses React Flow canvas, trace drill-down, execution simulation | Add 4th **"Team"** tab. Add sub-agent trace drill-down to Runs tab |
| `src/app/agents/page.tsx` | Agent list page with status cards | Add team badge to agents with recursion enabled |
| `src/data/mock.ts` | All types + mock data: 5 agents, `AgentConfig`, `AgentRun`, `FlowNode`, `FlowEdge`, etc. | Add recursion types + mock team execution data |
| `src/app/observability/page.tsx` | Metrics, runs/traces, timeline, security, audit log (1258 lines) | Sub-agent runs appear as child spans in trace timeline |
| `src/hooks/use-execution-simulation.ts` | Agent run simulation with node-level execution states | May extend for sub-agent simulation |
| `src/components/agent-config-panel.tsx` | Slide-out config panel for agent settings | Add recursion config fields |

### Design System Reference

- Dark-mode only. `--color-bg-primary: #080808`, `--color-accent: #e8622c` (orange)
- Glassmorphic cards: `bg-white/[0.04] border border-white/[0.06] rounded-xl`
- Fonts: Geist Sans, Geist Mono, Instrument Serif
- Motion (Framer Motion successor) for animations, `@xyflow/react` for flow visualization
- Sidebar nav items: `px-2.5 py-[6px] rounded-md text-[13px]`, active = `bg-white/[0.13] text-white/95`
- Existing node types: trigger, model, tool, condition, security, action, human, agent, report
- There's already an "agent" node type in the builder (invokes sub-agent) -- this provides a natural hook for the recursion feature

---

## Architecture: Two-Tier Orchestrator-Worker

Every major platform (Claude Code, CrewAI, AutoGen, LangGraph, OpenAI Agents SDK) caps recursion at **depth 1**. Sub-agents cannot spawn sub-agents. This prevents runaway costs and keeps UX manageable.

### How Other Platforms Do It

**Claude Code** (closest to what we want):

| | Sub-agents (Tasks) | Agent Teams |
|---|---|---|
| **Weight** | Lightweight, single session | Full parallel, separate instances |
| **Communication** | Results return to caller only | Direct messaging between teammates |
| **Coordination** | Main agent manages everything | Shared task list, self-coordination |
| **Recursion** | Cannot spawn sub-sub-agents | Cannot spawn sub-teams |
| **Cost** | Lower (results summarized) | Higher (each is full instance) |

**CrewAI**: Hierarchical "manager" agent delegates to workers. Sequential, parallel, or conditional processing. Explicit role/goal/backstory per agent.

**AutoGen Studio**: Drag-and-drop team canvas. Typed "drop zones" -- agents, models, tools dropped onto a team node.

**LangGraph Studio**: Graph-based. Subgraph expansion -- click to zoom into a nested graph. State passed between nodes.

**OpenAI Agents SDK**: "Handoff" model -- one agent passes the baton to another. Simplest mental model.

### Recommended Architecture

Two tiers:

**Tier 1 -- Tasks (lightweight sub-agents)**
- Agent spawns focused, short-lived sub-tasks that return results
- Fan-out/fan-in: parent dispatches N tasks in parallel, collects results
- Sub-task gets its own context window but cannot spawn further sub-tasks
- Communication: results return to caller only (no peer messaging)
- Use case: "Research these 5 topics in parallel and summarize"

**Tier 2 -- Teams (full parallel coordination)**
- Agent creates a team with a lead + workers
- Workers have a shared task list and direct messaging
- Lead coordinates via task assignment, workers self-organize
- Cannot spawn sub-teams (depth 1)
- Use case: "Assemble a team to handle this complex multi-step project"

### Key Design Decisions

- **Max depth: 1** -- industry consensus
- **Resource limits per spawn**: token budget, time limit, max concurrent workers (configurable per agent in config panel)
- **Error handling**: orchestrator decides retry/fallback/escalation when sub-agent fails
- **Observability**: OpenTelemetry-style distributed tracing. Each sub-agent run is a child span of the parent run
- **Lifecycle**: spawned agents are ephemeral -- exist only for parent task duration

---

## Data Model

Add to `src/data/mock.ts`:

```ts
// ─── Recursion Types ───

type RecursionMode = "tasks" | "teams" | "both";
type SubAgentRole = "task" | "team-lead" | "team-worker";
type SubAgentStatus = "pending" | "running" | "completed" | "failed";

interface RecursionConfig {
  enabled: boolean;
  mode: RecursionMode;
  maxConcurrentWorkers: number;       // e.g. 5
  maxTokenBudgetPerWorker: number;    // e.g. 50000
  maxDurationPerWorker: number;       // seconds, e.g. 120
  allowedWorkerAgentIds: string[];    // which agents can be spawned as workers
}

interface SubAgentRun {
  id: string;
  parentRunId: string;
  agentId: string;
  agentName: string;
  role: SubAgentRole;
  status: SubAgentStatus;
  startedAt: string;
  duration: number;
  tokensUsed: number;
  cost: number;
  result?: string;                    // summary of output
}

interface TeamExecution {
  id: string;
  parentRunId: string;
  leadAgentId: string;
  workerAgentIds: string[];
  taskList: TeamTask[];
  messages: TeamMessage[];
  status: "active" | "completed" | "failed";
  startedAt: string;
  duration: number;
  totalTokens: number;
  totalCost: number;
}

interface TeamTask {
  id: string;
  subject: string;
  description: string;
  assignedTo?: string;                // agent ID
  status: "pending" | "in_progress" | "completed";
}

interface TeamMessage {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId?: string;                 // undefined = broadcast
  content: string;
  timestamp: string;
}
```

Also extend the existing `AgentConfig` type to include `recursion?: RecursionConfig`.

### Mock Data to Create

- Enable recursion on 2 of the existing 5 agents (e.g., the most complex ones)
- Create 3-4 `SubAgentRun` records per enabled agent
- Create 1-2 `TeamExecution` records with task lists and messages
- Mix statuses: completed, failed, and one currently running

---

## UI Specification

### Where Recursion Lives

**NOT a new top-level page.** Recursion is an agent capability, so it lives inside the agent detail page.

### 1. Agent Detail Page -- New "Team" Tab

Add a 4th tab in `src/app/agents/[id]/page.tsx` alongside Builder / Runs / Identity:

**Tab: Team**

Top section -- Configuration:
```
Team Configuration
──────────────────────────────────────────
Mode: [Tasks ▾]     Max Workers: [5]
Token Budget/Worker: [50,000]
Timeout/Worker: [120s]

Allowed Worker Agents
┌────────────────────────────────────┐
│ ☑ Data Enrichment Agent            │
│ ☑ Research Agent                   │
│ ☐ Compliance Monitor               │
│ ☐ Pipeline Scheduler               │
└────────────────────────────────────┘
```

Bottom section -- Recent Executions (accordion pattern):
```
Recent Team Executions
──────────────────────────────────────────
▸ Run #1847 — 3 workers — ✓ Completed (2m 14s)
▾ Run #1842 — 5 workers — ✓ Completed (4m 02s)
  ┌───────────────────────────────────────┐
  │ ● Research Agent      ✓ Done  1m 02s │
  │ ● Data Enrichment     ✓ Done  2m 14s │
  │ ● Data Enrichment     ✓ Done  1m 48s │
  │ ● Research Agent      ✓ Done  0m 58s │
  │ ● Research Agent      ✗ Failed 0m 12s│
  └───────────────────────────────────────┘
▸ Run #1838 — 2 workers — ✗ Failed
```

Clicking a sub-agent row opens the trace viewer (reuse the existing `TraceStep` viewer from the Runs tab).

### 2. Agent Cards -- Team Badge

On `src/app/agents/page.tsx`, agents with recursion enabled show a small icon badge (e.g., `GitFork` from lucide-react, or a custom team icon). Place it near the status indicator on the card.

### 3. Runs Tab -- Sub-Agent Traces

When viewing a run that spawned sub-agents in the existing Runs tab:
- Show a collapsible "Sub-tasks" section below the main trace
- Each sub-task row: agent name, status chip, duration, token count
- Click to expand and see the sub-agent's own trace steps
- Breadcrumbs when drilled in: `Agent Name > Run #1842 > Research Agent (worker-2)`

### 4. Observability Page

Sub-agent runs appear as indented child rows in the runs table on `src/app/observability/page.tsx`. Same status chips and metrics as parent runs.

### Status Indicators (Consistent Across All Views)

| State | Visual |
|---|---|
| Pending | Gray dot, muted text |
| Running | Pulsing orange dot + activity label (e.g., "Searching docs...") |
| Completed | Green checkmark |
| Failed | Red X |

These match the existing patterns in the observability page.

---

## UX Principles for This Feature

- **Accordion/drill-down** for execution history, NOT nested graph visualization. ComfyUI is the cautionary tale -- max flexibility without progressive disclosure is intimidating
- **Progressive disclosure**: show summary first (N workers, overall status, duration), expand for details
- **Reuse existing components**: trace viewer, status chips, glassmorphic cards, config panel patterns
- **Breadcrumbs**: essential for navigating parent → sub-agent → trace hierarchies
- **Resource awareness**: always show token usage and cost at every level (parent run total, per-worker breakdown)

---

## Implementation Order

1. Add types to `src/data/mock.ts` (`RecursionConfig`, `SubAgentRun`, `TeamExecution`, `TeamTask`, `TeamMessage`)
2. Extend `AgentConfig` with optional `recursion` field
3. Add mock data: enable recursion on 2 agents, create sub-agent runs and team executions
4. Add "Team" tab to `src/app/agents/[id]/page.tsx`
5. Build Team tab UI: config section + accordion execution list
6. Add sub-agent trace drill-down to existing Runs tab
7. Add team badge to agent cards on `src/app/agents/page.tsx`
8. Add breadcrumb component for nested navigation
