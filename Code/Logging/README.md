# Logging and reporting utilities

These functions calculate dashboard tables or maintain the filament inventory order. Most read from `Archive` and write to `Dashboard_Data_Link`.

| Function | Source file | Output/behavior |
| --- | --- | --- |
| `runLoggingUpdates()` | `Run_Logging_Updates.js` | Runs the seven dashboard writers sequentially with per-step logs |
| `updateAssistantMetrics()` | `Lab-Assistant-Leaderboard.js` | Assistant totals in `Dashboard_Data_Link` A:E; refreshes only A:E |
| `Printer_wear_leveling()` | `Printer_Wear_Leveling.js` | Printer counts in G:H |
| `Request_and_Completion_Distribution()` | `Request_And_Completion_Distribution` | Hourly request start/end counts in J:L |
| `updateTopTenDashboards()` | `Top_Ten_Lists.js` | Top requestors and flagged requestors in N:Q |
| `updateFlagReasonCounts()` | `Flag_Reason_Counts.js` | Counts archived `Flagged` rows by current reason in S:T |
| `updateProjectTypeCounts()` | `Project_Type_Counts.js` | Project-type totals in V:Y and August-July request counts in AA onward |
| `updateTimeDelayAnalysis()` | `Time_Delay_Analysis.js` | Time-delay distributions in AA:AK from row 16 and completed-duration summaries in AQ:AT |
| `sortCurrentFilamentInventory()` | `Sort_Current_Filament_Inventory.js` | Sorts full inventory rows from row 8 by column A; standalone utility |

The logging handler stops and rethrows on the first error. Each dashboard writer refreshes only its own output block, so the writers do not depend on a particular order to preserve other dashboard data.

The filament sorter is intentionally independent of `runLoggingUpdates()`. Sorting changes row order in `Current_Filament_Inventory`, while the dashboard handler has no need to perform that maintenance operation.

## Time-delay analysis

`updateTimeDelayAnalysis()` reads archived rows and writes integer-hour reports. It uses these timestamp meanings:

| Archive column | Meaning |
| --- | --- |
| A | Request submission time |
| V | Time a lab assistant changed the request to `In Progress` |
| W | Time the finalized request was archived (`Completed` or `Flagged`) |

The report produces four distributions: submission to in-progress, submission to flagged, submission to completed, and in-progress to completed. Rows without the timestamps required for a measure are excluded from that measure. In particular, a request flagged directly from the queue has no V timestamp, so its flagging delay is A to W.

Each distribution rounds individual durations to the nearest whole hour. It uses up to ten regular range-based bins; high IQR outliers are combined into the final `> x hrs` bin. The summary tables use completed print duration (V to W) by configured printer and current project type. Overall completed and flagged summaries use finalization time (A to W). A configured printer or project type with no completed duration is reported as `No Uses`.

See [spreadsheet contracts](../../docs/spreadsheet-contracts.md) and [triggers and operations](../../docs/triggers-and-operations.md).
