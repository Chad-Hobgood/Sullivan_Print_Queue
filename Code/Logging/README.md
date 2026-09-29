# Logging and reporting utilities

These functions calculate dashboard tables or maintain the filament inventory order. Most read from `Archive` and write to `Dashboard_Data_Link`.

| Function | Source file | Output/behavior |
| --- | --- | --- |
| `runLoggingUpdates()` | `Run_Logging_Updates.js` | Runs the five dashboard writers sequentially with per-step logs |
| `updateAssistantMetrics()` | `Lab-Assistant-Leaderboard.js` | Assistant totals in `Dashboard_Data_Link` A:E; refreshes only A:E |
| `Printer_wear_leveling()` | `Printer_Wear_Leveling.js` | Printer counts in G:H |
| `Request_and_Completion_Distribution()` | `Request_And_Completion_Distribution` | Hourly request start/end counts in J:L |
| `updateTopTenDashboards()` | `Top_Ten_Lists.js` | Top requestors and flagged requestors in N:Q |
| `updateFlagReasonCounts()` | `Flag_Reason_Counts.js` | Counts archived `Flagged` rows by current reason in S:T |
| `sortCurrentFilamentInventory()` | `Sort_Current_Filament_Inventory.js` | Sorts full inventory rows from row 8 by column A; standalone utility |

The logging handler stops and rethrows on the first error. Each dashboard writer refreshes only its own output block, so the writers do not depend on a particular order to preserve other dashboard data.

The filament sorter is intentionally independent of `runLoggingUpdates()`. Sorting changes row order in `Current_Filament_Inventory`, while the dashboard handler has no need to perform that maintenance operation.

See [spreadsheet contracts](../../docs/spreadsheet-contracts.md) and [triggers and operations](../../docs/triggers-and-operations.md).
