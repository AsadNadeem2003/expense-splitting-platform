# Expense Splitting Platform - Work Log
**Date**: July 14, 2026

## 1. Database & Infrastructure
* **Migrated to PostgreSQL**: Successfully transitioned the database engine from SQLite to PostgreSQL to ensure production-level scalability.
* **Prisma Updates**: Generated and applied new Prisma schemas tailored for PostgreSQL.

## 2. Group Management & Security
* **Pending Join Requests**: Overhauled group joining to include a security layer. Instead of automatic joining, users now submit a request using an Invite Code.
* **Admin Approval UI**: Built out a new section in the `GroupDetails` "Members" tab allowing Group Admins to actively Approve or Reject pending join requests.
* **Invite Codes**: Made invite codes clickable with an automatic "Click to copy" clipboard function and visual tooltip.

## 3. Financial & Settlement Logic
* **Double-Multiplication Bug Fix**: Identified and resolved a critical bug where currency was being incorrectly multiplied by 100 twice (once on the frontend, once on the backend), causing inflated balances.
* **Instant Settlements**: Updated the settlement flow to automatically mark payments as `CONFIRMED` (bypassing manual verification) so that user balances update in real-time immediately after hitting "Settle Up".
* **Currency Localization**: Replaced all instances of `₹` with Pakistani Rupees (`Rs.`) across the entire platform.

## 4. Dashboard & Analytics
* **Global Balance Aggregation**: Created a new backend architecture (`user.service.ts`) to scan every group a user belongs to and calculate their true net cash flow (Total Owed vs. Total Owes).
* **Unified Activity Feed**: Built an algorithm to fetch the 10 most recent transactions (merging both Expenses and Settlements) across all groups, determining whether the net impact was positive or negative to the user.
* **Dynamic Frontend Rendering**: Completely rewrote the `Dashboard.tsx` UI to fetch this live data and display real metrics instead of static dummy placeholders.

## 5. UI/UX Bug Fixes
* **Member Name Mapping Fix**: Fixed a strict typing bug (`string` vs `number` comparison) that caused the Balances tab to fallback to displaying IDs (e.g., "User 3 owes User 2") instead of actual human names.
* **Vite Type-Import Crash Fix**: Debugged a fatal "White Screen of Death" runtime crash caused by Vite improperly bundling a TypeScript Interface. Explicitly cast the import to `import type` to restore the application.
