# July 15, 2026 - Work Log & Accomplishments

Today's focus was on finalizing the core feature set of the Expense Splitting Platform, focusing on advanced edge cases, admin controls, and audit trails.

## 1. Advanced Invite & User Discovery System
- **User Directory Integration**: Modified the `searchUsers` API to allow searching for registered users, and integrated it directly into the `GroupDetails` UI.
- **In-App Direct Invites**: Admins can now instantly add registered users directly from the group interface.
- **Shareable Links**: Added a prominent "Copy Invite Link" feature.
- **Security Check**: Enforced that anyone joining via an invite link is placed into a **Pending Requests** queue. The group Admin must explicitly approve them from the Members tab before they officially join the group.

## 2. Multi-Payer & Selective Participant Expenses
- **Advanced `AddExpenseModal`**: Upgraded the UI to support toggling between "Single Payer" and "Multiple Payers" for complex restaurant/trip bills.
- **Selective Splits**: Added the ability to select *specific* group members involved in an expense, rather than splitting it among the entire group by default. The system dynamically splits the amount equally among the selected checkboxes.
- **Validation**: Enforced that the total amount paid by multiple payers matches the total expense amount.

## 3. Advanced Expense Editing & Audit Trail (UI & Backend)
- **Full Expense Updates**: Rewrote the backend `updateExpense` logic to allow full modification of an expense (changing total amounts, who paid, and who was involved). The backend safely deletes old records and inserts new ones while maintaining transaction integrity.
- **Audit Logging**: Every edit logs a snapshot in `ExpenseEditHistory`, recording whether it was a `DESCRIPTION_CHANGED` or `FULL_EDIT`, along with the user who made the change.
- **Expense Details UI**: Built a brand new `ExpenseDetailModal` that opens when clicking an expense. It displays the exact breakdown of who paid and who owes, along with a timestamped **Audit Trail** of edits.
- **Edit Mode**: Linked the `ExpenseDetailModal` to the `AddExpenseModal`, allowing users to open the form pre-filled with existing data to easily make modifications.

## 4. Admin Controls & Bug Fixes
- **Remove Member Feature**: Added backend endpoints and UI for admins to remove members from a group.
- **Balance Validation**: Enforced that a member cannot be removed if they have a non-zero balance (they owe or are owed money).
- **Duplicate Account Fix**: Fixed a critical bug in `auth.service.ts` where case-sensitive emails (e.g., `Ali@gmail.com` vs `ali@gmail.com`) were creating duplicate accounts. Emails are now strictly lowercased and trimmed during registration and login.

## Pending Wrap-up Tasks
- **Leave Group Validation**: Added functionality for users to leave a group on their own, provided their balance is exactly 0. The system strictly enforces this rule on the backend.

## 5. Final Polish & UX
- **Toast Notifications**: Replaced all native browser alerts with sleek, modern `react-hot-toast` notifications.
- **Responsiveness**: Added mobile media queries so that group details, tabs, and action buttons stack perfectly on smaller screens.
- **Empty States**: Configured soft, muted illustrations and messages for zero-balance states and empty expense feeds.
