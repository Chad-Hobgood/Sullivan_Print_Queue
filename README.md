# Sullivan Print Queue

Google Apps Script automation for the Sullivan space's print request queue, archival workflow, inventory reporting, and dashboard metrics. The source is organized as separate `.js` files for deployment to the Apps Script project.

## Start here

- [Architecture and workflows](docs/architecture.md)
- [Spreadsheet sheet and column contracts](docs/spreadsheet-contracts.md)
- [Triggers and operations](docs/triggers-and-operations.md)
- [Developer guide](docs/developer-guide.md)
- [Code directory guide](Code/README.md)

## Important operational notes

- Queue processing can archive rows and send email. Verify the intended trigger and permissions before enabling automation.
- `cleanupEmptyQueueRows()` deletes queue rows whose status cell in column K is blank.
- `removeDuplicateArchiveRows()` removes duplicates from the Archive data range using columns A:V as the comparison key.
- `updateAssistantMetrics()` refreshes only its `Dashboard_Data_Link` A:E output block; the other dashboard data is preserved.
- `sortCurrentFilamentInventory()` sorts complete inventory rows from row 8 onward by column A and preserves the row 7 header.

These behaviors are described in more detail in the docs. Source comments and live Apps Script configuration remain the final authority for deployed behavior.
