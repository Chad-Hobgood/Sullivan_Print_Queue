/**
 * Counts current project types from Automation_Tools B5:B against archived
 * requests. Writes totals to Dashboard_Data_Link V:Y and an August-July
 * request time series to AA onward.
 */
function updateProjectTypeCounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const toolsSheet = ss.getSheetByName('Automation_Tools');
  const archiveSheet = ss.getSheetByName('Archive');
  if (!toolsSheet) throw new Error('Sheet not found: "Automation_Tools"');
  if (!archiveSheet) throw new Error('Sheet not found: "Archive"');

  const dashboardSheet = ss.getSheetByName('Dashboard_Data_Link') ||
    ss.insertSheet('Dashboard_Data_Link');
  const projectTypes = getCurrentProjectTypes_(toolsSheet);
  const counts = new Map(projectTypes.map(projectType => [projectType, {
    requested: 0,
    flagged: 0,
    completed: 0,
  }]));
  const academicYearMonths = getAcademicYearMonths_(new Date());
  const monthlyCounts = academicYearMonths.map(() => new Map(
    projectTypes.map(projectType => [projectType, 0]),
  ));
  const monthIndexByKey = new Map(academicYearMonths.map((month, index) => [
    getMonthKey_(month), index,
  ]));

  const archiveLastRow = archiveSheet.getLastRow();
  if (archiveLastRow >= 2 && projectTypes.length > 0) {
    // A:K includes request timestamp (A), project type (G), and status (K).
    const archiveRows = archiveSheet.getRange(2, 1, archiveLastRow - 1, 11).getValues();
    archiveRows.forEach(row => {
      const projectType = normalizeProjectType_(row[6]);
      if (!counts.has(projectType)) return;

      const projectTypeCounts = counts.get(projectType);
      projectTypeCounts.requested++;
      if (row[10] === 'Flagged') projectTypeCounts.flagged++;
      if (row[10] === 'Completed') projectTypeCounts.completed++;

      const requestDate = row[0];
      if (requestDate instanceof Date && !isNaN(requestDate.getTime())) {
        const monthIndex = monthIndexByKey.get(getMonthKey_(requestDate));
        if (monthIndex !== undefined) {
          monthlyCounts[monthIndex].set(
            projectType, monthlyCounts[monthIndex].get(projectType) + 1,
          );
        }
      }
    });
  }

  const summaryResults = [
    ['Project Type', 'Requested', 'Flagged', 'Completed'],
    ...projectTypes.map(projectType => {
      const projectTypeCounts = counts.get(projectType);
      return [projectType, projectTypeCounts.requested, projectTypeCounts.flagged,
        projectTypeCounts.completed];
    }),
  ];
  writeProjectTypeSummary_(dashboardSheet, summaryResults);

  const monthlyResults = [
    ['Month', ...projectTypes],
    ...academicYearMonths.map((month, monthIndex) => [
      Utilities.formatDate(month, ss.getSpreadsheetTimeZone(), 'MMMM yyyy'),
      ...projectTypes.map(projectType => monthlyCounts[monthIndex].get(projectType)),
    ]),
  ];
  writeMonthlyProjectTypeCounts_(dashboardSheet, monthlyResults);

  Logger.log(`Updated project type counts for ${projectTypes.length} current project types.`);
}

function getCurrentProjectTypes_(toolsSheet) {
  const toolsLastRow = toolsSheet.getLastRow();
  if (toolsLastRow < 5) return [];
  const projectTypes = toolsSheet.getRange(5, 2, toolsLastRow - 4, 1).getValues()
    .map(row => normalizeProjectType_(row[0]))
    .filter(projectType => projectType !== '');
  return [...new Set(projectTypes)];
}

function normalizeProjectType_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function getAcademicYearMonths_(referenceDate) {
  const startYear = referenceDate.getMonth() >= 7
    ? referenceDate.getFullYear()
    : referenceDate.getFullYear() - 1;
  return Array.from({ length: 12 }, (_, index) => new Date(startYear, 7 + index, 1));
}

function getMonthKey_(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function writeProjectTypeSummary_(dashboardSheet, results) {
  const startColumn = 22; // V
  ensureDashboardColumns_(dashboardSheet, startColumn + 3);
  const dashboardLastRow = dashboardSheet.getLastRow();
  const priorValues = dashboardLastRow > 0
    ? dashboardSheet.getRange(1, startColumn, dashboardLastRow, 1).getValues().flat()
    : [];
  let previousOutputRows = 0;
  for (let index = priorValues.length - 1; index >= 0; index--) {
    if (priorValues[index] !== '') {
      previousOutputRows = index + 1;
      break;
    }
  }
  dashboardSheet.getRange(1, startColumn, Math.max(previousOutputRows, results.length), 4)
    .clearContent();
  dashboardSheet.getRange(1, startColumn, results.length, 4).setValues(results);
  dashboardSheet.getRange('V1:Y1').setFontWeight('bold');
}

function writeMonthlyProjectTypeCounts_(dashboardSheet, results) {
  const startColumn = 27; // AA
  ensureDashboardColumns_(dashboardSheet, startColumn + results[0].length - 1);
  const previousWidth = Math.max(1, dashboardSheet.getLastColumn() - startColumn + 1);
  const priorHeaders = dashboardSheet.getRange(1, startColumn, 1, previousWidth).getValues()[0];
  let previousOutputWidth = 0;
  for (let index = priorHeaders.length - 1; index >= 0; index--) {
    if (priorHeaders[index] !== '') {
      previousOutputWidth = index + 1;
      break;
    }
  }
  const columnsToClear = Math.max(previousOutputWidth, results[0].length);
  dashboardSheet.getRange(1, startColumn, 13, columnsToClear).clearContent();
  dashboardSheet.getRange(1, startColumn, results.length, results[0].length).setValues(results);
  dashboardSheet.getRange(1, startColumn, 1, results[0].length).setFontWeight('bold');
}

function ensureDashboardColumns_(dashboardSheet, requiredLastColumn) {
  const existingColumns = dashboardSheet.getMaxColumns();
  if (existingColumns < requiredLastColumn) {
    dashboardSheet.insertColumnsAfter(existingColumns, requiredLastColumn - existingColumns);
  }
}
