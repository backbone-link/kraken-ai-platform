# Just-in-Time (JIT) Authorization for Agents

## How It Works

### 1. Agent hits a permission boundary at runtime

The agent runs with minimal base permissions (e.g., `data:read`). Mid-task, it needs to do something elevated — say, write data or spawn sub-agents. It doesn't have that permission standing.

### 2. It requests elevation

The agent itself (or the platform on its behalf) fires a JIT request: "I need `data:write` for 30 minutes because I'm cleaning up orphaned SKUs." This includes the reason, requested permissions, and task context.

### 3. Approval depends on policy

- **auto-approve** — Platform grants it instantly if the request matches pre-configured rules (e.g., "market-intel can get `data:write` for up to 60m"). No human in the loop.
- **policy-based** — A policy engine evaluates it (time of day, risk score, permission scope). May approve or deny automatically.
- **require-approval** — A human (org-admin, security-admin, or operator) gets a notification, reviews the request, and approves/denies. The agent **blocks** until they respond.

### 4. Grant is time-bounded

Once approved, the permission is active for a fixed window (the `maxJitDuration` on the service account — 15m, 30m, 60m, 120m). The countdown starts.

### 5. Auto-revocation — three ways it ends

- **Expiry** — Timer runs out, permissions are stripped automatically. Most common path.
- **Task completion** — Agent finishes early, signals done, permissions revoked immediately.
- **Guardrail revocation** — Mid-session, a guardrail fires (e.g., price-floor violation), and the platform yanks permissions *and* suspends the agent. This is the emergency path.

## Why This Matters (vs. Traditional RBAC)

In a traditional system, `svc-price-optimizer` would have `data:write` + `integrations:write` permanently. If it goes rogue at 2 AM, it has full access until someone notices.

With JIT, it has *nothing* standing — it has to ask every time, and the grant is scoped and temporary. The blast radius of a compromised or misbehaving agent is dramatically smaller.

## Industry Context

This is the pattern ConductorOne, Britive, and Opal pioneered for human identities (engineers requesting prod access), now being applied to non-human identities (agents, service accounts) — the hot new category since agents are proliferating faster than humans in most orgs.
