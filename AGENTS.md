# SplitEase — Production-Grade Expense Splitting & Debt Simplification Platform

## 📌 Project Overview
SplitEase is a full-stack, multi-tenant expense splitting and financial management platform designed for roommates, trip groups, and teams. It optimizes multi-party debts using algorithmic graph simplification, enforces strict financial precision using integer-paisa arithmetic, provides full audit trail tracking on expense edits, and automates 7-day debt reminder notifications via background cron jobs and email delivery.

---

## 🛠️ Technology Stack

### Backend
- **Runtime & Language**: Node.js (ES Modules, `"type": "module"`), TypeScript (`target: ES2022`, `moduleResolution: bundler`).
- **Framework**: Express.js 5.x.
- **ORM & Database**: Prisma ORM with PostgreSQL database connection pooling and relational ACID transactions.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing (salt factor 10).
- **Validation**: Zod schema validators (`auth.schema.ts`, `user.schema.ts`, `group.schema.ts`, `expense.schema.ts`, `settlement.schema.ts`) with custom request interception middleware.
- **Documentation**: OpenAPI 3.0 (Swagger UI) mounted on `/api-docs`.
- **Background Jobs**: `node-cron` scheduled tasks (daily 9:00 AM 7-day debt reminders).
- **Email Delivery**: Nodemailer with automated zero-config Ethereal test inbox, Resend API key auto-detection (`RESEND_API_KEY`), and resilient ISP port 587 fallback logger.
- **File Uploads**: Multer disk storage for settlement payment screenshots (`/uploads/settlements/`).

### Frontend
- **Framework & Build Tool**: React 18, Vite, TypeScript.
- **Styling**: TailwindCSS & custom modern CSS design tokens (`Plus Jakarta Sans` typography, mesh gradients, glassmorphism, responsive cards, mobile bottom navigation).
- **Icons & Animations**: Lucide React, Framer Motion.
- **Networking**: Axios instance with automatic JWT Bearer token injection and error interceptors.
- **Notifications**: `react-hot-toast` for real-time feedback and interactive notification dropdown popovers.

---

## 🧠 Core Engineering & Mathematical Foundations

### 1. Conservation of Net Balances (Graph Theory)
Financial relations within any group of $N$ members are represented as a directed weighted graph $G = (V, E)$. For each user $i$, their net balance $B_i$ is computed as:

$$B_i = \sum \text{Amount Paid}_i - \sum \text{Owed Share}_i + \sum \text{Settlements Out}_i - \sum \text{Settlements In}_i$$

- **Conservation Invariant**: $\sum_{i=1}^N B_i = 0$ (all net balances in a group strictly sum to zero).
- **$B_i > 0$ (Creditor)**: The user is owed money by the group.
- **$B_i < 0$ (Debtor)**: The user owes money to the group.

### 2. Greedy Debt Simplification Algorithm
To prevent $N(N-1)$ redundant cross-payments, SplitEase simplifies debts down to at most $N-1$ transactions:
1. Divide members into sorted arrays: `debtors` ($B_i < 0$, sorted ascending) and `creditors` ($B_j > 0$, sorted descending).
2. Greedily match the largest debtor with the largest creditor:
   $$\text{transfer\_amount} = \min(|B_{\text{debtor}}|, B_{\text{creditor}})$$
3. Reduce both balances by $\text{transfer\_amount}$ and record a direct transfer edge: $\text{debtor} \to \text{creditor}$.
4. Advance pointers when a member's balance reaches 0. Repeat until all balances reach 0.

### 3. Zero Floating-Point Error (Paisa Arithmetic)
All currency values are stored in PostgreSQL as **Integers in Paisa** ($1 \text{ PKR} = 100 \text{ Paisa}$). Decimal conversions occur exclusively at presentation time, eliminating binary floating-point rounding errors (e.g. `0.1 + 0.2 != 0.3`).

---

## 📂 Project Directory Structure

```
expense-splitting-platform/
├── AGENTS.md                   # Engineering guide & Agent operating manual
├── .gitignore                  # Git ignore rules (protects backend/.env)
├── docs/                       # Architectural diagrams & specifications
│   ├── ARCHITECTURE.md
│   └── implementation_plan.md
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (User, Group, Expense, Settlement, etc.)
│   ├── src/
│   │   ├── config/             # Prisma client, Swagger OpenAPI, Cron jobs
│   │   ├── controllers/        # Request handlers (auth, group, expense, settlement, user)
│   │   ├── middleware/         # authMiddleware, groupAccess, validateRequest, upload, errorHandler
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic & algorithms (balance, expense, reminder, email)
│   │   ├── utils/              # JWT, money (rupeeToPaisa/paisaToRupee), inviteCode generator
│   │   ├── validators/         # Zod schemas (auth, group, expense, settlement, user)
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example            # Environment variables template
└── frontend/
    ├── src/
    │   ├── api/                # Type-safe Axios client & endpoints
    │   ├── components/         # Reusable UI components (expenses, settlements, dashboard, layout)
    │   │   ├── dashboard/      # BalancesBreakdownModal
    │   │   ├── expenses/       # AddExpenseModal, ExpenseDetailModal, ExpenseList, GlobalAddExpenseModal
    │   │   ├── layout/         # AppLayout, NotificationsPopover, ProtectedRoute
    │   │   └── settlements/    # SettleUpModal
    │   ├── context/            # AuthContext (user session, login, register, updateUser, logout)
    │   ├── pages/              # Dashboard, GroupsList, GroupDetails, Activity, Settings, Login
    │   ├── types/              # TypeScript interface definitions
    │   ├── App.tsx             # Route declarations & Protected Routes
    │   └── main.tsx            # React root mount
    ├── package.json
    ├── tsconfig.json
    └── tailwind.config.js
```

---

## 🔑 Key Workflows & Features

1. **Authentication & Authorization**:
   - JWT authentication (`accessToken` stored in `localStorage`).
   - Group-level Role-Based Access Control (`ADMIN` vs `MEMBER`) enforced via `groupAccessMiddleware`.
2. **Multi-Payer & Multi-Participant Expense Splitting**:
   - Supports single payer or multiple payers splitting expenses unequally or equally among participants.
   - Deletion is restricted to the expense creator or primary payer and cascades across dependent relations.
   - Immutable audit trail (`ExpenseEditHistory`) logs changes (`oldValue` vs `newValue` snapshots).
   - Instant global expense creation from header and dashboard with group selection.
3. **Structured Payment Details & Settlement Flow**:
   - Users configure structured payment receiving accounts in Settings (**EasyPaisa**, **JazzCash**, **Raast ID**, **Nayapay**, **Sadapay**, or **Bank IBAN**).
   - In `SettleUpModal`, selecting a recipient automatically displays their verified account with a 1-click **Copy Account** button.
   - Status defaults to `AWAITING_VERIFICATION` and only updates group balances upon explicit payee confirmation.
   - **Duplicate Settlement Prevention**: Backend blocks creating a new settlement if the same payer already has an `AWAITING_VERIFICATION` settlement with the same payee in the same group, preventing accidental double payments and inflated balances.
4. **Interactive Notification Center (In-App Reminders & Verifications)**:
   - Floating `NotificationsPopover` on top-right bell icon with live unread badge counter (`remindersReceived` + `pendingVerifications`).
   - Displays incoming debtor nudges (e.g. *"Ahsan reminded you to settle your Rs. 1,454.55 debt in Kuch Bhi"*) with direct 1-click **Settle Up** action.
   - Displays incoming settlement verification requests with proof screenshot review links.
5. **Automated 7-Day Settlement Reminders & UI Nudges**:
   - Daily cron job scans for unsettled expenses older than 7 days and dispatches email notifications.
   - Strict 7-day cooldown per debtor/creditor pair tracked via `SettlementReminderLog` table to prevent spamming.
   - Interactive `Remind` buttons on the Group Balances tab and Dashboard "You Are Owed" breakdown modal allow 1-click manual nudges dispatched via both email and in-app alerts.
6. **Financial Intelligence & Analytics Feed**:
   - Activity page tracks complete user financial history: Total Settled Amount, Shared Expense Volume, and Active Groups.
   - Real-time search and filter chips for `All`, `Expenses`, and `Settlements`.
   - Text overflow protection with `truncate` and `overflow-hidden` on all user-generated content.
7. **Mobile-First Responsive Layout**:
   - Floating mobile bottom navigation bar on screens `< 768px` for Dashboard, Groups, Quick Add, Activity, and Settings.
   - Fluid card grids and responsive paddings across mobile, tablet, and desktop.
8. **Groups Page (Card Grid Layout)**:
   - Financial summary row (Active Groups count, You Are Owed, You Owe).
   - Responsive card grid with gradient-colored group avatars, creation dates, and member counts.
   - Clean modals for Create Group and Join Group with input validation.

---

## ⚙️ Setup & Local Development

### 1. Database & Backend
```bash
cd backend
npm install
# Ensure PostgreSQL is running on port 5432
npx prisma db push
npm run dev
```
- Backend runs on `http://localhost:4000`.
- Swagger API Docs: `http://localhost:4000/api-docs`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs on `http://localhost:5173`.

### 3. Environment Variables (`backend/.env`)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/splitease"
PORT=4000
JWT_SECRET="your_jwt_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"

# Resend Email Integration (Optional for live email delivery)
RESEND_API_KEY="re_xxxxxxx"
```

---

## 🛡️ Coding Guidelines for Agents & Engineers
- **Zero Floating-Point Math**: Always use integer paisa arithmetic for balance operations.
- **Database Transactions**: Any mutation involving multiple tables (e.g. expense creation, expense editing, member removal) must use `prisma.$transaction`.
- **Text Wrapping & Overflow**: Ensure all user-generated strings (names, descriptions, emails) use `break-words`, `break-all`, or `truncate` to prevent layout overflow.
- **Module Resolution**: Backend uses ES Modules (`import`/`export`) with `moduleResolution: bundler`. Avoid CommonJS `require()`.
- **Strict Documentation Sync**: Keep comments, docstrings, and this `AGENTS.md` file updated whenever adding new features or modifying architectural workflows.
