/**
 * Runs all logging updates in one Apps Script execution.
 *
 * Use one time-driven trigger for this handler instead of separate triggers
 * for each logging function. Keep the individual functions available for
 * independent maintenance and manual execution.
 */
function runLoggingUpdates() {
  const startedAt = new Date();
  Logger.log(`[Logging Handler] Started at ${startedAt.toISOString()}.`);

  // Each writer refreshes only its assigned dashboard block.
  const steps = [
    ['updateAssistantMetrics', updateAssistantMetrics],
    ['Printer_wear_leveling', Printer_wear_leveling],
    ['Request_and_Completion_Distribution', Request_and_Completion_Distribution],
    ['updateTopTenDashboards', updateTopTenDashboards],
    ['updateFlagReasonCounts', updateFlagReasonCounts],
  ];

  steps.forEach(([name, step], index) => {
    const stepStartedAt = new Date();
    Logger.log(
      `[Logging Handler] Step ${index + 1}/${steps.length} started: ${name} ` +
      `at ${stepStartedAt.toISOString()}.`,
    );

    try {
      step();
      const stepFinishedAt = new Date();
      Logger.log(
        `[Logging Handler] Step ${index + 1}/${steps.length} finished: ${name} ` +
        `at ${stepFinishedAt.toISOString()}.`,
      );
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      Logger.log(
        `[Logging Handler] Step ${index + 1}/${steps.length} failed: ${name}. ` +
        `Error: ${message}`,
      );
      console.error(`[Logging Handler] ${name} failed: ${message}`);
      throw error;
    }
  });

  const finishedAt = new Date();
  Logger.log(`[Logging Handler] Completed at ${finishedAt.toISOString()}.`);
}
