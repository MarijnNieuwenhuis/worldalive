---
name: route-message
description: Send a message from one agent (or the user) to another agent's inbox
---

# Route Message Skill

Delivers a message to a specific agent's inbox for processing on its next run.

## Input required

1. **From** — sender name (user, or an agent name)
2. **To** — target agent name (must exist in REGISTRY.md)
3. **Message** — the content to deliver
4. **Priority** — normal / urgent

## Steps

1. Validate target agent exists in REGISTRY.md. If not found, stop and list the available agents.
2. Ensure `agents/{{target-agent}}/INBOX.md` exists. If the file is missing, create it with header: `# {{target-agent}} — Inbox`
3. Append to `agents/{{target-agent}}/INBOX.md`:

```
---
From: {{from}}
Date: {{timestamp}}
Priority: {{priority}}

{{message}}
---
```

4. If priority is urgent, also append to `agents/inbox/` global inbox with a note: `"URGENT for {{target-agent}}: {{short summary}}"`
   - If `agents/inbox/` directory doesn't exist, create it first.
5. Confirm delivery to user.

## Notes

- Agents should check and clear their INBOX.md at the start of each run.
- The orchestrator checks the global inbox/ on every run for urgent items.

## Gotchas

- `agents/inbox/` is a directory, not a file. Write a new `.md` file inside it per urgent message, not to the directory itself.
- If an agent's INBOX.md has grown large (many unread messages), append a note at the top: "Note: {{N}} messages pending — agent has not run recently."
