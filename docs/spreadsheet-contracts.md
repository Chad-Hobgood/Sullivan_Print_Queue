# Spreadsheet contracts

The script uses fixed sheet names and column positions. These are code assumptions, not a generated schema. Verify the live spreadsheet's headers before changing a sheet or column.

## Sheets

| Sheet | Used by | Assumptions |
| --- | --- | --- |
| `Form_Responses` | Queue handlers | Queue sheet configured by `QUEUE_SHEET_NAME`; row 1 is header; columns A, C, K, M, O, T:W are used by workflow code |
| `Archive` | Archiving and reporting | Row 1 is header; A:V are copied/used for duplicate comparison; W receives completion time; Z:AD receive duration formulas; reporting reads A, C, K, M, O, and W |
| `Automation_Tools` | Assistant metrics and email | Assistant names begin in A5; flag reasons begin in D5 |
| `Current Printer Information` | Form formulas and printer reporting | Printer data begins at A:C; A8 downward is the printer list for wear counts |
| `Current_Filament_Inventory` | Inventory sorter | Row 7 is the header; rows 8 onward are records; column A is the ascending sort key; rows are sorted across the used columns together |
| `Dashboard_Data_Link` | Reporting functions | Assistant table A:E; printer counts G:H; start/end-hour distribution J:L; top requestors N:Q |
| `Users` | Top requestor report | Column A contains email and B display name; row 1 onward is read as lookup data |
| `Live View` (separate spreadsheet) | Data publishing | Queue projection uses A:B from row 2; available filament names use D from row 13 |

## Data publishing contracts

- `publishLiveQueueView()` reads `Form_Responses` columns D and K from row 2, preserves their row alignment, and replaces the target sheet's A:B projection beginning at row 2. It clears stale rows when the source queue shrinks.
- `publishStudentFilamentInventory()` reads `Current_Filament_Inventory` columns A, B, and D from row 8. It publishes column A when B is greater than 100 and D contains neither `Ignore in Student View` nor `Special Filament Request`; results replace the target sheet's D column block beginning at row 13.
- Both publishing functions write values only and clear only their assigned output columns. The target spreadsheet ID is configured in `Code/Data_Publishing/Publish_Live_Queue_View.js`.
- The account that owns the installable triggers must have edit access to the target spreadsheet and authorize the cross-spreadsheet Sheets access through `authorizeScript()`.

## Queue and archive columns referenced in code

| Column | Current use |
| --- | --- |
| A | Form submission timestamp; archive elapsed-time formulas use it |
| C | Requester email |
| K | Queue status (`In Queue`, `In Progress`, `Completed`, `Flagged`, or `Processing...`) |
| L | Flag reason |
| M | Printer name; lookup/reporting input |
| O | Assistant name for assistant metrics |
| T:U | Printer lookup formulas on form submission |
| V | In-progress timestamp |
| W | Completion timestamp in Archive; request completion distribution reads W |
| Z:AD | Archive duration formulas |

The archive function appends the queue row data as provided by its caller, then writes W and Z:AD. Keep queue and archive row layouts compatible with this behavior.

## Dashboard output ownership

The logging functions write fixed column blocks. `updateAssistantMetrics()` currently calls `dashSheet.clear()` before writing A:E. The handler therefore runs it first, then the other functions repopulate their blocks. Adding unrelated data or formulas to `Dashboard_Data_Link` is unsafe unless that clearing behavior is changed.

## Destructive or reordering operations

- `cleanupEmptyQueueRows()` deletes rows when K is blank, even if other cells on those rows contain values.
- `removeDuplicateArchiveRows()` deletes rows considered duplicates across A:V.
- `archiveRowAndSendEmail()` appends to Archive, sends an email, and deletes the source queue row.
- `sortCurrentFilamentInventory()` reorders rows 8 onward using A as the key. It does not delete rows, but any separate references that depend on fixed row positions should be reviewed.

Use a copy of the spreadsheet to validate changes to row operations.
