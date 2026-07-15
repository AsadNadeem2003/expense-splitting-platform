# Future Enhancements Backlog

This document tracks features that have been proposed and approved for future implementation, once the core functionality and frontend redesigns are fully completed across all three projects.

## 1. Export to Excel / CSV 📊
Allow users to download their expense and settlement data to keep records for personal budgeting outside the app.

**Implementation Strategy:**
- **Frontend-only approach**: Create a utility function in React that takes the currently loaded JSON data (from the `Activity` or `GroupDetails` pages).
- Map the data into a comma-separated format.
- Create a Blob and generate an invisible `<a>` tag with a `download` attribute to trigger the file download.
- No database changes required.

## 2. Email Notifications ✉️
Notify users via email when important actions occur in their groups (e.g., added to a group, huge expense added, or settlement confirmed).

**Implementation Strategy:**
- **Backend setup**: Install the `nodemailer` package in the Node.js server.
- **Email Provider**: Set up a dedicated Gmail account (e.g., `splitease.bot@gmail.com`) and generate a Google App Password for SMTP access.
- **Triggers**: Integrate the mailing function in the controllers:
  - `group.controller.ts` (when a user is added to a group).
  - `expense.controller.ts` (when a large expense is logged).
- Optionally, create a user preference in the database so users can toggle email notifications on or off.
