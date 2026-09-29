# Triggers and operations

The source contains event handler functions and utilities, but trigger definitions are not included. Confirm the actual installed triggers in Apps Script before adding, removing, or replacing any trigger. Avoid installing duplicate triggers for the same event or scheduled function.

## Functions by invocation style

| Function | Intended invocation | Operational effect |
| --- | --- | --- |
| `authorizeScript()` | Manual, once per account as needed | Calls `MailApp.getRemainingDailyQuota()` to request email authorization |
| `onFormSubmit(e)` | Form submit event with event object | Sets formulas and initial queue status |
| `onEdit(e)` | Queue edit event with event object | Sets timestamps or archives completed/flagged rows and emails requester |
| `processAnyRemainingStatusItems()` | Time-driven recovery schedule | Processes eligible completed/flagged rows older than one minute |
| `cleanupEmptyQueueRows()` | Time-driven cleanup schedule | Deletes rows with blank status in K |
| `runLoggingUpdates()` | Manual or one time-driven schedule | Rebuilds reporting blocks; stops at the first thrown failure |
| `sortCurrentFilamentInventory()` | Manual or separately scheduled utility | Reorders inventory records from row 8 by column A |
| `removeDuplicateArchiveRows()` | Manual or separately scheduled maintenance | Removes duplicate Archive rows using A:V |

## Setup checks before enabling

1. Confirm each handler is configured with the intended Apps Script trigger type and points at the correct spreadsheet. Event functions require a valid event object; do not run them from the editor without one.
2. Run `authorizeScript()` manually as the account expected to own the automation, then complete the Google authorization flow. Confirm email sending is authorized for archive notifications.
3. Confirm `QUEUE_SHEET_NAME` and all sheet names/columns against the live spreadsheet.
4. Confirm schedules and timezone in Apps Script. The source does not specify a timezone or exact schedule.
5. Test row movement, email behavior, and cleanup against a spreadsheet copy before activating operational triggers.

## Logging handler order

`runLoggingUpdates()` currently runs:

1. `updateAssistantMetrics`
2. `Printer_wear_leveling`
3. `Request_and_Completion_Distribution`
4. `updateTopTenDashboards`

The first function clears all of `Dashboard_Data_Link`; retain it first unless its clearing behavior is revised. The inventory sorter is not part of this handler.

Each handler step logs a start and completion timestamp. If a function throws, the handler logs the failing step and rethrows, so later steps do not run. Check Apps Script execution logs for the first failure.

## Operational caveats in current code

- The archive function catches its own errors and does not rethrow them. A caller can appear to finish even if an internal archive/email operation failed. In the recovery path, a row may already have been marked `Processing...` when this occurs.
- Queue cleanup deletes rows based only on blank status in K; review rows before using this function if the queue may contain incomplete submissions.
- Archive duplicate removal is irreversible within the live sheet unless version history or a backup is available.
- Apps Script quotas and platform behavior can change; check current Google Apps Script documentation and project settings when planning schedules or volume.
