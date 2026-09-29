# Developer documentation

This folder describes the current Apps Script codebase for maintainers, future lab leads, and AI coding assistants. Treat source code and the deployed Apps Script project as authoritative when this documentation and deployed configuration differ.

## Guides

- [Architecture and workflows](architecture.md): event flow from form submission through completion, archival, and reporting.
- [Spreadsheet contracts](spreadsheet-contracts.md): sheet names, important columns, and data ownership assumptions used by code.
- [Triggers and operations](triggers-and-operations.md): functions intended for event triggers or scheduled execution, plus their effects.
- [Developer guide](developer-guide.md): where to make changes, how to review them, and documentation expectations.

## Directory guides

Each code directory has a README describing its responsibilities and risk-bearing operations: [`Code/`](../Code/README.md), [`Archiving/`](../Code/Archiving/README.md), [`Logging/`](../Code/Logging/README.md), and [`Queue Handling/`](../Code/Queue%20Handling/README.md).

## Scope and confidence

These notes were written from the source files in this repository. This repository does not include an Apps Script manifest, trigger export, spreadsheet schema export, test suite, or deployment instructions. Confirm actual sheet headers, triggers, permissions, and timezone in the live Apps Script/Sheets project before changing operational setup.
