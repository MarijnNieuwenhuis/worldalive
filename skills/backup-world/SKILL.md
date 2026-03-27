---
name: backup-world
description: Zip the worlds/ directory and save to backups/ with a timestamped filename. Always run before advancing the world clock.
---

# Backup World Skill

Creates a timestamped zip backup of the entire `worlds/` directory before any destructive or time-advancing operation.

## When to run

Always called by world-clock as the very first action before reading `clock.md` or processing any time advance. Never skip this step.

## Steps

1. Read `clock.md` to get the current world time for the timestamp. Parse the `Current time:` value — use the date and time portion (e.g., `2026-03-26 at 09:00` → `2026-03-26-0900`).

2. Ensure the `backups/` directory exists at the project root. If it doesn't exist, create it.

3. Run the following PowerShell command from the project root (`C:\Users\badja\ClaudeCowork\ProjectDiscovery\agentsAtWork`):

```powershell
$timestamp = "<value from Step 1, e.g. 2026-03-26-0900>"
Compress-Archive -Path "worlds\" -DestinationPath "backups\backup-$timestamp.zip" -Force
```

Or using bash if available:

```bash
timestamp="<value from Step 1, e.g. 2026-03-26-0900>"
zip -r "backups/backup-${timestamp}.zip" worlds/
```

4. Verify the backup file exists at `backups/backup-{timestamp}.zip` and is non-zero in size.

5. Report: `Backup created: backups/backup-{timestamp}.zip`

## Output filename format

`backup-YYYY-MM-DD-HHmm.zip`

Examples:
- `backup-2026-03-26-0900.zip`
- `backup-2026-03-28-2000.zip`

If two advances happen at the same minute, `-Force` overwrites the previous backup for that minute — this is acceptable.

## On failure

If the zip command fails (e.g., no shell tool available), do NOT proceed with the time advance. Report the failure to the user and stop:

> "Backup failed — cannot advance the clock without a successful backup. Please check that a shell MCP tool is configured and try again."

This is a hard stop. The world should never advance without a backup.
