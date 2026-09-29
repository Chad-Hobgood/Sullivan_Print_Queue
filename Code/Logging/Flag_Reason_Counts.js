/**
 * Counts archived requests marked Flagged for each current flag reason.
 * Writes the reason list and its counts to Dashboard_Data_Link columns S:T.
 */
function updateFlagReasonCounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const toolsSheet = ss.getSheetByName("Automation_Tools");
  const archiveSheet = ss.getSheetByName("Archive");
  if (!toolsSheet) throw new Error('Sheet not found: "Automation_Tools"');
  if (!archiveSheet) throw new Error('Sheet not found: "Archive"');

  const dashboardSheet = ss.getSheetByName("Dashboard_Data_Link") ||
    ss.insertSheet("Dashboard_Data_Link");

  const toolsLastRow = toolsSheet.getLastRow();
  const flagReasons = toolsLastRow >= 5
    ? toolsSheet.getRange(5, 3, toolsLastRow - 4, 1).getValues()
      .flat()
      .filter(reason => reason !== "" && reason !== null)
    : [];
  const reasonCounts = new Map(flagReasons.map(reason => [reason, 0]));

  const archiveLastRow = archiveSheet.getLastRow();
  if (archiveLastRow >= 2) {
    // Archive K contains print status and L contains the selected flag reason.
    const archiveStatusesAndReasons = archiveSheet.getRange(2, 11, archiveLastRow - 1, 2)
      .getValues();
    archiveStatusesAndReasons.forEach(([status, reason]) => {
      if (status === "Flagged" && reasonCounts.has(reason)) {
        reasonCounts.set(reason, reasonCounts.get(reason) + 1);
      }
    });
  }

  const results = [
    ["Flag Reason", "Flagged Count"],
    ...flagReasons.map(reason => [reason, reasonCounts.get(reason)]),
  ];

  // Clear only this report's previous output in S:T, including any stale tail.
  const dashboardLastRow = dashboardSheet.getLastRow();
  let previousOutputLastRow = 0;
  if (dashboardLastRow > 0) {
    const previousReasons = dashboardSheet.getRange(1, 19, dashboardLastRow, 1)
      .getValues()
      .flat();
    for (let index = previousReasons.length - 1; index >= 0; index--) {
      if (previousReasons[index] !== "") {
        previousOutputLastRow = index + 1;
        break;
      }
    }
  }
  const rowsToClear = Math.max(previousOutputLastRow, results.length);
  dashboardSheet.getRange(1, 19, rowsToClear, 2).clearContent();
  dashboardSheet.getRange(1, 19, results.length, 2).setValues(results);
  dashboardSheet.getRange("S1:T1").setFontWeight("bold");

  Logger.log(`Updated flag reason counts for ${flagReasons.length} current reasons.`);
}
