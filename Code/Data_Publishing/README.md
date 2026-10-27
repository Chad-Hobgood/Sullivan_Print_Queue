# Data publishing

These functions copy values from the queue spreadsheet to separate spreadsheets. They write values only and replace their output on each run.

| Function | Source | Target | Intended trigger |
| --- | --- | --- | --- |
| `publishLiveQueueView()` | `Form_Responses` D and K from row 2 | `Live View` A:B from row 2 | Every minute |
| `publishStudentFilamentInventory()` | `Current_Filament_Inventory` from row 8; A copied when B > 100 and D excludes the two student-view notes | `Live View` D from row 13 | Nightly/daily |
| `publishPrintQueueData()` | All used values in `Dashboard_Data_Link`, starting at A1 | `Print_Queue_Data` in spreadsheet `14Tf89-Ykxk3q7-kend86jd6PuFRmsbw9c9vO0er8z_U`, starting at A1 | Manual or scheduled after dashboard updates |

The queue publisher preserves source row alignment, including blank values, and clears stale output when queue rows are removed. The inventory publisher clears names from the previous run that no longer qualify.

The dashboard publisher clears all contents on `Print_Queue_Data` before writing the current source values. This removes stale rows and columns while preserving target formatting. Formulas in the source are published as their calculated values.

The Live View target spreadsheet ID and sheet name are configured in `Publish_Live_Queue_View.js`; the dashboard target spreadsheet ID is configured in `Publish_Print_Queue_Data.js`. `authorizeScript()` requests cross-spreadsheet Sheets access; the account that runs each publisher must have edit access to its target.

See [trigger setup and operations](../../docs/triggers-and-operations.md#data-publishing-setup) and [spreadsheet contracts](../../docs/spreadsheet-contracts.md#data-publishing-contracts).
