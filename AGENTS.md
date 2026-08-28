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
│   ├── INTERVIEW_CTO_MASTER_GUIDE.md # Comprehensive CTO Interview & Architectural Handbook
│   ├── TECH_STACK_REQUIREMENTS.md # Complete inventory of all 25+ packages, tools & runtimes
│   ├── ARCHITECTURE.md         # System Topology & Stack Specification
│   ├── ERD_DATA_MODELS.md      # Database ERD & Schema Reference
│   ├── DEBT_SIMPLIFICATION_ENGINE.md # Mathematical Foundations & Graph Algorithm
│   └── SEQUENCE_DIAGRAMS.md    # Core Workflow Sequence Diagrams
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (User, Group, Expense, Settlement, etc.)
│   ├── src/
│   │   ├── config/             # Prisma client, Swagger OpenAPI, Cron jobs
│   │   ├── controllers/        # Request handlers (auth, group, expense, settlement, user)
│   │   ├── middleware/         # authMiddleware, groupAccess, validateRequest, rateLimiter, upload, errorHandler
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic & algorithms (balance, expense, reminder, email)
│   │   ├── utils/              # JWT, money (rupeeToPaisa/paisaToRupee), inviteCode generator
│   │   ├── validators/         # Zod schemas (auth, group, expense, settlement, user)
│   │   └── index.ts            # Server entry point with Helmet & Rate Limiters
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example            # Environment variables template
└── frontend/
    ├── src/
    │   ├── api/                # Type-safe Axios client & endpoints
    │   ├── components/         # Reusable UI components (expenses, settlements, dashboard, layout)
    │   │   ├── dashboard/      # BalancesBreakdownModal, OnboardingGuide
    │   │   ├── expenses/       # AddExpenseModal, ExpenseDetailModal, ExpenseList, GlobalAddExpenseModal
    │   │   ├── layout/         # AppLayout, NotificationsPopover, ProtectedRoute
    │   │   ├── modals/         # AlgorithmExplainerModal
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
2. **Group Lifecycle, Leave Group & Cascade Deletion**:
   - Members can leave groups (`DELETE /api/groups/:groupId/leave`) guarded by a **Zero-Balance Invariant** (unsettled balances $|\text{balance}| \ge 100 \text{ paisa}$ are blocked until settled).
   - If an ADMIN leaves, the system automatically promotes the next longest-standing member to ADMIN. If the sole member leaves, the group is automatically deleted.
   - Admins and creators can delete groups (`DELETE /api/groups/:groupId`) with atomic `prisma.$transaction` cascading across expenses, payers, participants, edit histories, settlements, reminders, and memberships.
3. **Security Hardening (Phase 1 & Phase 2)**:
   - **Global Security Headers (`helmet`)**: Protects against clickjacking, MIME sniffing, and disables `X-Powered-By`.
   - **Rate Limiting (`express-rate-limit`)**: Enforces 10 req/15min on auth endpoints, 20 req/15min on group invites, and 300 req/15min globally.
   - **Swagger Production Guard**: Disables `/api-docs` and schema access when `NODE_ENV === 'production'`.
   - **Multer Armor**: Restricts uploads strictly to valid image MIME types (`jpeg`, `png`, `webp`) and file extensions with a 5MB limit.
   - **Strict CORS Origin Whitelisting**: Restricts API calls to permitted origins in production with `credentials: true`.
   - **Extended Access Tokens (1h)**: Stateless JWTs expire every 1 hour for smooth, uninterrupted usage while maintaining security.
   - **HttpOnly Secure Refresh Cookies (7d)**: Long-lived refresh tokens stored exclusively in `httpOnly`, `SameSite` cookies, making XSS token theft impossible.
   - **Silent Token Rotation (`/api/auth/refresh`)**: Axios response interceptor intercepts 401s, rotates the refresh cookie, updates access token in flight, and retries queued requests seamlessly.
   - **Secure Server Logout (`/api/auth/logout`)**: Explicitly clears httpOnly cookie on server and local storage on client.
4. **Multi-Payer & Multi-Participant Expense Splitting**:
   - Supports single payer or multiple payers splitting expenses unequally or equally among participants.
   - Deletion is restricted to the expense creator or primary payer and cascades across dependent relations.
   - Immutable audit trail (`ExpenseEditHistory`) logs changes (`oldValue` vs `newValue` snapshots).
   - Instant global expense creation from header and dashboard with group selection.
5. **Structured Payment Details & Settlement Flow**:
   - Users configure structured payment receiving accounts in Settings (**EasyPaisa**, **JazzCash**, **Raast ID**, **Nayapay**, **Sadapay**, or **Bank IBAN**).
   - In `SettleUpModal`, selecting a recipient automatically displays their verified account with a 1-click **Copy Account** button.
   - Status defaults to `AWAITING_VERIFICATION` and only updates group balances upon explicit payee confirmation.
   - **Duplicate Settlement Prevention**: Backend blocks creating a new settlement if the same payer already has an `AWAITING_VERIFICATION` settlement with the same payee in the same group, preventing accidental double payments and inflated balances.
6. **Interactive Notification Center & Member Discovery (Approach 2 Architecture)**:
   - **Real-Time Group Join Request Alerts**: Group admins receive real-time join request notifications with live 15s polling and 1-click instant **Approve (✓)** / **Reject (✕)** buttons directly inside `NotificationsPopover`.
   - **Direct Members Tab Deep-Linking**: Clicking "Review & Approve →" switches active tab to `?tab=members` with a glowing pending request queue and badge counter.
   - **1-Click WhatsApp Sharing & Direct Links**: Groups support 1-click WhatsApp message sharing (`https://wa.me/?text=...`) and direct invite links (`/login?inviteCode=...`) with seamless auto-join for logged-in and new users.
   - **Privacy-Compliant Targeted Search**: Group invite search requires $\ge 2$ characters to protect platform privacy (preventing open directory browsing by strangers) while allowing instant 1-click adding when a friend's name/email is known.
   - **Duplicate Active Membership Guard**: Prevents redundant join requests if the user is already an active member of the group.
7. **Automated 7-Day Settlement Reminders & UI Nudges**:
   - Daily cron job scans for unsettled expenses older than 7 days and dispatches email notifications.
   - Strict 7-day cooldown per debtor/creditor pair tracked via `SettlementReminderLog` table to prevent spamming.
   - Interactive `Remind` buttons on the Group Balances tab and Dashboard "You Are Owed" breakdown modal allow 1-click manual nudges dispatched via both email and in-app alerts.
8. **Financial Intelligence & Analytics Feed**:
   - Activity page tracks complete user financial history: Total Settled Amount, Shared Expense Volume, and Active Groups.
   - Real-time search and filter chips for `All`, `Expenses`, and `Settlements`.
   - Text overflow protection with `truncate` and `overflow-hidden` on all user-generated content.
9. **Mobile-First Responsive Layout & Sticky Viewport Modal Architecture**:
    - Floating mobile bottom navigation bar on screens `< 768px` for Dashboard, Groups, Quick Add, Activity, and Settings.
    - **Pinned Sticky Modal Viewport**: Modal footers (e.g. "Record Payment", "Save Expense") are pinned to the bottom of the viewport with `z-[100]` and sticky headers at the top, while form fields and screenshot uploads scroll freely inside an independent flex container. This guarantees action buttons are never pushed off-screen or obscured by mobile navigation bars.
    - Responsive 3-column horizontal analytics stat row on Activity page and fluid card grids across mobile, tablet, and desktop.
10. **Groups Page (Card Grid Layout)**:
    - Financial summary row (Active Groups count, You Are Owed, You Owe).
    - Responsive card grid with gradient-colored group avatars, creation dates, and member counts.
    - Clean modals for Create Group and Join Group with input validation.
11. **Enterprise Client Documentation Portal (`/docs` & `?docs`)**:
    - Interactive 8-section technical portal covering Architecture, Debt Simplification Engine, Zero Floating-Point Paisa Math, Database ERDs, Sequence Diagrams, Security Hardening, REST API Reference with 1-click Copy cURL, and AWS EC2 / CI/CD DevOps blueprints.
    - Embedded **Live Debt Simplification Playground** for real-time mathematical graph testing.
    - Publicly accessible without authentication and deep-linked in the sidebar, header, and login footer.

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

## 🚀 AWS EC2 Production & CI/CD Architecture
- **Server**: AWS EC2 `t3.micro` / `t3.small` (Ubuntu 24.04 LTS).
- **Web Server / Reverse Proxy**: Nginx routing `/` to `/var/www/splitease/frontend/dist` and `/api/` to `http://127.0.0.1:4000`.
- **Process Manager**: PM2 running Node.js backend (`pm2 start "npx tsx src/index.ts" --name "splitease-api"`).
- **Automated CI/CD**: GitHub Actions workflow ([`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml)) auto-deploys to EC2 over SSH on every `git push origin main`.

---

## 🛡️ Coding Guidelines for Agents & Engineers
- **Zero Floating-Point Math**: Always use integer paisa arithmetic for balance operations.
- **Database Transactions**: Any mutation involving multiple tables (e.g. expense creation, expense editing, member removal) must use `prisma.$transaction`.
- **Text Wrapping & Overflow**: Ensure all user-generated strings (names, descriptions, emails) use `break-words`, `break-all`, or `truncate` to prevent layout overflow.
- **Module Resolution**: Backend uses ES Modules (`import`/`export`) with `moduleResolution: bundler`. Avoid CommonJS `require()`.
- **Strict Documentation Sync**: Keep comments, docstrings, and this `AGENTS.md` file updated whenever adding new features or modifying architectural workflows.
