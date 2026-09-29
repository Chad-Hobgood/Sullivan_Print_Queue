/**
 * Publishes available filament names to the target sheet's student view.
 * Intended for a daily time-driven trigger.
 */
function publishStudentFilamentInventory() {
  const source = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Current_Filament_Inventory');
  if (!source) {
    throw new Error('Source sheet not found: Current_Filament_Inventory');
  }

  const target = SpreadsheetApp.openById(DATA_PUBLISHING_TARGET_SPREADSHEET_ID)
    .getSheetByName(DATA_PUBLISHING_TARGET_SHEET_NAME);
  if (!target) {
    throw new Error(`Target sheet not found: ${DATA_PUBLISHING_TARGET_SHEET_NAME}`);
  }

  const sourceLastRow = source.getLastRow();
  const inventoryRows = sourceLastRow >= 8
    ? source.getRange(8, 1, sourceLastRow - 7, 4).getValues()
    : [];
  const excludedNotes = ['Ignore in Student View', 'Special Filament Request'];
  const availableNames = inventoryRows
    .filter(row => Number(row[1]) > 100)
    .filter(row => !excludedNotes.some(note => String(row[3] || '').includes(note)))
    .map(row => [row[0]]);

  const outputStartRow = 13;
  const requiredLastRow = outputStartRow + availableNames.length - 1;
  if (requiredLastRow > target.getMaxRows()) {
    target.insertRowsAfter(target.getMaxRows(), requiredLastRow - target.getMaxRows());
  }

  // Remove names from the previous run, including entries that no longer qualify.
  const targetLastRow = target.getLastRow();
  if (targetLastRow >= outputStartRow) {
    target.getRange(outputStartRow, 4, targetLastRow - outputStartRow + 1, 1).clearContent();
  }
  if (availableNames.length > 0) {
    target.getRange(outputStartRow, 4, availableNames.length, 1).setValues(availableNames);
  }

  Logger.log(`Published ${availableNames.length} filament names to ${DATA_PUBLISHING_TARGET_SHEET_NAME}.`);
}
