---
name: update-agent
description: Update an existing agent's configuration, role, or preferences
---

# Update Agent Skill

Modifies an existing agent's configuration. Never touches MEMORY.md content.

## Input required

Ask the user:
1. **Which agent** — name from REGISTRY.md
2. **What to change** — one or more of:
   - Role / responsibilities (updates SOUL.md)
   - Personality (updates SOUL.md)
   - Schedule (updates REGISTRY.md)
   - MCP tool access (updates PREFERENCES.md and MCP_REGISTRY.md)
   - Configuration / limits (updates PREFERENCES.md)

## Steps

1. Verify the agent exists in REGISTRY.md. If not found, stop and list available agents.
2. Read the agent's current files: `SOUL.md`, `PREFERENCES.md`, the agent's row in `REGISTRY.md`, and its entry in `MCP_REGISTRY.md`.
3. Show the user exactly what will change (before/after diff) and get confirmation before writing anything.
4. Apply the confirmed changes to the appropriate files.
5. Update `REGISTRY.md` if schedule or tools changed.
6. Update `MCP_REGISTRY.md` if tool permissions changed.
7. Append a note to the agent's `MEMORY.md` (do not overwrite):
   `SYSTEM: Agent configuration updated on {{date}}. Changes: {{summary}}.`
8. Confirm changes to user.

## Safety

- Always show what will change before applying — step 3 is mandatory, not optional.
- Never delete or overwrite MEMORY.md content. Only append the system note.
- If removing MCP tool access, warn if the agent's core responsibilities depend on it.

## Gotchas

- REGISTRY.md uses a markdown table. After editing the agent's row, verify the table is still valid markdown — a misaligned column breaks orchestrator parsing.
- An agent may not have all files if it was created manually or before templates existed. If a file is missing, note it to the user but don't block the update.
- Never modify SOUL.md based on inferred intent — only make changes the user explicitly requested.
