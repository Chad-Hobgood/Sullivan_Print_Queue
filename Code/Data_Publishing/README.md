# Data publishing

These functions copy selected values from the queue spreadsheet to the separate `Live View` spreadsheet. They write values only and replace their own output ranges on each run.

| Function | Source | Target | Intended trigger |
| --- | --- | --- | --- |
| `publishLiveQueueView()` | `Form_Responses` D and K from row 2 | `Live View` A:B from row 2 | Every minute |
| `publishStudentFilamentInventory()` | `Current_Filament_Inventory` from row 8; A copied when B > 100 and D excludes the two student-view notes | `Live View` D from row 13 | Nightly/daily |

The queue publisher preserves source row alignment, including blank values, and clears stale output when queue rows are removed. The inventory publisher clears names from the previous run that no longer qualify.

The target spreadsheet ID and sheet name are configured in `Publish_Live_Queue_View.js`. `authorizeScript()` opens that spreadsheet to request cross-spreadsheet Sheets access; the account that authorizes and owns the triggers must have edit access to the target.

See [trigger setup and operations](../../docs/triggers-and-operations.md#data-publishing-setup) and [spreadsheet contracts](../../docs/spreadsheet-contracts.md#data-publishing-contracts).
