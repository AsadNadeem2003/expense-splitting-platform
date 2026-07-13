# SplitEase — Group Expense Splitting App
### Full Technical Specification & Build Plan (for Claude Code / Agentic Execution)

> **Instructions for the AI coding agent:** Build this project phase by phase, in the exact order listed under "Build Phases." Do not skip the database schema step. After each phase, run and verify before moving to the next. Ask for clarification only if a requirement is genuinely ambiguous — otherwise use the defaults specified here.

---

## 1. Project Overview

A backend-first group expense-splitting application (Splitwise-style) with strict privacy gates, WhatsApp-based invite onboarding, paisa-precision financial math, and a full audit trail for disputes.

**Core principles the agent must respect throughout:**
- No floating-point currency math — everything is stored as integers (paisa).
- Every protected route passes through a fixed middleware pipeline (see Section 6).
- Every mutation to financial data must be auditable.
- Users cannot leave a group with a non-zero balance.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js (TypeScript) |
| Framework | Express.js |
| Validation | Zod |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (stateless), Bcrypt for password hashing |
| File uploads | Multer (local disk storage) |
| API style | REST, JSON |

---

## 3. Database Schema (Prisma)

Create `prisma/schema.prisma` with the following models. Field names are canonical — use exactly these.

```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  passwordHash  String
  createdAt     DateTime @default(now())

  groupMemberships   GroupMember[]
  pendingRequests    PendingJoinRequest[]
  paidExpenses       Expense[]            @relation("PaidBy")
  participations     ExpenseParticipant[]
  editHistories      ExpenseEditHistory[] @relation("EditedBy")
  settlementsPaid    Settlement[]         @relation("SettlementPayer")
  settlementsReceived Settlement[]        @relation("SettlementPayee")
}

model Group {
  id          String   @id @default(uuid())
  name        String
  inviteCode  String   @unique   // e.g. ROOM88
  createdById String
  createdAt   DateTime @default(now())

  members         GroupMember[]
  pendingRequests PendingJoinRequest[]
  expenses        Expense[]
}

model GroupMember {
  id       String   @id @default(uuid())
  groupId  String
  userId   String
  role     Role     @default(MEMBER)
  joinedAt DateTime @default(now())

  group Group @relation(fields: [groupId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
}

enum Role {
  ADMIN
  MEMBER
}

model PendingJoinRequest {
  id        String    @id @default(uuid())
  groupId   String
  userId    String
  status    JoinStatus @default(PENDING)
  createdAt DateTime  @default(now())

  group Group @relation(fields: [groupId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
}

enum JoinStatus {
  PENDING
  APPROVED
  REJECTED
}

model Expense {
  id           String   @id @default(uuid())
  groupId      String
  description  String
  totalAmount  Int      // stored in PAISA
  paidById     String   // primary payer (for single-payer case)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  group        Group    @relation(fields: [groupId], references: [id])
  paidBy       User     @relation("PaidBy", fields: [paidById], references: [id])
  participants ExpenseParticipant[]
  payers       ExpensePayer[]
  editHistory  ExpenseEditHistory[]
}

// Supports multi-payer bills
model ExpensePayer {
  id         String @id @default(uuid())
  expenseId  String
  userId     String
  amountPaid Int    // paisa

  expense Expense @relation(fields: [expenseId], references: [id])

  @@unique([expenseId, userId])
}

model ExpenseParticipant {
  id         String @id @default(uuid())
  expenseId  String
  userId     String
  shareAmount Int   // paisa — this participant's owed share

  expense Expense @relation(fields: [expenseId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([expenseId, userId])
}

model ExpenseEditHistory {
  id         String   @id @default(uuid())
  expenseId  String
  editedById String
  changeType String   // e.g. "PARTICIPANT_REMOVED", "AMOUNT_CHANGED"
  oldValue   Json
  newValue   Json
  createdAt  DateTime @default(now())

  expense  Expense @relation(fields: [expenseId], references: [id])
  editedBy User    @relation("EditedBy", fields: [editedById], references: [id])
}

model Settlement {
  id          String   @id @default(uuid())
  groupId     String
  payerId     String   // person who owes / is paying
  payeeId     String   // person receiving
  amount      Int      // paisa
  screenshotUrl String?
  status      SettlementStatus @default(AWAITING_VERIFICATION)
  createdAt   DateTime @default(now())
  confirmedAt DateTime?

  payer  User @relation("SettlementPayer", fields: [payerId], references: [id])
  payee  User @relation("SettlementPayee", fields: [payeeId], references: [id])
}

enum SettlementStatus {
  AWAITING_VERIFICATION
  CONFIRMED
  REJECTED
}
```

---

## 4. Module Breakdown

### 4.1 Onboarding & Group Entry
- `POST /auth/register` — Zod-validated body (name, email, password). Password hashed with Bcrypt (10+ salt rounds). Returns JWT.
- `POST /auth/login` — validates credentials, returns JWT.
- `POST /groups` — creates a Group; generates a unique invite code via a helper `generateInviteCode()`:
  - Generate a random 6–8 char alphanumeric string (e.g. `ROOM88`).
  - Query DB to check uniqueness; regenerate on collision (loop with max retries).
  - Store in `Group.inviteCode`.
- Invite delivery:
  - If the invitee is **not registered**: admin shares the code manually via WhatsApp (no backend email needed — just expose the code in the API response/UI).
  - If the invitee **is already registered**: `POST /groups/:id/invite` looks up the user by email and creates an in-app notification (or a simple `Invite` row) visible to them next time they log in — no external email service required.
- `POST /groups/join` — body: `{ inviteCode }`. Creates a `PendingJoinRequest` (status `PENDING`). Does **not** create a `GroupMember` row yet.
- `POST /groups/:id/approve/:requestId` — Admin-only. Moves the pending request to `APPROVED` and creates the `GroupMember` row in a single transaction.
- `POST /groups/:id/reject/:requestId` — Admin-only. Marks `REJECTED`.

### 4.2 Privacy & Security Gates
Implement as two separate, composable Express middlewares:

```
authMiddleware      -> verifies JWT, attaches req.user
groupAccessMiddleware -> checks GroupMember exists for req.user.id + req.params.groupId
                         else return 403 Forbidden immediately
```
`groupAccessMiddleware` must run **after** `authMiddleware` and **before** any controller that touches group-scoped data (expenses, members, settlements).

### 4.3 Financial Calculations
- All amounts accepted from client in **rupees with 2 decimals** at the API boundary, converted immediately to integer paisa (`Math.round(amount * 100)`) before touching the DB. Never store or compute with floats.
- Creating an expense:
  - Body includes `participants: [{ userId, shareAmount }]` (paisa) — only the selected subset of group members, not all.
  - Optionally `payers: [{ userId, amountPaid }]` for multi-payer bills; if omitted, single `paidById` is used with `amountPaid = totalAmount`.
  - Validate `sum(shareAmount) === totalAmount` and `sum(amountPaid) === totalAmount` before committing.
- **Net Balance calculation** (per user, per group):
  ```
  netBalance(user) = sum(amountPaid across all ExpensePayer rows for user)
                    - sum(shareAmount across all ExpenseParticipant rows for user)
  ```
  Positive = others owe this user. Negative = user owes others.
- Provide a service function `getGroupBalances(groupId)` returning a balance matrix, and `simplifyDebts(balances)` that reduces the matrix to a minimal set of payer→payee transactions (classic debt-simplification / greedy algorithm).

### 4.4 Human Error & Dispute Resolution
- `PATCH /expenses/:id` — payer-only (or admin). Updates participants/amounts.
  - On every change, write a row to `ExpenseEditHistory` capturing `oldValue`/`newValue` as JSON diffs and `changeType`.
- `POST /settlements` — payer uploads a screenshot via Multer (`/uploads/settlements/`), creates a `Settlement` row with `status = AWAITING_VERIFICATION`.
- `POST /settlements/:id/confirm` — **must** verify `req.user.id === settlement.payeeId**`, else 403. On confirm, set `status = CONFIRMED`, `confirmedAt = now()`, and this settlement is factored into balance recalculation (treat confirmed settlements as an offsetting transaction in `getGroupBalances`).
- `DELETE /groups/:id/leave` — before removing the `GroupMember` row, call `getGroupBalances` for that user; if `netBalance !== 0`, return `400` with message `"Cannot leave group with a non-zero balance."` Block the deletion.

### 4.5 The One-Way Request Pipeline
Every protected write route follows this exact middleware order:
```
Client Request
  → Zod Validator (route-level schema)
  → authMiddleware        (Gate 1: identity)
  → groupAccessMiddleware (Gate 2: membership)
  → Controller            (thin — just calls service)
  → Service                (all business logic, DB transactions)
  → PostgreSQL (via Prisma)
```
Controllers must **not** contain business logic — only request/response shaping. All calculations and multi-step DB writes live in the service layer, wrapped in `prisma.$transaction()` where multiple tables are touched.

---

## 5. Folder Structure

```
splitease/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── groupAccess.middleware.ts
│   │   └── validate.middleware.ts      # generic Zod validator wrapper
│   ├── validators/
│   │   ├── auth.schema.ts
│   │   ├── group.schema.ts
│   │   ├── expense.schema.ts
│   │   └── settlement.schema.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── group.routes.ts
│   │   ├── expense.routes.ts
│   │   └── settlement.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── group.controller.ts
│   │   ├── expense.controller.ts
│   │   └── settlement.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── group.service.ts
│   │   ├── expense.service.ts
│   │   ├── balance.service.ts          # netBalance + debt simplification
│   │   └── settlement.service.ts
│   ├── utils/
│   │   ├── inviteCode.ts               # generateInviteCode()
│   │   ├── money.ts                    # rupee<->paisa helpers
│   │   └── jwt.ts
│   ├── uploads/
│   │   └── settlements/                # Multer target dir
│   ├── prismaClient.ts
│   └── app.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 6. Environment Variables (`.env.example`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/splitease
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
PORT=4000
UPLOAD_DIR=./src/uploads/settlements
```

---

## 7. Key API Endpoints Summary

| Method | Route | Gate(s) | Purpose |
|---|---|---|---|
| POST | `/auth/register` | none | Register user |
| POST | `/auth/login` | none | Login, get JWT |
| POST | `/groups` | auth | Create group + invite code |
| POST | `/groups/:id/invite` | auth, group | In-app invite to registered user |
| POST | `/groups/join` | auth | Submit join request via inviteCode |
| POST | `/groups/:id/approve/:requestId` | auth, group (admin) | Approve pending request |
| POST | `/groups/:id/reject/:requestId` | auth, group (admin) | Reject pending request |
| GET | `/groups/:id/balances` | auth, group | Get net balance matrix |
| POST | `/expenses` | auth, group | Create expense w/ dynamic participants |
| PATCH | `/expenses/:id` | auth, group (payer/admin) | Edit expense + audit log |
| POST | `/settlements` | auth, group | Upload screenshot, mark awaiting verification |
| POST | `/settlements/:id/confirm` | auth, group (payee only) | Confirm settlement |
| DELETE | `/groups/:id/leave` | auth, group | Leave group (blocked if balance ≠ 0) |

---

## 8. Build Phases (execute in this order)

1. **Scaffold** — init Node+TS project, install Express/Prisma/Zod/Bcrypt/JWT/Multer, set up `tsconfig.json`, folder structure above.
2. **Database** — write `schema.prisma` exactly as in Section 3, run `prisma migrate dev`.
3. **Auth module** — register/login, Bcrypt hashing, JWT issuing, `authMiddleware`.
4. **Group module** — group creation, invite code generator + uniqueness check, join requests, approval flow, `groupAccessMiddleware`.
5. **Expense module** — expense creation with dynamic participants, paisa conversion helpers, multi-payer support.
6. **Balance service** — `getGroupBalances`, `simplifyDebts`.
7. **Edit & audit** — expense PATCH endpoint + `ExpenseEditHistory` writes.
8. **Settlement module** — Multer upload config, settlement creation, payee-only confirm logic.
9. **Exit block** — leave-group endpoint with balance check.
10. **Wire the one-way pipeline** — confirm every route uses validator → auth → group access → controller → service → DB, in that order.
11. **Testing pass** — manually test each endpoint with Postman/curl scripts; verify 403s fire correctly on Gate 2 violations.

---

## 9. Notes for the Agent

- Do not use floats anywhere in money-related code — grep for `parseFloat` near amount fields before finishing.
- Every route touching `:groupId` or `:id` belonging to a group must have `groupAccessMiddleware` — this is a common place to accidentally leave a security hole.
- Keep controllers thin; if a controller exceeds ~15 lines, move logic into the service layer.
- Use `prisma.$transaction` for: group creation + invite code save, join approval + GroupMember creation, expense creation + participants + payers insert.
