# End-to-End Architecture & Workflow

This document explains the complete end-to-end flow of the Expense Splitting Platform, detailing the folder structure, the core calculation theorem used for settlements, edge cases handled, and the function of each primary file. This is your definitive guide for presenting the platform to your CTO.

---

## 1. High-Level Monorepo Structure

The project follows an industry-standard **Monorepo** structure, completely decoupling the client UI from the API server.

```text
expense-splitting-platform/
│
├── frontend/             # React (Vite) + TypeScript + Tailwind CSS
├── backend/              # Node.js + Express + TypeScript + PostgreSQL (Prisma)
├── docs/                 # Documentation and architecture specs
├── scripts/              # Diagnostic utility scripts
├── .gitignore            # Root gitignore
└── README.md             # Project overview and start instructions
```

---

## 2. End-to-End User Flow & File Responsibilities

### Phase 1: Authentication & Onboarding
1. **User Action:** A user signs up or logs in.
2. **Frontend (`frontend/src/api/auth.ts`, `Login.tsx`):** Captures credentials and sends them to the backend. If the URL contains an `inviteCode` (e.g., they clicked a shared link), it captures this code to automatically process group joining after a successful login.
3. **Backend (`backend/src/controllers/auth.controller.ts`, `auth.service.ts`):** 
   - Hashes the password using `bcrypt`.
   - **Edge Case Handled:** Strictly normalizes the email to lowercase and trims whitespace to prevent duplicate accounts (e.g., `Ali@gmail.com` vs `ali@gmail.com`).
   - Generates a JWT (`backend/src/utils/jwt.ts`) for secure API access.

### Phase 2: Group Creation & Invitation
1. **User Action:** User creates a group and invites friends.
2. **Backend (`backend/src/services/group.service.ts`):** 
   - Creates the group and generates a unique, 6-character alphanumeric `inviteCode` (`backend/src/utils/inviteCode.ts`).
   - The creator is assigned the `ADMIN` role.
3. **User Discovery (`frontend/src/pages/GroupDetails.tsx`):**
   - The admin can search the entire database for existing registered users and send them an invite.
4. **Security/Edge Case (Pending Approvals):**
   - If someone uses the invite link, they do *not* instantly join. The system creates a `PendingJoinRequest`. The group admin must manually approve them from the UI. This prevents unauthorized access to private groups.

### Phase 3: Adding & Editing Expenses
1. **User Action:** A user adds a restaurant bill where multiple people paid, but only some people ate.
2. **Frontend (`frontend/src/components/expenses/AddExpenseModal.tsx`):**
   - Collects complex data: "Who paid what?" (Multi-Payer) and "Who is involved?" (Selective Splitting).
3. **Backend (`backend/src/services/expense.service.ts`):**
   - Creates the core `Expense` record.
   - Creates `ExpensePayer` records (who actually paid).
   - Creates `ExpenseParticipant` records (who is responsible for the debt).
   - **Audit Trail Edge Case:** Any modification to this expense is captured in `ExpenseEditHistory`. It takes a JSON snapshot of the `oldValue` and `newValue`, tracking exactly *who* made the edit and *when*.

### Phase 4: Settle Up & Leaving Groups
1. **User Action:** A user pays off their debt.
2. **Backend (`backend/src/services/settlement.service.ts`):**
   - Records the settlement.
3. **Edge Case (Leaving a Group):**
   - If a user tries to leave or an admin tries to remove a user, the backend verifies their net balance. A member *cannot* be removed if their balance is not exactly 0 (they still owe or are owed money).

---

## 3. The Calculation Theorem: Debt Simplification

When your CTO asks, **"How do you calculate who owes whom?"**, you must explain the **Debt Simplification Algorithm** (located in `backend/src/services/balance.service.ts`).

### The Problem
If Alice owes Bob Rs. 1000, Bob owes Charlie Rs. 1000, and Charlie owes Alice Rs. 1000, the net debt is Rs. 0. Without a simplification algorithm, the system would force three separate physical transactions.

### The Theorem (Greedy Algorithm for Minimum Cash Flow)
We use a Graph Theory algorithm designed to minimize the total number of transactions required to settle all debts in a group.

1. **Calculate Net Balances:**
   - We iterate over every `Expense` and `Settlement`.
   - We calculate a single `netBalance` integer for every user. 
   - *Positive Balance* = The user *owes* money to the group.
   - *Negative Balance* = The user *is owed* money by the group.
2. **Greedy Matching:**
   - We split users into two lists: `debtors` (those who owe) and `creditors` (those who are owed).
   - We sort both lists by amount (largest debtor vs largest creditor).
   - We take the person who owes the *most* money, and make them pay the person who is owed the *most* money. 
   - We subtract the settled amount from their balances and repeat the process until all balances are strictly `0`.
3. **Mathematical Guarantee:** This guarantees that a group of *N* people can be settled in at most *N - 1* transactions, eliminating all circular debts.

### Crucial Edge Case: Floating Point Precision
* **The Problem:** Computers are bad at decimal math (e.g., `0.1 + 0.2 = 0.30000000000000004`). In financial apps, this causes pennies to go missing or balances to never hit exactly 0.
* **The Solution (`backend/src/utils/money.ts`):** The entire backend completely ignores decimals. Before saving to the database, we multiply every amount by 100 to convert it to **"Paisa" (integer cents)**. The database only stores whole integers. When sending data back to the frontend, we divide by 100 to display the `Rs.` decimal amount.

---

## 4. Key Files Summary (Cheat Sheet)

### Backend
* `server.ts` / `index.ts`: The entry point. Connects to PostgreSQL and mounts the API routes.
* `prisma/schema.prisma`: The database architecture. Defines relationships between Users, Groups, Expenses, and Settlements.
* `balance.service.ts`: The absolute brain of the app. Houses the Debt Simplification theorem.
* `expense.service.ts`: Handles the complex logic of multi-payer inserts and Audit Trail logging.
* `money.ts`: The integer conversion utility preventing floating-point financial bugs.

### Frontend
* `api/client.ts`: The Axios interceptor. Automatically attaches the JWT token to every outgoing request.
* `pages/Dashboard.tsx`: Aggregates the user's global net balance across *all* their groups by interacting with `user.service.ts`.
* `components/expenses/ExpenseDetailModal.tsx`: Reads the `ExpenseEditHistory` to visually display the audit trail to users.
* `components/expenses/AddExpenseModal.tsx`: Contains the complex UI logic for dividing bills equally or unequally before sending payloads to the backend.
