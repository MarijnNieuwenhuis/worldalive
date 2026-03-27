---
name: create-agent
description: Create a new agent in the multi-agent system
---

# Create Agent Skill

Creates a new agent by scaffolding its folder and registering it.

## Input required

Ask the user for:
1. **Agent name** — short, lowercase, kebab-case (e.g., "price-tracker")
2. **Role** — one sentence describing what this agent does
3. **Personality** — how it should behave (frugal, thorough, concise, etc.)
4. **Responsibilities** — bullet list of specific tasks
5. **Schedule** — how often it should run (hourly, daily:HH:MM, on-demand, every:Xh)
6. **MCP tools** — which tools from MCP_REGISTRY.md it needs access to

## Steps

1. Create folder: `agents/{{agent-name}}/`
2. Copy and fill each template file:

   **SOUL.md** (from `agents/templates/SOUL.md.template`):
   - Replace `{{AGENT_NAME}}` with the agent name
   - Replace `{{AGENT_ROLE}}` with the role sentence
   - Replace `{{AGENT_PERSONALITY}}` with the personality description
   - Replace `{{AGENT_RESPONSIBILITIES}}` with the bullet list of tasks

   **MEMORY.md** (from `agents/templates/MEMORY.md.template`):
   - Replace `{{AGENT_NAME}}` with the agent name

   **PREFERENCES.md** (from `agents/templates/PREFERENCES.md.template`):
   - Replace `{{AGENT_NAME}}` with the agent name
   - Replace `{{AGENT_FOLDER}}` with the folder name
   - Fill the MCP Tools table with the tools requested

3. Create `agents/{{agent-name}}/INBOX.md` with content:
   ```
   # {{agent-name}} — Inbox
   ```

4. Create `agents/{{agent-name}}/STATUS.md` with content:
   ```
   # {{agent-name}} — Status

   Last run: never
   Result: pending
   ```

5. Add a row to `agents/REGISTRY.md`:
   ```
   | {{agent-name}} | {{agent-name}}/ | {{schedule}} | {{mcp-tools}} | active |
   ```

6. Add the agent to the permissions table in `agents/MCP_REGISTRY.md`.

7. **Verify:** Read back each created file and confirm it exists and is non-empty. If any file is missing, recreate it before confirming.

8. Confirm to user: "Agent '{{agent-name}}' created. It will be picked up on the next orchestrator run."

## Validation

- Ensure agent name is unique in REGISTRY.md — if it already exists, stop and ask the user.
- Ensure requested MCP tools exist in MCP_REGISTRY.md — if any don't, list the unknown tools and ask the user to clarify before proceeding.
- Ensure the folder doesn't already exist.
- Template files must exist in `agents/templates/` — if they're missing, stop and tell the user rather than inventing content.

## Gotchas

- Agent names must be lowercase kebab-case. Convert if needed (e.g., "Price Tracker" → `price-tracker`).
- After adding a row to REGISTRY.md, verify the table formatting is intact — a broken markdown table will cause the orchestrator to misread the registry.
- The PREFERENCES.md MCP Tools table must only list tools that exist in MCP_REGISTRY.md. Listing an unknown tool creates a silent permission gap.
