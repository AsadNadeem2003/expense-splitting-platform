# SplitEase — Master CTO Interview & Technical Architecture Handbook

> **Confidential & Comprehensive Technical Guide**  
> Prepared for Senior Engineering & CTO Technical Evaluations.

---

## 🧭 Executive Summary & Core Value Proposition

**SplitEase** is an enterprise-grade, multi-tenant expense splitting and financial management platform engineered for roommates, travel groups, and collaborative teams. It solves the friction of multi-party financial reconciliation by:
1. **Collapsing Redundant Debts**: Reduces $N(N-1)$ cross-payments down to at most $N-1$ direct transfers via an optimal greedy debt simplification graph engine.
2. **Enforcing Absolute Financial Precision**: Utilizes zero floating-point integer-paisa arithmetic ($1\text{ PKR} = 100\text{ paisa}$) across the entire persistence and computation layer.
3. **Providing Full Auditability**: Tracks immutable change histories (`ExpenseEditHistory`) on all modified expenses.
4. **Ensuring Proof-Backed Settlements**: Integrates structured payment receiving accounts (**EasyPaisa**, **JazzCash**, **Raast ID**, **Nayapay**, **Sadapay**, **Bank IBAN**) with screenshot upload proof and two-way payee verification.
5. **Automating Debt Lifecycle Management**: Daily background cron jobs scan for unsettled debts older than 7 days and dispatch email notifications with strict 7-day cooldown guards.

---

## 🏗️ 1. End-to-End System Topology & Architectural Decisions

```
+-----------------------------------------------------------------------------------+
|                            CLIENT TIER (React 18 + Vite 8)                        |
|   * Responsive Mobile-First Design  * Axios JWT + Silent 401 Refresh Interceptors  |
|   * TailwindCSS Custom Tokens       * Sticky-Pinned Viewport Modal Architecture   |
|   * Live 15s Notification Polling   * Real-Time Mathematical Debt Playground      |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS 256-bit TLS (Port 443)
                                          v
+-----------------------------------------------------------------------------------+
|                        SECURITY & REVERSE PROXY (Nginx + SSL)                     |
|   * Let's Encrypt TLS Termination   * Gzip Static Asset Compression               |
|   * Reverse Proxies /api/ -> :4000  * Serves Static Frontend Bundle (/dist)       |
|   * Serves /api/uploads/ over SSL   * Strict CORS Whitelisting & Origin Checks    |
+-----------------------------------------+-----------------------------------------+
                                          | Reverse Proxy (Port 4000)
                                          v
+-----------------------------------------------------------------------------------+
|                     APPLICATION SERVER (Express 5.x + Node.js)                    |
|   * Helmet Security Headers         * Rate Limiters (Global / Auth / Invites)     |
|   * Stateless JWT (1h) + Cookie (7d)* Zod Request Validation Interceptors         |
|   * Greedy Debt Engine O(V log V)   * Integer-Paisa Arithmetic Utils              |
|   * Background node-cron (9:00 AM)  * Resilient Nodemailer & Multer Upload Armor  |
+-----------------------------------------+-----------------------------------------+
                                          | Connection Pool
                                          v
+-----------------------------------------------------------------------------------+
|                  DATA PERSISTENCE & ACID TRANSACTIONS (PostgreSQL 16)             |
|   * 10 Relational Models            * B-Tree Relational Foreign Key Indexes       |
|   * Atomic prisma.$transaction Roll * Zero Floating-Point BigInt/Int Paisa Store  |
|   * Immutable Audit History Logs    * Strict Cascade Constraints                  |
+-----------------------------------------------------------------------------------+
```

### 💡 Why This Stack Was Chosen:
- **Express 5.x + Node.js (ES Modules)**: High I/O performance, asynchronous non-blocking event loop ideal for concurrent balance queries and real-time polling.
- **PostgreSQL 16 + Prisma ORM**: Relational ACID guarantees ensure that multi-table balance operations (creating expenses, recalculating shares, recording payments) are completely atomic.
- **React 18 + Vite 8**: Sub-second Hot Module Replacement (HMR) and optimized Rolldown production chunking for fast mobile performance.
- **TailwindCSS**: Rapid prototyping with zero runtime CSS overhead, configured with modern typography (`Plus Jakarta Sans`) and responsive breakpoints.
- **Nginx Reverse Proxy on AWS EC2**: Offloads SSL termination and static file delivery from Node.js, providing enterprise-grade security and gzip compression.

---

## 🧠 2. Mathematical Foundations & Core Algorithms

### 1. Conservation of Net Balances Invariant
For any group of $N$ members, the relationship between members is represented as a directed weighted graph $G = (V, E)$. For each user $i \in V$, their net balance $B_i$ is defined as:

$$B_i = \sum \text{Amount Paid}_i - \sum \text{Owed Share}_i + \sum \text{Settlements Out}_i - \sum \text{Settlements In}_i$$

**The Fundamental Invariant**:
$$\sum_{i=1}^N B_i = 0$$

- **Creditor ($B_i > 0$)**: The user paid more than their share and is owed money by the group.
- **Debtor ($B_i < 0$)**: The user consumed more than they paid and owes money to the group.
- **Settled ($B_i = 0$)**: The user's contributions match their exact share.

### 2. Greedy Debt Simplification Engine ($O(V \log V)$)
Without optimization, $N$ people would require up to $N(N-1)$ cross-payments. SplitEase simplifies this down to at most **$N-1$ optimal bilateral transactions**:

```ts
// 1. Separate members into debtors and creditors
const debtors = members.filter(m => m.balance < 0).sort((a, b) => a.balance - b.balance);
const creditors = members.filter(m => m.balance > 0).sort((a, b) => b.balance - a.balance);

// 2. Greedily match largest debtor with largest creditor
let i = 0, j = 0;
while (i < debtors.length && j < creditors.length) {
  const debit = Math.abs(debtors[i].balance);
  const credit = creditors[j].balance;
  const settleAmount = Math.min(debit, credit);

  transactions.push({
    from: debtors[i].id,
    to: creditors[j].id,
    amount: settleAmount
  });

  debtors[i].balance += settleAmount;
  creditors[j].balance -= settleAmount;

  if (Math.abs(debtors[i].balance) < 1) i++;
  if (Math.abs(creditors[j].balance) < 1) j++;
}
```
**Why Greedy over NP-Hard Minimum Cash Flow?**  
While exact subset-sum matching is NP-Hard ($O(2^V)$), the Greedy heuristic runs in $O(V \log V)$, guarantees at most $N-1$ transactions, maintains $100\%$ mathematical balance conservation, and avoids high computational latency on multi-member groups.

### 3. Zero Floating-Point Error (Integer-Paisa Arithmetic)
JavaScript IEEE-754 binary floating-point numbers cannot accurately represent base-10 decimals (e.g. `0.1 + 0.2 === 0.30000000000000004`). In financial systems, cumulative rounding errors result in lost pennies and broken balance invariants.
- **SplitEase Rule**: All amounts are stored and calculated strictly as **Integers in Paisa** ($1 \text{ PKR} = 100 \text{ Paisa}$).
- **Conversion Utility**:
  - `rupeeToPaisa(rupees: number): number => Math.round(rupees * 100)`
  - `paisaToRupee(paisa: number): number => paisa / 100`

---

## 🗄️ 3. Database Schema & Relational Integrity (Prisma + PostgreSQL)

The platform schema consists of **10 interconnected relational models**:

1. **`User`**: `id`, `email` (unique), `password` (bcrypt hash), `name`, `paymentMethod` (verified receiving account details).
2. **`Group`**: `id`, `name`, `inviteCode` (unique 8-character string), `createdById`.
3. **`GroupMember`**: Composite relation (`groupId`, `userId`) with role (`ADMIN` vs `MEMBER`) and `joinedAt`.
4. **`GroupJoinRequest`**: Join queue with `status` (`PENDING`, `APPROVED`, `REJECTED`).
5. **`Expense`**: `id`, `groupId`, `description`, `totalAmount` (paisa), `splitType`, `paidById`, `createdAt`.
6. **`ExpensePayer`**: Multi-payer breakdown (`expenseId`, `userId`, `amountPaid` in paisa).
7. **`ExpenseParticipant`**: Share allocations (`expenseId`, `userId`, `shareAmount` in paisa).
8. **`ExpenseEditHistory`**: Audit trail snapshot (`expenseId`, `editorId`, `fieldName`, `oldValue`, `newValue`, `editedAt`).
9. **`Settlement`**: Payment record (`groupId`, `payerId`, `payeeId`, `amount`, `screenshotUrl`, `status`: `AWAITING_VERIFICATION` | `CONFIRMED` | `REJECTED`).
10. **`SettlementReminderLog`**: 7-day cooldown log (`groupId`, `debtorId`, `creditorId`, `amount`, `sentAt`).

### 🛡️ ACID Transactions & Cascade Safety
Any mutation that impacts multiple tables (e.g. creating an expense with multi-payers, editing a bill, or deleting a group) is executed inside `prisma.$transaction(async (tx) => { ... })`. If any child query fails, PostgreSQL automatically rolls back the entire transaction, guaranteeing 0 database corruption.

---

## 🔐 4. Core Workflows Deep Dive

### 1. Dual-Token Authentication & Silent Refresh
- **Access Token**: Stateless JWT expiring in **1 hour**, passed via `Authorization: Bearer <token>` in Axios headers.
- **Refresh Token**: Long-lived token (7 days) stored in a secure, `httpOnly`, `SameSite: strict` cookie.
- **Silent Refresh Interceptor**: When an access token expires (HTTP 401), the Axios response interceptor intercepts the error, calls `POST /api/auth/refresh`, receives a new access token, updates memory/storage, and seamlessly replays the failed request without logging out the user.

### 2. Group Leave & Zero-Balance Invariant
- **Invariant**: A user cannot leave a group if their balance $|B_i| \ge 100\text{ paisa}$ (Rs. 1.00). The API rejects the request with HTTP 400: *"Please settle your outstanding balances before leaving the group."*
- **Auto-Admin Promotion**: If an `ADMIN` leaves a group with other active members remaining, SplitEase automatically promotes the next longest-standing member (`joinedAt: 'asc'`) to `ADMIN`.
- **Atomic Deletion**: If the sole member leaves, the group is automatically purged.

### 3. Multi-Payer Shared Expenses & Audit Trail
- Supports single payer or multiple payers splitting unequal contributions across selected participants.
- Validates that $\sum \text{Payers} = \text{Total Amount}$ and $\sum \text{Participants} = \text{Total Amount}$.
- Edits record granular before/after diffs in `ExpenseEditHistory` for full compliance and transparency.

### 4. Two-Way Proof-Backed Settlement & Duplicate Guard
- Selecting a recipient in `SettleUpModal` displays their configured payment account (**EasyPaisa**, **JazzCash**, **Raast ID**, **Nayapay**, **Sadapay**, **Bank IBAN**) with a 1-click **Copy** button.
- Debtor attaches a payment receipt screenshot (handled via Multer disk storage).
- Status defaults to `AWAITING_VERIFICATION`. Group balances only update when the payee explicitly confirms receipt.
- **Duplicate Guard**: Blocks creating a new settlement if an `AWAITING_VERIFICATION` settlement already exists for the same payer/payee pair in that group.

### 5. Notification Center & 7-Day Reminder Auto-Dismiss
- Real-time 15s polling for join requests, settlement verifications, and reminders.
- When a debtor submits a settlement, the dashboard API automatically marks prior reminder logs as resolved and dismisses the unread badge from `1` to `0`.

---

## ☁️ 5. AWS EC2 Cloud Infrastructure & Deployment Nuances

### 1. AWS EC2 Server Configuration
- **Instance**: AWS EC2 `t3.micro` (Ubuntu 24.04 LTS).
- **Elastic IP**: `98.92.49.144` mapped to dynamic DNS `https://98.92.49.144.sslip.io`.
- **Web Server / Reverse Proxy**: Nginx routing `/` to `/var/www/splitease/frontend/dist` and `/api/` to `http://127.0.0.1:4000`.
- **SSL Certificate**: Let's Encrypt Certbot TLS/SSL certificate with automated cron renewal.
- **Process Manager**: PM2 running `pm2 start "npx tsx src/index.ts" --name "splitease-api"`.

### 2. Multer Screenshot SSL Proxying Nuance
- **Problem**: When running behind an HTTPS reverse proxy, static uploads at `http://localhost:4000/uploads/...` resulted in Mixed Content browser blocks and broken images.
- **Solution**: 
  1. Mounted static routes in Express: `app.use('/api/uploads', express.static('public/uploads'))`.
  2. Created frontend `getUploadUrl()` helper that maps relative paths through `/api/uploads/...`, ensuring all screenshots load seamlessly over HTTPS with Let's Encrypt TLS encryption.

### 3. Automated CI/CD Pipeline (GitHub Actions)
- `.github/workflows/deploy.yml` triggers on every `git push origin main`.
- Connects securely to AWS EC2 over SSH using GitHub Secrets (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`).
- Executes:
  ```bash
  cd /var/www/splitease
  git pull origin main
  cd backend && npm install && npx prisma db push && pm2 restart splitease-api
  cd ../frontend && npm install && npm run build
  sudo systemctl reload nginx
  ```

---

## 🎯 6. Top 15 Tough CTO Questions & Bulletproof Answers

#### Q1: "Explain how your debt simplification algorithm works."
> **Answer**: "Our debt simplification engine is based on graph theory and the Conservation of Net Balances invariant. First, we compute the net balance $B_i$ for every member by summing all amounts paid, subtracting their consumed shares, and factoring in confirmed settlements. Because all balances strictly sum to zero, we divide members into sorted debtors ($B < 0$) and sorted creditors ($B > 0$). We then run a greedy matching loop that pairs the largest debtor with the largest creditor for the minimum of their absolute balances, decrements their balances, records a direct transfer edge, and advances pointers when balances reach zero. This simplifies an $N(N-1)$ complete cross-debt graph down to at most $N-1$ optimal direct payments in $O(V \log V)$ time."

#### Q2: "Why did you store currency as integer paisa instead of PostgreSQL `DECIMAL` or JavaScript `Float`?"
> **Answer**: "JavaScript uses IEEE-754 double-precision binary floating-point numbers. Operations like `0.1 + 0.2` result in `0.30000000000000004`. If financial balances are computed in floating points, precision drift accumulates across multi-party splits, causing the net balance invariant $\sum B_i = 0$ to break. By storing everything as integer paisa ($1\text{ PKR} = 100\text{ paisa}$), every addition, subtraction, and comparison is an exact integer operation. We only convert to decimals at presentation time."

#### Q3: "How do you handle race conditions or partial failures when creating multi-payer expenses?"
> **Answer**: "We enforce relational ACID transactions using Prisma's `prisma.$transaction`. When a multi-payer expense is submitted, the creation of the parent `Expense` record, multiple `ExpensePayer` rows, and multiple `ExpenseParticipant` rows are executed inside a single atomic database transaction. If any validation fails or a connection drops midway, PostgreSQL automatically rolls back all changes, preventing orphan records or unbalanced group totals."

#### Q4: "How does your silent token refresh mechanism work?"
> **Answer**: "We implemented a dual-token strategy. Stateless access tokens expire in 1 hour and are stored in memory/headers, while long-lived refresh tokens (7 days) are stored in an `httpOnly`, `SameSite: strict` secure cookie to prevent XSS theft. When an access token expires, our Axios response interceptor catches the 401 response, calls `/api/auth/refresh` to rotate the cookie and obtain a new access token, updates the client session, and replays the original queued request seamlessly without forcing the user to log in again."

#### Q5: "What happens if an admin leaves a group?"
> **Answer**: "When a user requests to leave via `DELETE /api/groups/:groupId/leave`, we first enforce our Zero-Balance Invariant: if $|B_i| \ge 100\text{ paisa}$, the request is rejected until settled. If the user is an `ADMIN` and other members remain, our service automatically queries the remaining members ordered by `joinedAt: 'asc'` and promotes the next longest-standing member to `ADMIN`. If the leaving user is the sole member, the group is automatically deleted."

#### Q6: "Why did you choose a Greedy approach over an NP-hard Minimum Cash Flow solver?"
> **Answer**: "Finding the absolute global minimum number of transactions across multi-party debts maps to the NP-hard Subset Sum / Partition Problem, requiring $O(2^V)$ exponential time. For a collaborative platform, sub-millisecond response time is paramount. The Greedy heuristic runs in $O(V \log V)$, guarantees at most $N-1$ transactions, maintains $100\%$ balance conservation, and eliminates redundant cross-payments without incurring exponential latency."

#### Q7: "How do you prevent duplicate settlements and notification spam?"
> **Answer**: "We have guards at both the API and database levels. When creating a settlement, we check if an `AWAITING_VERIFICATION` settlement already exists for that payer/payee pair in that group; if so, the second submission is blocked. For reminders, we enforce a strict 7-day cooldown per debtor/creditor pair tracked in `SettlementReminderLog`, and our dashboard API automatically dismisses reminder notifications as soon as the debtor submits a payment."

#### Q8: "How does your background reminder cron job work?"
> **Answer**: "We run a daily 9:00 AM scheduled task using `node-cron`. The service queries the database for active groups, computes net balances, identifies debtors with debts older than 7 days, checks `SettlementReminderLog` for active 7-day cooldowns, and dispatches automated reminder emails via Nodemailer. If an ISP blocks port 587 or no live SMTP credentials are configured, it automatically falls back to an Ethereal test inbox and structured logger without crashing the server."

#### Q9: "How is your application deployed in production?"
> **Answer**: "It is deployed on an AWS EC2 instance running Ubuntu 24.04 LTS. Nginx acts as our reverse proxy and static file server, handling 256-bit TLS/SSL encryption via Let's Encrypt Certbot. Nginx serves the compiled React Vite frontend from `/var/www/splitease/frontend/dist` and proxies API requests (`/api/`) to our Node.js backend running on port 4000 managed by PM2. Deployments are 100% automated via GitHub Actions on every push to `main`."

#### Q10: "How did you design the mobile UX to feel like a native app?"
> **Answer**: "We implemented a mobile-first sticky modal viewport architecture. In `SettleUpModal` and `GlobalAddExpenseModal`, the modal header and action buttons are pinned to the top and bottom of the viewport with `z-[100]`, while form inputs and screenshot uploads scroll freely inside an independent flex container. This guarantees that action buttons like 'Record Payment' are always visible above the bottom navigation bar on all phone screen sizes."
