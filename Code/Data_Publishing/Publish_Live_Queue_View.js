/**
 * Publishes the live queue's part names and statuses to the separate Live View
 * spreadsheet. Intended for an installable time-driven trigger every minute.
 */
const DATA_PUBLISHING_TARGET_SPREADSHEET_ID = '1ImfrODXSZJnrlmCbZWgwmbRJWNhXBaKslvKlgOymGTs';
const DATA_PUBLISHING_TARGET_SHEET_NAME = 'Live View';

function publishLiveQueueView() {
  const source = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(QUEUE_SHEET_NAME);
  if (!source) {
    throw new Error(`Source sheet not found: ${QUEUE_SHEET_NAME}`);
  }

  const targetSpreadsheet = SpreadsheetApp.openById(DATA_PUBLISHING_TARGET_SPREADSHEET_ID);
  const target = targetSpreadsheet.getSheetByName(DATA_PUBLISHING_TARGET_SHEET_NAME);
  if (!target) {
    throw new Error(`Target sheet not found: ${DATA_PUBLISHING_TARGET_SHEET_NAME}`);
  }

  const sourceLastRow = source.getLastRow();
  let queueRows = [];
  if (sourceLastRow >= 2) {
    const rowCount = sourceLastRow - 1;
    const partNames = source.getRange(2, 4, rowCount, 1).getValues();
    const statuses = source.getRange(2, 11, rowCount, 1).getValues();
    queueRows = partNames.map((partName, index) => [partName[0], statuses[index][0]]);
  }
  const requiredLastRow = Math.max(2, sourceLastRow);
  if (target.getMaxRows() < requiredLastRow) {
    target.insertRowsAfter(target.getMaxRows(), requiredLastRow - target.getMaxRows());
  }

  // Clear the previous projection first so removed queue rows do not linger.
  const targetLastRow = target.getLastRow();
  if (targetLastRow >= 2) {
    target.getRange(2, 1, targetLastRow - 1, 2).clearContent();
  }
  if (queueRows.length > 0) {
    const partNames = queueRows.map(([partName]) => [
      SpreadsheetApp.newRichTextValue().setText(String(partName)).build(),
    ]);
    const statuses = queueRows.map(([, status]) => [status]);
    target.getRange(2, 1, queueRows.length, 1).setRichTextValues(partNames);
    target.getRange(2, 2, queueRows.length, 1).setValues(statuses);
  }

  Logger.log(`Published ${queueRows.length} queue rows to ${DATA_PUBLISHING_TARGET_SHEET_NAME}.`);
}
