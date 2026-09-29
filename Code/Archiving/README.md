# Archiving

Archive maintenance utilities live here.

## `Remove_Archive_Duplicate_Rows.js`

`removeDuplicateArchiveRows()` calls Sheets' duplicate-removal operation on the Archive data range, using columns A through V as the duplicate comparison columns. It returns if the Archive sheet is missing or contains only its header row.

**Data impact:** this function deletes duplicate rows from the Archive sheet. Review the comparison columns and confirm there is a recoverable backup before running it or scheduling it. See [spreadsheet contracts](../../docs/spreadsheet-contracts.md).
