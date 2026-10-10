/**
 * Reports archive timing distributions and completed-job duration summaries.
 *
 * Archive timestamps: A = submitted, V = moved to In Progress, W = archived.
 * A flagged row can be archived directly without a V timestamp, so flagged
 * response time is measured from A to W. Completed print duration is V to W.
 *
 * Dashboard_Data_Link ownership: AA:AK beginning at row 16.
 */
function updateTimeDelayAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const archiveSheet = ss.getSheetByName('Archive');
  const toolsSheet = ss.getSheetByName('Automation_Tools');
  const printerSheet = ss.getSheetByName('Current Printer Information');
  if (!archiveSheet) throw new Error('Sheet not found: "Archive"');
  if (!toolsSheet) throw new Error('Sheet not found: "Automation_Tools"');
  if (!printerSheet) throw new Error('Sheet not found: "Current Printer Information"');

  const dashboardSheet = ss.getSheetByName('Dashboard_Data_Link') ||
    ss.insertSheet('Dashboard_Data_Link');
  const archiveRecords = getArchiveTimingRecords_(archiveSheet);
  const distributions = [
    {
      title: 'Submission to In Progress',
      values: archiveRecords.map(record => record.submittedToStartedHours).filter(isNumber_),
    },
    {
      title: 'Submission to Flagged',
      values: archiveRecords.filter(record => record.status === 'Flagged')
        .map(record => record.submittedToFinishedHours).filter(isNumber_),
    },
    {
      title: 'Submission to Completed',
      values: archiveRecords.filter(record => record.status === 'Completed')
        .map(record => record.submittedToFinishedHours).filter(isNumber_),
    },
    {
      title: 'In Progress to Completed',
      values: archiveRecords.filter(record => record.status === 'Completed')
        .map(record => record.startedToFinishedHours).filter(isNumber_),
    },
  ];
  writeTimeDelayDistributions_(dashboardSheet, distributions);

  const completedRecords = archiveRecords.filter(record =>
    record.status === 'Completed' && isNumber_(record.startedToFinishedHours),
  );
  const printerNames = getConfiguredPrinterNames_(printerSheet);
  const projectTypes = getConfiguredProjectTypes_(toolsSheet);
  writeTimeDelaySummaries_(dashboardSheet, completedRecords, printerNames, projectTypes, archiveRecords);

  Logger.log(`Updated time delay analysis from ${archiveRecords.length} archived requests.`);
}

function getArchiveTimingRecords_(archiveSheet) {
  const lastRow = archiveSheet.getLastRow();
  if (lastRow < 2) return [];

  // A:W supplies submitted (A), type (G), status (K), printer (M), V, and W.
  return archiveSheet.getRange(2, 1, lastRow - 1, 23).getValues().map(row => ({
    projectType: normalizeTimingValue_(row[6]),
    status: normalizeTimingValue_(row[10]),
    printer: normalizeTimingValue_(row[12]),
    submittedToStartedHours: getElapsedHours_(row[0], row[21]),
    submittedToFinishedHours: getElapsedHours_(row[0], row[22]),
    startedToFinishedHours: getElapsedHours_(row[21], row[22]),
  }));
}

function getElapsedHours_(start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) return null;
  const hours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
  return hours >= 0 ? hours : null;
}

function isNumber_(value) {
  return typeof value === 'number' && isFinite(value);
}

function normalizeTimingValue_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function getConfiguredPrinterNames_(printerSheet) {
  const lastRow = printerSheet.getLastRow();
  if (lastRow < 8) return [];
  return [...new Set(printerSheet.getRange(8, 1, lastRow - 7, 1).getValues()
    .flat().map(normalizeTimingValue_).filter(Boolean))];
}

function getConfiguredProjectTypes_(toolsSheet) {
  const lastRow = toolsSheet.getLastRow();
  if (lastRow < 5) return [];
  return [...new Set(toolsSheet.getRange(5, 2, lastRow - 4, 1).getValues()
    .flat().map(normalizeTimingValue_).filter(Boolean))];
}

function writeTimeDelayDistributions_(dashboardSheet, distributions) {
  const startRow = 16;
  const startColumn = 27; // AA
  const blockWidth = 3; // Two data columns plus one spacer.
  const distributionTables = distributions.map(distribution => [
    [distribution.title, ''],
    ['Hours', 'Count'],
    ...buildHourBins_(distribution.values),
  ]);
  const rowCount = Math.max(3, ...distributionTables.map(table => table.length));
  ensureTimeDelayColumns_(dashboardSheet, startColumn + distributions.length * blockWidth - 2);
  dashboardSheet.getRange(startRow, startColumn, Math.max(100, rowCount), distributions.length * blockWidth - 1)
    .clearContent();
  // Clear the former AL:AO portion of this module's output after its layout
  // changed from three columns per metric to two columns plus one spacer.
  dashboardSheet.getRange(startRow, 38, Math.max(100, rowCount), 4).clearContent();

  distributionTables.forEach((table, index) => {
    const column = startColumn + index * blockWidth;
    dashboardSheet.getRange(startRow, column, table.length, 2).setValues(table);
    dashboardSheet.getRange(startRow, column, 2, 2).setFontWeight('bold');
  });
}

function buildHourBins_(hours) {
  if (hours.length === 0) return [['No data', 0]];

  const roundedHours = hours.map(value => Math.round(value));
  const sortedHours = [...roundedHours].sort((a, b) => a - b);
  const min = sortedHours[0];
  const max = sortedHours[sortedHours.length - 1];
  const outlierThreshold = getHighOutlierThreshold_(sortedHours);
  const regularMax = outlierThreshold === null ? max : Math.max(min, outlierThreshold - 1);
  const binWidth = Math.max(1, Math.ceil((regularMax - min + 1) / 10));
  const rows = [];

  for (let lower = min; lower <= regularMax; lower += binWidth) {
    const upper = Math.min(regularMax, lower + binWidth - 1);
    const count = roundedHours.filter(value => value >= lower && value <= upper).length;
    rows.push([formatHourRange_(lower, upper), count]);
  }
  if (outlierThreshold !== null) {
    rows.push([`> ${regularMax} hrs`, roundedHours.filter(value => value > regularMax).length]);
  }
  return rows;
}

function getHighOutlierThreshold_(sortedValues) {
  if (sortedValues.length < 4) return null;
  const q1 = percentile_(sortedValues, 0.25);
  const q3 = percentile_(sortedValues, 0.75);
  const threshold = Math.floor(q3 + 1.5 * (q3 - q1));
  return threshold < sortedValues[sortedValues.length - 1] ? threshold : null;
}

function percentile_(sortedValues, percentile) {
  const index = (sortedValues.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return lower === upper ? sortedValues[lower] :
    sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

function formatHourRange_(lower, upper) {
  return lower === upper ? `${lower} hrs` : `${lower}-${upper} hrs`;
}

function writeTimeDelaySummaries_(dashboardSheet, completedRecords, printerNames, projectTypes, archiveRecords) {
  const startRow = 16;
  const startColumn = 43; // AQ
  const printerResults = [
    ['Completed Print Duration by Printer', 'Average Hours', 'Min Hours', 'Max Hours'],
    ...printerNames.map(printer => summaryRow_(printer, completedRecords
      .filter(record => record.printer === printer)
      .map(record => record.startedToFinishedHours))),
  ];
  const typeResults = [
    ['Completed Print Duration by Project Type', 'Average Hours', 'Min Hours', 'Max Hours'],
    ...projectTypes.map(projectType => summaryRow_(projectType, completedRecords
      .filter(record => record.projectType === projectType)
      .map(record => record.startedToFinishedHours))),
  ];
  const completedHours = archiveRecords.filter(record => record.status === 'Completed')
    .map(record => record.submittedToFinishedHours).filter(isNumber_);
  const flaggedHours = archiveRecords.filter(record => record.status === 'Flagged')
    .map(record => record.submittedToFinishedHours).filter(isNumber_);
  const statusResults = [
    ['Final Status', 'Average Hours', 'Min Hours', 'Max Hours'],
    summaryRow_('Completed (Submission to Completion)', completedHours),
    summaryRow_('Flagged (Submission to Flagging)', flaggedHours),
  ];
  const tables = [printerResults, typeResults, statusResults];
  const totalRows = tables.reduce((count, table) => count + table.length + 1, 0);
  ensureTimeDelayColumns_(dashboardSheet, startColumn + 3);
  dashboardSheet.getRange(startRow, startColumn, Math.max(100, totalRows), 4).clearContent();

  let row = startRow;
  tables.forEach(table => {
    dashboardSheet.getRange(row, startColumn, table.length, 4).setValues(table);
    dashboardSheet.getRange(row, startColumn, 1, 4).setFontWeight('bold');
    row += table.length + 1;
  });
}

function summaryRow_(label, values) {
  if (values.length === 0) return [label, 'No Uses', 'No Uses', 'No Uses'];
  const roundedValues = values.map(value => Math.round(value));
  const total = roundedValues.reduce((sum, value) => sum + value, 0);
  return [label, Math.round(total / roundedValues.length), Math.min(...roundedValues), Math.max(...roundedValues)];
}

function ensureTimeDelayColumns_(dashboardSheet, requiredLastColumn) {
  const existingColumns = dashboardSheet.getMaxColumns();
  if (existingColumns < requiredLastColumn) {
    dashboardSheet.insertColumnsAfter(existingColumns, requiredLastColumn - existingColumns);
  }
}
