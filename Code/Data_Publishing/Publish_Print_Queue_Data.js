/**
 * Copies all dashboard values to the Print_Queue_Data sheet in the reporting
 * spreadsheet. Run manually or with a time-driven trigger after dashboard updates.
 */
const PRINT_QUEUE_DATA_TARGET_SPREADSHEET_ID = '14Tf89-Ykxk3q7-kend86jd6PuFRmsbw9c9vO0er8z_U';

function publishPrintQueueData() {
  const source = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Dashboard_Data_Link');
  if (!source) {
    throw new Error('Source sheet not found: Dashboard_Data_Link');
  }

  const target = SpreadsheetApp.openById(PRINT_QUEUE_DATA_TARGET_SPREADSHEET_ID)
    .getSheetByName('Print_Queue_Data');
  if (!target) {
    throw new Error('Target sheet not found: Print_Queue_Data');
  }

  const rowCount = source.getLastRow();
  const columnCount = source.getLastColumn();
  const values = rowCount > 0 && columnCount > 0
    ? source.getRange(1, 1, rowCount, columnCount).getValues()
    : [];

  if (target.getMaxRows() < rowCount) {
    target.insertRowsAfter(target.getMaxRows(), rowCount - target.getMaxRows());
  }
  if (target.getMaxColumns() < columnCount) {
    target.insertColumnsAfter(target.getMaxColumns(), columnCount - target.getMaxColumns());
  }

  // Clear the entire sheet so values outside the new data range do not linger.
  target.clearContents();
  if (values.length > 0) {
    target.getRange(1, 1, rowCount, columnCount).setValues(values);
  }

  Logger.log(`Published ${rowCount} rows and ${columnCount} columns to Print_Queue_Data.`);
}
