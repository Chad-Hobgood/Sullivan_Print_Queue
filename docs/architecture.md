# Architecture and workflows

## Runtime model

This repository contains Google Apps Script JavaScript files. In Apps Script, these files are combined into a shared project namespace; a function can call another function defined in a different source file. The spreadsheet is both the input store and the destination for workflow state, archive records, and dashboard output. `Code/0-Authorize_Script.js` defines the queue sheet name and includes an authorization helper.

## Request lifecycle

1. A form response appears on the queue sheet (`Form_Responses`). `onFormSubmit(e)` writes printer lookup formulas to T and U and sets K to `In Queue`.
2. A lab assistant changes status in K. `onEdit(e)` filters for edits on the configured queue sheet and status column.
3. For `In Progress`, the handler normalizes the status label and sets the in-progress timestamp in V if it is empty.
4. For `Completed` or `Flagged`, `archiveRowAndSendEmail(...)` appends the row to `Archive`, sets the completion timestamp in W, writes formulas in Z:AD, sends an email, and deletes the source row.
5. `processAnyRemainingStatusItems()` is a scheduled recovery path for completed/flagged rows older than one minute. It uses a script lock and marks a candidate `Processing...` before attempting the archive operation.
6. `cleanupEmptyQueueRows()` removes queue rows whose K status cell is blank.

The exact trigger types and installed trigger configuration are not stored in this repository. See [triggers and operations](triggers-and-operations.md).

## Reporting and utility functions

`runLoggingUpdates()` runs four dashboard writers in sequence. `updateAssistantMetrics()` clears `Dashboard_Data_Link`, so it runs first; printer usage, hourly start/end counts, and top requestor tables then write to G:H, J:L, and N:Q. `sortCurrentFilamentInventory()` is a separate utility that sorts full inventory rows from row 8 onward by column A.

`removeDuplicateArchiveRows()` is a separate archive maintenance function. It removes duplicate rows using A:V as the comparison key.

## Locks and failures

`onEdit` and the recovery sweep use `LockService.getScriptLock()` to reduce concurrent modifications. The recovery path uses `tryLock(5000)`; if it cannot acquire the lock, it returns without processing. `onEdit` waits up to 30 seconds and logs caught errors. The archive function also catches and logs errors internally, so callers do not receive a thrown error when its internal work fails. Review these failure semantics when changing retry or notification behavior.

## Data flow sketch

```text
Google Form -> Form_Responses -> onFormSubmit
                                  |
                           assistant edits K
                                  v
                                onEdit -------> Archive + email
                                  ^                  ^
                                  |                  |
                   scheduled recovery sweep --------+

Archive -> runLoggingUpdates -> Dashboard_Data_Link
Current_Filament_Inventory -> sortCurrentFilamentInventory
Archive -> removeDuplicateArchiveRows
```
