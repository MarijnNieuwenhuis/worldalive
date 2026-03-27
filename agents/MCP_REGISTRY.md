# MCP Tool Registry

Lists all available MCP servers and which agents are authorized to use them.

## Available MCP Servers

| Tool Name | Binary/Endpoint | Description | Status |
|-----------|----------------|-------------|--------|
| (no tools yet — add entries as MCP servers are built) | | | |

## Agent Permissions

| Agent | Allowed Tools |
|-------|--------------|
| orchestrator | all (read-only access to agent files) |
| joke-teller | none |
| character-curator | web-search, claude-in-chrome |

## Adding a new MCP tool

1. Build and test the MCP server binary.
2. Place compiled binary in a stable path (e.g., ~/mcp-servers/).
3. Add entry to this registry.
4. Add the tool to relevant agents' PREFERENCES.md.
5. Update agent permissions table above.
