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
| `publishLiveQueueView()` | Installable time-driven trigger, every minute | Replaces target `Live View` A:B with `Form_Responses` D:K projection |
| `publishStudentFilamentInventory()` | Installable daily time-driven trigger | Replaces target `Live View` D13 downward with qualifying filament names |

## Setup checks before enabling

1. Confirm each handler is configured with the intended Apps Script trigger type and points at the correct spreadsheet. Event functions require a valid event object; do not run them from the editor without one.
2. Run `authorizeScript()` manually as the account expected to own the automation, then complete the Google authorization flow. Confirm email sending is authorized for archive notifications.
3. Confirm `QUEUE_SHEET_NAME` and all sheet names/columns against the live spreadsheet.
4. Confirm schedules and timezone in Apps Script. The source does not specify a timezone or exact schedule.
5. Test row movement, email behavior, and cleanup against a spreadsheet copy before activating operational triggers.

## Data publishing setup

1. Run `authorizeScript()` manually from the Apps Script editor as the account that will own the triggers. In addition to email authorization, this opens the target spreadsheet by ID and requests the Sheets permission needed to write to a separate spreadsheet. The trigger owner must also have edit access to that target.
2. In **Triggers** (the clock icon), add a trigger for `publishLiveQueueView`, choose **Time-driven**, then **Minutes timer** and **Every minute**. This keeps updates frequent enough to target the requested five-minute freshness. Apps Script time-driven triggers run on a schedule and can be delayed; Google does not guarantee a strict maximum end-to-end delay, so this is a best-effort freshness target rather than a hard real-time guarantee.
3. Add a separate trigger for `publishStudentFilamentInventory`, choose **Time-driven**, then **Day timer**, and select the desired nightly window.
4. Run each function manually once and confirm the expected ranges in the target spreadsheet before relying on the triggers. Avoid creating duplicate triggers for either function.

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
