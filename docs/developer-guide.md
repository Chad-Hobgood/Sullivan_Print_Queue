# Developer guide

## Repository layout

- `Code/Queue Handling/`: request intake, status changes, recovery, cleanup, archive-and-email behavior.
- `Code/Archiving/`: archive data maintenance.
- `Code/Logging/`: dashboard writers, their sequential handler, and the filament inventory sorter.
- `Code/Data_Publishing/`: periodic publishers for the separate student-facing `Live View` spreadsheet.
- `docs/`: architecture, sheet contracts, operations, and this guide.

## Making a change

1. Identify the function entry point and every caller. Search across `Code/`; Apps Script functions share a project namespace even when files differ.
2. Check the relevant [spreadsheet contracts](spreadsheet-contracts.md), especially column indexes, header rows, and whether rows are moved, cleared, sorted, or deleted.
3. Preserve the file's existing naming and formatting conventions. Keep independent functionality in focused source files and explain non-obvious sheet assumptions in comments.
4. For a change that writes to a sheet, sends email, or deletes/reorders rows, inspect the complete range and run through the behavior on a spreadsheet copy before deploying.
5. Update the directory README and applicable docs when entry points, sheet assumptions, trigger behavior, or data effects change.

## Testing and deployment limits

This repository currently has no automated test harness, Apps Script manifest, or deployment script. The source files alone do not establish the installed triggers, authorization owner, spreadsheet ID, or timezone. Validate the Apps Script project configuration separately and test changes in a copy of the spreadsheet. Do not assume a local JavaScript runtime can faithfully emulate `SpreadsheetApp`, `MailApp`, `LockService`, or event objects.

## AI-assisted maintenance

When using an AI coding assistant, provide the relevant function and caller files plus the spreadsheet contract. Ask it to trace side effects before changing code. Treat names and docs as clues, not proof of live configuration. Do not ask an assistant to execute spreadsheet-writing functions against production during code review.

## Documentation upkeep

Document behavior that affects future edits: entry point and trigger style, input/output sheets, key columns and header rows, ordering constraints, data deletion or movement, email side effects, locking, and failure/retry behavior. Keep examples and function names synchronized with source. Mark unknown deployment facts as unknown instead of guessing.
