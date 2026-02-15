# Research: Memory Feature (Shared Agent Memory with IAM)

Research conducted across 15 parallel agents covering: Letta/MemGPT, CrewAI, Zep, Mem0, Claude/ChatGPT memory patterns, enterprise IAM (zero trust, RBAC/ABAC, OPA, Vault), data isolation (RLS, multi-tenant, capability-based), summarization leak attacks, and Apple design principles for complex configuration.

---

## Current Codebase State

Frontend-only Next.js 16 mock. No backend, no database, no auth. All data from `src/data/mock.ts`.

### Key Files for This Feature

| File | Role | What Changes |
|---|---|---|
| `src/components/layout/sidebar.tsx` | Navigation: `mainNav[]` and `systemNav[]` arrays | Add "Memory" to `mainNav` |
| `src/data/mock.ts` | All types + mock data | Add memory types + mock memory instances |
| `src/app/agents/[id]/page.tsx` | Agent detail page (Builder/Runs/Identity tabs) | Add "Attached Memory" section |
| `src/app/agents/page.tsx` | Agent list with cards | Optionally show memory count on cards |
| `src/app/settings/page.tsx` | Settings with Accounts/Roles & Permissions section | Memory access policies could extend existing permissions UI |

### New Files to Create

| File | Purpose |
|---|---|
| `src/app/memory/page.tsx` | Memory list page -- card grid with filters |
| `src/app/memory/[id]/page.tsx` | Memory detail page -- content blocks, agents, access, history |

### Design System Reference

- Dark-mode only. `--color-bg-primary: #080808`, `--color-accent: #e8622c` (orange)
- Glassmorphic cards: `bg-white/[0.04] border border-white/[0.06] rounded-xl`
- Fonts: Geist Sans, Geist Mono, Instrument Serif
- Motion for animations
- Sidebar nav items: `px-2.5 py-[6px] rounded-md text-[13px]`, active = `bg-white/[0.13] text-white/95`
- Existing patterns to reuse: card grids (agents page, integrations page), tab navigation, slide-out panels

---

## Architecture: Block-Based with Hierarchical Scoping

### How Other Platforms Do It

| Platform | Approach | Key Insight |
|---|---|---|
| **Letta/MemGPT** | OS-inspired: Core memory (RAM, always in context) + Archival memory (disk, searched on demand). Agents self-edit their own memory blocks | Block-based, agent-autonomous, transparent |
| **CrewAI** | Unified Memory class with hierarchical scopes (`/project/alpha/decisions`) | Filesystem-like paths, intuitive scoping |
| **Zep** | Temporal Knowledge Graphs -- facts have valid date ranges, outdated facts auto-invalidated | Temporal awareness prevents stale knowledge |
| **Mem0** | API-first universal memory layer. Scoped by user_id, agent_id, app_id | Simple CRUD, easy to integrate |
| **Claude** | Markdown files in `/memories` directory. Human-readable, user-editable | Transparency is the killer feature |
| **ChatGPT** | Simple list of ~1400 words. View/edit/delete. Stops remembering when full | Simplicity works for consumer, not enterprise |

### Recommended Architecture

Combine **Letta's block model** with **CrewAI's hierarchical scoping**:

**Memory Instance** = a named, scoped collection of knowledge blocks that can be shared across agents.

Key principles:
- **Transparent content**: users can see and edit exactly what's in each memory (Claude's approach). No opaque vector databases in the UI -- even if vectors are used under the hood, the user sees readable text blocks
- **Two memory types**: Core (always loaded into agent context, like RAM) vs Archival (agent searches on demand via tool call, like disk)
- **Hierarchical scoping**: Organization → Workspace → Team → Agent. Higher scopes cascade down
- **Multi-attach**: a single memory instance can be attached to multiple agents
- **Agent-writable**: agents can update memory blocks during execution (with audit trail)

---

## Data Model

Add to `src/data/mock.ts`:

```ts
// ─── Memory Types ───

type MemoryScope = "organization" | "workspace" | "team" | "agent";
type MemorySensitivity = "public" | "internal" | "confidential" | "restricted";
type MemoryType = "core" | "archival";
type MemoryRole = "viewer" | "user" | "editor" | "admin";

interface MemoryInstance {
  id: string;
  name: string;
  description: string;
  icon: string;                       // emoji or lucide icon name
  scope: MemoryScope;
  scopeId?: string;                   // specific org/workspace/team/agent ID
  sensitivity: MemorySensitivity;
  type: MemoryType;
  blocks: MemoryBlock[];
  attachedAgentIds: string[];
  accessControl: MemoryAccessRule[];
  createdAt: string;
  updatedAt: string;
  sizeBytes: number;
  version: number;
}

interface MemoryBlock {
  id: string;
  label: string;                      // e.g. "Company Overview", "Key Contacts"
  content: string;                    // human-readable text
  updatedAt: string;
  updatedBy: "user" | "agent";
  agentId?: string;                   // which agent updated it (if agent-updated)
}

interface MemoryAccessRule {
  principalType: "user" | "agent" | "team" | "role";
  principalId: string;
  principalName: string;
  role: MemoryRole;
}

interface MemoryAuditEntry {
  id: string;
  memoryId: string;
  action: "read" | "write" | "attach" | "detach" | "share" | "create" | "delete";
  actorType: "user" | "agent";
  actorId: string;
  actorName: string;
  blockId?: string;
  timestamp: string;
  details?: string;                   // e.g. "Updated 'Key Contacts' block"
}
```

### Mock Data to Create

Create 5-6 memory instances with variety:

| Name | Type | Scope | Sensitivity | Agents | Size |
|---|---|---|---|---|---|
| Customer Preferences | Core | Organization | Internal | 3 | 12 KB |
| Product Catalog | Archival | Workspace | Public | 5 | 2.4 MB |
| Compliance Rules | Core | Organization | Confidential | 2 | 48 KB |
| Sales Playbook | Archival | Team | Internal | 1 | 890 KB |
| Company Context | Core | Organization | Public | all | 8 KB |
| Q4 Strategy | Core | Workspace | Restricted | 1 | 24 KB |

Each instance should have 2-4 blocks with realistic content. Include some blocks marked as agent-updated.

Create 10-15 audit entries across the instances showing a mix of reads, writes, attaches, and agent updates.

---

## UI Specification

### 1. Sidebar Navigation

In `src/components/layout/sidebar.tsx`, add "Memory" to `mainNav` array between Agents and Pipelines:

```ts
{ href: "/memory", label: "Memory", icon: Brain }
```

(`Brain` is already imported from lucide-react in other files. Alternatively use `Database` or `HardDrive`.)

### 2. Memory List Page (`src/app/memory/page.tsx`)

**Header**: "Memory" title + "+ New Memory" button (right-aligned)

**Filters**: Row of filter chips below the header:
- Type: All / Core / Archival
- Scope: All / Organization / Workspace / Team / Agent
- Sensitivity: All / Public / Internal / Confidential / Restricted
- Search input (right-aligned, magnifying glass icon)

**Grid**: Card grid (3-4 columns responsive). Each card:

```
┌─────────────────────────┐
│  🧠  Customer Prefs     │
│                         │
│  Core  ·  Internal      │    ← type badge + sensitivity badge
│  3 agents  ·  12 KB     │    ← agent count + size
│  Updated 2h ago         │    ← relative time
└─────────────────────────┘
```

Card styling: match existing agent cards -- `bg-white/[0.04] border border-white/[0.06] rounded-xl`. Hover: `hover:border-white/[0.12]`.

Type badge colors: Core = blue/accent tint, Archival = neutral/gray.
Sensitivity badge colors: Public = green, Internal = blue, Confidential = amber, Restricted = red.

### 3. Memory Detail Page (`src/app/memory/[id]/page.tsx`)

**Header**: Back arrow + memory name + icon + sensitivity badge + edit/delete actions

**Tabs**: Content / Agents / Access / History

**Content Tab** (default):
```
Content                          [+ Add Block]
──────────────────────────────────────────────
┌──────────────────────────────────────────┐
│ Company Overview                    ✏️ 🗑 │
│ ─────────────────────────────────────── │
│ Acme Corp is a B2B SaaS company        │
│ focused on enterprise automation...     │
│                                         │
│ Updated by Jordan · 2 hours ago         │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Key Contacts                        ✏️ 🗑 │
│ ─────────────────────────────────────── │
│ - CEO: Jane Smith (jane@acme.com)       │
│ - CTO: Bob Lee (bob@acme.com)           │
│                                         │
│ Updated by Research Agent · 5 min ago   │
└──────────────────────────────────────────┘
```

Blocks are displayed as glassmorphic cards with label, content (rendered markdown or plain text), and attribution (who updated, when, user vs agent).

Edit mode: click the edit icon → block content becomes an editable textarea. Save/Cancel buttons appear.

**Agents Tab**:
```
Attached Agents                  [+ Attach ▾]
──────────────────────────────────────────────
┌──────────────────────────────────────────┐
│ Research Agent        Can use      [✕]   │
│ Data Enrichment       Can edit     [✕]   │
│ Compliance Monitor    Can view     [✕]   │
└──────────────────────────────────────────┘
```

Each row: agent name, role dropdown (Can view / Can use / Can edit / Full control), detach button.
`[+ Attach]` dropdown lists agents not yet attached.

**Access Tab**:
```
Access Control                   [+ Add ▾]
──────────────────────────────────────────────
Sensitivity: Confidential

Who has access:
┌──────────────────────────────────────────┐
│ 👤 Jordan Reeves     Full control        │
│ 🤖 Research Agent    Can use             │
│ 🤖 Data Enrichment   Can edit            │
│ 👥 Security Team     Can view            │
└──────────────────────────────────────────┘

Note: Agents can only access memory at or below
their clearance level.
```

4 roles in plain language:
- **Can view** -- read-only access
- **Can use** -- read + agent can query via tool call
- **Can edit** -- read + write blocks
- **Full control** -- read + write + share + delete

NO complex permissions matrix. Just a flat list of who has what role.

**History Tab**:
```
Activity Log
──────────────────────────────────────────────
● 5 min ago   Research Agent wrote "Key Contacts"
● 2 hours ago Jordan edited "Company Overview"
● 1 day ago   Data Enrichment attached
● 3 days ago  Jordan created this memory
```

Simple chronological audit log with actor, action, and target.

### 4. Agent Detail Page -- Attached Memory

In `src/app/agents/[id]/page.tsx`, add a section (either in the Builder tab below the canvas, or as part of the config panel):

```
Attached Memory                  [+ Attach ▾]
┌──────────────────────────────────────────┐
│ 🧠 Customer Prefs   Core  ·  Can use    │
│ 📋 Product Catalog   Archival  ·  Can use│
└──────────────────────────────────────────┘
```

Clicking a memory name navigates to `/memory/[id]`. The `[+ Attach]` dropdown lists available memory instances with a search filter.

### 5. New Memory Creation Flow

"+ New Memory" button on the list page opens a focused creation wizard (Apple pattern: one screen, one decision, but we can do it as a stepped modal or dedicated page):

**Step 1**: Name + Description + Icon picker
**Step 2**: Type (Core / Archival) + Scope (Organization / Workspace / Team / Agent) + Sensitivity
**Step 3**: Initial content (add blocks with label + text, or upload files)
**Step 4**: Attach to agents (multi-select)

Alternatively, a single-page form with progressive disclosure (show Name + Type first, expand for advanced options). This is simpler for a mock.

---

## IAM for Shared Memory

### Feasibility: YES, Incrementally

Phase 1 alone gives 80% of real-world threat coverage with 1-2 weeks of work.

### The Hard Problems (Why This Matters)

- **Scale**: Agents outnumber humans 50-82:1. IAM must handle orders of magnitude more identity operations
- **Confidence gap**: Only 18% of security leaders are confident their IAM can manage agent identities
- **Summarization leak**: An agent with access to Confidential memory summarizes sensitive data into a shared space, leaking it to agents that shouldn't see it. Academic research (AgentLeak) shows 28-35% baseline inter-agent information leakage
- **No standard yet**: Microsoft Entra Agent ID is the closest to a universal agent identity standard. 92% of organizations aren't confident legacy IAM tools can handle agent identities
- **Ephemeral vs persistent**: Agent identities live seconds to hours vs human identities lasting months to years. Token management, session handling, and credential rotation must be fundamentally different

### Phased Implementation Plan

**Phase 1 (1-2 weeks) -- 80% of security benefit. Start here.**
- **Agent IDs**: every agent gets a unique identity in the system
- **Memory gateway**: single access point for ALL memory operations. Never let agents hit the data store directly. All reads/writes go through a gateway that checks permissions. This is the most critical architectural decision -- build it from day one so you can layer policies on later
- **Basic RBAC** with 4 named roles (plain language):
  - **Can view** -- read-only
  - **Can use** -- read + agent can query via tool call
  - **Can edit** -- read + write
  - **Full control** -- read + write + share + delete
- **Sensitivity tags**: Public / Internal / Confidential / Restricted
- **Clearance matching**: Agents can only access memory at or below their clearance level
- **Audit logging**: every memory access logged (who, what, when, which agent)
- **Encryption at rest**: all memory content encrypted in storage

**Phase 2 (1-2 months) -- Enterprise policy engine**
- Data classification auto-tagging (content pattern detection)
- OPA (Open Policy Agent) for policy-as-code
- ABAC basics: attribute-based rules combining agent role + memory sensitivity + time + context
- Short-lived JWT tokens for agent sessions (not long-lived API keys)
- Time-bounded access: temporary grants that auto-expire

**Phase 3 (2-4 months) -- Compliance-ready**
- HashiCorp Vault integration for secrets management
- mTLS between agent and memory gateway
- Compartmentalization: agents in different teams cannot see each other's memory
- Compliance reporting: SOC 2, HIPAA audit trails
- Data residency controls

**Phase 4 (3-6 months) -- Regulated industries**
- Confidential computing enclaves
- BeyondCorp-style continuous trust scoring (agent behavior anomaly detection)
- Cross-organization federation
- Zero-knowledge proofs for privacy-preserving queries

### Anti-Summarization-Leak Pattern (Phase 2+)

When an agent with access to Confidential memory produces output for a shared space:
1. Memory gateway checks output destination's sensitivity level
2. If destination < source sensitivity, flag for human review or auto-redact
3. Audit log records the attempted cross-level transfer

For Phase 1, sensitivity tags + role checks are sufficient. The gateway architecture makes adding this later non-disruptive.

### What to Implement in the Mock

For the frontend mock, implement the UI for Phase 1:
- Access control list on each memory instance (flat list of who has what role)
- Sensitivity badges on memory cards
- Audit log view on the history tab
- The backend enforcement (gateway, token validation, encryption) is backend work for later

---

## UX Principles for This Feature

### Avoid the Permissions Matrix Trap

AWS IAM has 17,000+ actions across 300+ services. This is the anti-pattern. Instead:

- **4 named roles** with plain language descriptions (not a checkbox matrix)
- **Sensitivity levels** as color-coded badges (not configurable permission sets)
- **Clearance matching** as a simple rule: "agents can only access memory at or below their level"
- **No DENY rules in Phase 1** -- keep it additive (grant access, don't block access)

### Memory Should Feel Like Notion, Not Like S3

- Blocks are readable text, not file paths or object keys
- Content is always visible and editable inline
- Agent updates are attributed and timestamped (like Notion's collaboration indicators)
- Version history is a simple timeline, not a diff viewer

### Progressive Disclosure

- Memory list page: show name, type, sensitivity, agent count, size, last updated. That's it.
- Click a card: expand into full detail with tabs
- Access tab: flat list by default, "Advanced" expander for sensitivity overrides (Phase 2+)
- Creation flow: name + type is the minimum. Everything else has smart defaults.

### Smart Defaults

- New memory defaults: scope = Workspace, sensitivity = Internal, type = Core
- First attached agent gets "Can use" role by default
- Creator gets "Full control" automatically

---

## Implementation Order

1. Add types to `src/data/mock.ts` (`MemoryInstance`, `MemoryBlock`, `MemoryAccessRule`, `MemoryAuditEntry`)
2. Add mock data: 5-6 memory instances with blocks, access rules, and audit entries
3. Add "Memory" to sidebar `mainNav` in `src/components/layout/sidebar.tsx` (between Agents and Pipelines)
4. Create `src/app/memory/page.tsx` -- card grid with type/scope/sensitivity filters
5. Create `src/app/memory/[id]/page.tsx` -- detail page with Content / Agents / Access / History tabs
6. Add "Attached Memory" section to `src/app/agents/[id]/page.tsx`
7. Build "New Memory" creation flow (stepped modal or single form with progressive disclosure)
