# Code

This directory contains Google Apps Script source, grouped by the work each function performs. Apps Script functions share a project namespace even though their source files are separate.

| Directory/file | Responsibility |
| --- | --- |
| [`Queue Handling/`](Queue%20Handling/README.md) | Form intake, status edits, queue cleanup, recovery sweeper, archival, and email |
| [`Archiving/`](Archiving/README.md) | Archive maintenance, including duplicate removal |
| [`Logging/`](Logging/README.md) | Dashboard metrics and inventory sorting |
| [`0-Authorize_Script.js`](0-Authorize_Script.js) | Authorization helper for MailApp |

See [the project docs](../docs/README.md) for workflows, spreadsheet contracts, trigger setup notes, and maintenance guidance.
