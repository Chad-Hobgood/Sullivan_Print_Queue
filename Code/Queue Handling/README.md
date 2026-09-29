# Queue Handling

This directory contains the live request lifecycle functions.

| Function | Entry point | What it does |
| --- | --- | --- |
| `onFormSubmit(e)` | Form submit event | Adds printer lookup formulas in T:U and sets status K to `In Queue` |
| `onEdit(e)` | Queue status edit | Adds the in-progress timestamp or archives completed/flagged work |
| `processAnyRemainingStatusItems()` | Time-driven recovery | Finds older Completed/Flagged rows and retries archival |
| `cleanupEmptyQueueRows()` | Time-driven cleanup | Deletes queue rows with blank status in K |
| `archiveRowAndSendEmail(...)` | Called by edit and recovery functions | Appends to Archive, stamps/formulas, emails the requester, then deletes the source row |

**Data impact:** the archival path moves and deletes queue rows and sends email. The cleanup function deletes blank-status rows. The recovery sweep temporarily changes status to `Processing...`. Read [triggers and operations](../../docs/triggers-and-operations.md) before changing or scheduling these functions.

`QUEUE_SHEET_NAME` is defined in `Code/0-Authorize_Script.js` and currently points to `Form_Responses`. Spreadsheet column assumptions are listed in [spreadsheet contracts](../../docs/spreadsheet-contracts.md).
