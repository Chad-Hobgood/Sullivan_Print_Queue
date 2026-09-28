/**
 * Sorts filament inventory records alphabetically by column A.
 *
 * Row 7 contains the header and is left in place. The complete data rows are
 * sorted together starting at row 8 so values in other columns stay with
 * their corresponding filament.
 */
function sortCurrentFilamentInventory() {
  const startedAt = new Date();
  Logger.log(`[Filament Inventory Sort] Started at ${startedAt.toISOString()}.`);

  const sheetName = 'Current_Filament_Inventory';
  const headerRow = 7;
  const firstDataRow = headerRow + 1;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < firstDataRow || lastColumn < 1) {
    Logger.log('[Filament Inventory Sort] No inventory rows to sort.');
    return;
  }

  const rowCount = lastRow - firstDataRow + 1;
  Logger.log(
    `[Filament Inventory Sort] Sorting rows ${firstDataRow}-${lastRow} ` +
    `across columns A-${lastColumn} by column A.`,
  );

  sheet
    .getRange(firstDataRow, 1, rowCount, lastColumn)
    .sort({ column: 1, ascending: true });

  const finishedAt = new Date();
  Logger.log(
    `[Filament Inventory Sort] Sorted ${rowCount} rows. ` +
    `Completed at ${finishedAt.toISOString()}.`,
  );
}
