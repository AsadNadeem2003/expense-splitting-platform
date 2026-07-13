# SplitEase — Complete Implementation Plan

## Background & Problem

The [PROJECT_SPEC (2).md](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/PROJECT_SPEC%20(2).md) defines a full-featured expense-splitting backend + frontend. The existing backend under [server/](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server) is **~15% complete** — only the auth module works, and even that has bugs. The Prisma schema exists but diverges significantly from the spec. There is **no frontend** at all.

---

## Part A: Backend Gap Analysis (Spec vs Existing)

### A.1 — Prisma Schema Differences

| Area | Spec Requires | Existing Has | Action |
|------|--------------|-------------|--------|
| **ID types** | `String @id @default(uuid())` | `Int @id @default(autoincrement())` | ⚠️ Keep existing `Int` autoincrement — changing ID types requires a full DB reset and rewrite of every relation. This is a cosmetic difference only. |
| **Role enum** | `enum Role { ADMIN, MEMBER }` | Missing entirely | **ADD** |
| **JoinStatus enum** | `enum JoinStatus { PENDING, APPROVED, REJECTED }` | `enum RequestStatus { PENDING, APPROVED, REJECTED }` | **RENAME** to `JoinStatus` |
| **SettlementStatus enum** | `AWAITING_VERIFICATION, CONFIRMED, REJECTED` | `PENDING, AWAITING_VERIFICATION, SETTLED` | **REPLACE** values |
| **User model** | Relation names: `"PaidBy"`, `"EditedBy"`, `"SettlementPayer"`, `"SettlementPayee"` | Different relation names: `"PayerSettlements"`, `"PayeeSettlements"`, no named relations on expenses/edits | **UPDATE** relation names |
| **Group model** | `createdById String` | `ownerId Int` | **RENAME** field |
| **GroupMember** | Has `role Role @default(MEMBER)` | Missing `role` field | **ADD** role field |
| **PendingJoinRequest** | `@@unique([groupId, userId])` | Missing unique constraint | **ADD** constraint |
| **Expense model** | `paidById`, `totalAmount`, `updatedAt @updatedAt`, `payers ExpensePayer[]` | `payerId`, `amount`, no `updatedAt`, no `payers` | **RENAME** fields, **ADD** missing fields |
| **ExpensePayer model** | Full model with `amountPaid` | Completely missing | **CREATE** entire model |
| **ExpenseParticipant** | `shareAmount` | `amountOwed` | **RENAME** field |
| **Settlement** | `screenshotUrl`, `confirmedAt DateTime?`, no group relation | `evidenceUrl`, no `confirmedAt`, has `groupId` + Group relation | **RENAME**, **ADD** `confirmedAt`, **ADD** `groupId` (keep, useful for queries) |
| **ExpenseEditHistory** | `changeType String`, `oldValue Json`, `newValue Json`, `createdAt`, relation `"EditedBy"` | Only `oldAmount Int`, `newAmount Int`, `editedAt` | **REPLACE** with JSON-based audit fields |

### A.2 — Implemented vs Missing Backend Code

#### ✅ What EXISTS and works:
| File | Status |
|------|--------|
| [authController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/authController.js) | ✅ Complete (register + login) |
| [authService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/authService.js) | ✅ Complete |
| [auth.schema.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/validators/auth.schema.js) | ✅ Complete |
| [validateRequest.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/validateRequest.js) | ✅ Complete |
| [errorHandler.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/errorHandler.js) | ✅ Complete |
| [jwt.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/utils/jwt.js) | ✅ Complete (has access + refresh tokens) |
| [prisma.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/config/prisma.js) | ✅ Complete |
| [index.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/index.js) | ⚠️ Partial — only mounts auth routes |

#### 🐛 Bugs in existing code:
1. **[auth.js routes](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/auth.js#L21)**: `loginSchema` is used on line 21 but never imported — only `registerSchema` is imported. Login route will crash.
2. **[index.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/index.js#L1)**: Mixes `require('dotenv').config()` (CJS) with ESM `import` statements — will fail in strict ESM mode.

#### ❌ EMPTY stub files (comment only, no code):
| File | What Spec Requires |
|------|-------------------|
| [middleware/auth.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/auth.js) | JWT verification middleware (`authMiddleware`) |
| [middleware/groupAccess.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/groupAccess.js) | Group membership check middleware |
| [middleware/upload.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/upload.js) | Multer config for settlement screenshots |
| [controllers/groupController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/groupController.js) | Group CRUD, invite, join, approve, reject, leave |
| [controllers/expenseController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/expenseController.js) | Create/edit expense, get balances |
| [controllers/settlementController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/settlementController.js) | Create settlement, confirm/reject |
| [routes/groups.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/groups.js) | All group endpoints |
| [routes/expenses.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/expenses.js) | All expense endpoints |
| [routes/settlements.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/settlements.js) | All settlement endpoints |
| [services/groupService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/groupService.js) | Group business logic |
| [services/expenseService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/expenseService.js) | Expense business logic |
| [services/settlementService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/settlementService.js) | Settlement business logic |
| [validators/group.schema](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/validators/group.schema) | Group Zod schemas (also missing `.js` extension!) |
| [utils/patternAnalyzer.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/utils/patternAnalyzer.js) | Not in spec — can remove or repurpose |
| [utils/settlementGraph.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/utils/settlementGraph.js) | Not in spec — can remove or repurpose |
| [constants/errors.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/constants/errors.js) | Not in spec — extra directory |
| [constants/status.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/constants/status.js) | Not in spec — extra directory |
| [.env.example](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/.env.example) | Should contain `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `UPLOAD_DIR` |

#### ❌ Completely MISSING files (not even stubs):
| File | Purpose |
|------|---------|
| `validators/expense.schema.js` | Expense Zod schemas |
| `validators/settlement.schema.js` | Settlement Zod schemas |
| `utils/inviteCode.js` | `generateInviteCode()` helper |
| `utils/money.js` | Rupee ↔ Paisa conversion helpers |
| `services/balance.service.js` | `getGroupBalances()` + `simplifyDebts()` |

### A.3 — Language Decision

> [!IMPORTANT]
> The spec says **TypeScript**, but your entire existing codebase is **plain JavaScript (ESM)**. Should we:
> - **Option A**: Keep JavaScript (recommended — avoids rewriting all existing working code)
> - **Option B**: Convert everything to TypeScript (much larger effort, requires rewriting all existing files)
>
> **This plan assumes Option A (keep JavaScript)** unless you say otherwise.

---

## Part B: Backend Completion Plan

### Phase 1 — Fix Existing Bugs & Schema Update

#### [MODIFY] [schema.prisma](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/prisma/schema.prisma)
- Add `Role` enum (`ADMIN`, `MEMBER`)
- Rename `RequestStatus` → `JoinStatus`
- Fix `SettlementStatus` enum values → `AWAITING_VERIFICATION`, `CONFIRMED`, `REJECTED`
- Rename `Group.ownerId` → `Group.createdById`
- Add `role` field to `GroupMember`
- Add `@@unique([groupId, userId])` to `PendingJoinRequest`
- Rename `Expense.payerId` → `Expense.paidById`, `Expense.amount` → `Expense.totalAmount`
- Add `Expense.updatedAt @updatedAt`
- Create entire `ExpensePayer` model
- Rename `ExpenseParticipant.amountOwed` → `ExpenseParticipant.shareAmount`
- Rename `Settlement.evidenceUrl` → `Settlement.screenshotUrl`, add `confirmedAt`
- Replace `ExpenseEditHistory` fields with `changeType`, `oldValue Json`, `newValue Json`, `createdAt`
- Update all relation names to match spec

#### [MODIFY] [auth.js (routes)](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/auth.js)
- Import `loginSchema` from auth.schema.js (currently missing import — causes crash)

#### [MODIFY] [index.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/index.js)
- Fix the CJS/ESM mixing (`require('dotenv')` → `import 'dotenv/config'`)
- Mount group, expense, and settlement routes
- Add `/uploads` static serving for settlement screenshots

#### [MODIFY] [.env.example](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/.env.example)
- Add all required env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `UPLOAD_DIR`

---

### Phase 2 — Core Middleware

#### [MODIFY] [middleware/auth.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/auth.js)
- Implement `authMiddleware`: extract Bearer token from `Authorization` header, verify with `verifyAccessToken()`, attach `req.user = { id, ... }`, return 401 on failure

#### [MODIFY] [middleware/groupAccess.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/groupAccess.js)
- Implement `groupAccessMiddleware`: check `GroupMember` exists for `req.user.id` + `req.params.groupId` (or `req.body.groupId`), return 403 if not a member, optionally attach `req.membership` with role info

#### [MODIFY] [middleware/upload.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/middleware/upload.js)
- Configure Multer with disk storage pointing to `public/uploads/settlements/`
- File filter for images only, size limit ~5MB

---

### Phase 3 — Group Module

#### [MODIFY] [services/groupService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/groupService.js)
- `createGroup(userId, data)` — create Group + GroupMember (ADMIN role) in `$transaction`, generate invite code
- `joinGroup(userId, inviteCode)` — create PendingJoinRequest
- `approveRequest(adminId, groupId, requestId)` — verify admin role, update request status, create GroupMember in `$transaction`
- `rejectRequest(adminId, groupId, requestId)` — verify admin role, set status REJECTED
- `inviteUser(adminId, groupId, email)` — look up user by email, create notification/invite
- `leaveGroup(userId, groupId)` — check balance via `getGroupBalances()`, block if non-zero, delete GroupMember
- `getGroupDetails(groupId)` — return group with members
- `getUserGroups(userId)` — return all groups user belongs to

#### [MODIFY] [controllers/groupController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/groupController.js)
- Thin handlers for: `createGroup`, `joinGroup`, `approveRequest`, `rejectRequest`, `inviteUser`, `leaveGroup`, `getGroupDetails`, `getUserGroups`

#### [NEW] [validators/group.schema.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/validators/group.schema.js)
- Zod schemas: `createGroupSchema`, `joinGroupSchema`, `inviteUserSchema`
- Delete the old extensionless `group.schema` file

#### [MODIFY] [routes/groups.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/groups.js)
- `POST /` → auth → createGroup
- `POST /join` → auth → joinGroup
- `GET /my` → auth → getUserGroups
- `GET /:groupId` → auth, groupAccess → getGroupDetails
- `POST /:groupId/invite` → auth, groupAccess → inviteUser
- `POST /:groupId/approve/:requestId` → auth, groupAccess → approveRequest
- `POST /:groupId/reject/:requestId` → auth, groupAccess → rejectRequest
- `DELETE /:groupId/leave` → auth, groupAccess → leaveGroup

#### [NEW] [utils/inviteCode.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/utils/inviteCode.js)
- `generateInviteCode()` — random 6-8 char alphanumeric, DB uniqueness check with max retry loop

---

### Phase 4 — Expense Module

#### [NEW] [utils/money.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/utils/money.js)
- `rupeeToPaisa(rupees)` → `Math.round(rupees * 100)`
- `paisaToRupee(paisa)` → `paisa / 100`

#### [MODIFY] [services/expenseService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/expenseService.js)
- `createExpense(userId, data)` — validate `sum(shareAmount) === totalAmount` and `sum(amountPaid) === totalAmount`, create Expense + ExpenseParticipants + ExpensePayers in `$transaction`
- `updateExpense(userId, expenseId, data)` — verify payer/admin, update fields, write ExpenseEditHistory with JSON diffs in `$transaction`
- `getExpense(expenseId)` — return expense with participants and payers
- `getGroupExpenses(groupId)` — return all expenses for a group

#### [MODIFY] [controllers/expenseController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/expenseController.js)
- Thin handlers: `createExpense`, `updateExpense`, `getExpense`, `getGroupExpenses`

#### [NEW] [validators/expense.schema.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/validators/expense.schema.js)
- `createExpenseSchema` — validates body with `groupId`, `description`, `totalAmount`, `participants[]`, optional `payers[]`
- `updateExpenseSchema` — partial update schema

#### [MODIFY] [routes/expenses.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/expenses.js)
- `POST /` → validate, auth, groupAccess → createExpense
- `GET /group/:groupId` → auth, groupAccess → getGroupExpenses
- `GET /:id` → auth → getExpense
- `PATCH /:id` → validate, auth → updateExpense

---

### Phase 5 — Balance Service

#### [NEW] [services/balance.service.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/balance.service.js)
- `getGroupBalances(groupId)` — compute net balance per user: `sum(amountPaid) - sum(shareAmount)`, factor in confirmed settlements as offsets
- `simplifyDebts(balances)` — greedy debt-simplification algorithm reducing the balance matrix to minimal payer→payee transactions
- `getUserBalance(groupId, userId)` — single user's net balance in a group

---

### Phase 6 — Settlement Module

#### [MODIFY] [services/settlementService.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/services/settlementService.js)
- `createSettlement(payerId, data, file)` — create Settlement with `AWAITING_VERIFICATION`, save screenshot path
- `confirmSettlement(payeeId, settlementId)` — verify `req.user.id === settlement.payeeId`, set `CONFIRMED`, set `confirmedAt`
- `rejectSettlement(payeeId, settlementId)` — set `REJECTED`
- `getGroupSettlements(groupId)` — list all settlements for a group

#### [MODIFY] [controllers/settlementController.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/controllers/settlementController.js)
- Thin handlers: `createSettlement`, `confirmSettlement`, `rejectSettlement`, `getGroupSettlements`

#### [NEW] [validators/settlement.schema.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/validators/settlement.schema.js)
- `createSettlementSchema` — validates `groupId`, `payeeId`, `amount`

#### [MODIFY] [routes/settlements.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/routes/settlements.js)
- `POST /` → validate, auth, groupAccess, upload → createSettlement
- `POST /:id/confirm` → auth → confirmSettlement
- `POST /:id/reject` → auth → rejectSettlement
- `GET /group/:groupId` → auth, groupAccess → getGroupSettlements

---

### Phase 7 — Cleanup

#### [DELETE] [validators/group.schema](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/validators/group.schema) (extensionless file)
#### [DELETE] [src/expense.schema.js](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/server/src/expense.schema.js) (misplaced stub)

Files to keep but leave empty for now (not required by spec, can be useful later):
- `utils/patternAnalyzer.js`, `utils/settlementGraph.js`
- `constants/errors.js`, `constants/status.js`

---

## Part C: Frontend Plan (New — Vite + React)

> [!IMPORTANT]
> There is **no frontend** currently. We will scaffold a new Vite + React app at `d:\Amperor Tech Internship Projects\expense-splitting-platform\frontend\` with a premium dark-mode UI.

### C.1 — Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Vite + React |
| Styling | Vanilla CSS with CSS Custom Properties (design tokens) |
| HTTP Client | Fetch API with auth interceptor |
| Routing | React Router v6 |
| State | React Context + useReducer for auth, local state for everything else |
| Icons | Lucide React |

### C.2 — Frontend Pages & Components

#### Auth Pages
| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Email + password form, JWT storage, redirect to dashboard |
| **Register** | `/register` | Name + email + password form, auto-login after register |

#### Main App Pages (Protected — require auth)
| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/` | Overview of all user's groups, quick stats (total owed/owe), recent activity |
| **Group Detail** | `/groups/:groupId` | Group members, expenses list, balance summary, invite code display, pending requests (admin view) |
| **Add Expense** | `/groups/:groupId/expenses/new` | Form: description, total amount (₹), select participants, split method, optional multi-payer |
| **Expense Detail** | `/expenses/:id` | Full expense breakdown, edit history audit trail, edit button (payer/admin) |
| **Balances** | `/groups/:groupId/balances` | Net balance matrix, simplified debts view, "Settle Up" buttons |
| **Settle Up** | `/groups/:groupId/settle` | Select payee, enter amount, upload screenshot, submit |
| **Settlements** | `/groups/:groupId/settlements` | List of all settlements with statuses, confirm/reject buttons for payees |
| **Create Group** | `/groups/new` | Group name form, shows generated invite code |
| **Join Group** | `/groups/join` | Enter invite code form |

#### Shared Components
| Component | Purpose |
|-----------|---------|
| `Navbar` | App navigation, user menu, logout |
| `Sidebar` | Group list navigation |
| `ProtectedRoute` | Auth guard wrapper |
| `GroupCard` | Group summary card for dashboard |
| `ExpenseCard` | Expense row/card in group detail |
| `BalanceChart` | Visual balance display (who owes whom) |
| `MemberAvatar` | User avatar with name |
| `Modal` | Reusable modal (confirm actions, forms) |
| `Toast` | Notification toast system |
| `LoadingSpinner` | Loading state indicator |
| `EmptyState` | Empty state illustrations |

### C.3 — Frontend Folder Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                  # Global styles + design tokens
│   ├── api/
│   │   ├── client.js              # Fetch wrapper with auth headers
│   │   ├── auth.js                # Login, register API calls
│   │   ├── groups.js              # Group CRUD API calls
│   │   ├── expenses.js            # Expense API calls
│   │   └── settlements.js         # Settlement API calls
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state + JWT management
│   ├── hooks/
│   │   ├── useAuth.js             # Auth context consumer hook
│   │   └── useApi.js              # Generic API call hook with loading/error
│   ├── components/
│   │   ├── Navbar.jsx + .css
│   │   ├── Sidebar.jsx + .css
│   │   ├── ProtectedRoute.jsx
│   │   ├── GroupCard.jsx + .css
│   │   ├── ExpenseCard.jsx + .css
│   │   ├── BalanceChart.jsx + .css
│   │   ├── MemberAvatar.jsx + .css
│   │   ├── Modal.jsx + .css
│   │   ├── Toast.jsx + .css
│   │   ├── LoadingSpinner.jsx + .css
│   │   └── EmptyState.jsx + .css
│   └── pages/
│       ├── Login.jsx + .css
│       ├── Register.jsx + .css
│       ├── Dashboard.jsx + .css
│       ├── GroupDetail.jsx + .css
│       ├── AddExpense.jsx + .css
│       ├── ExpenseDetail.jsx + .css
│       ├── Balances.jsx + .css
│       ├── SettleUp.jsx + .css
│       ├── Settlements.jsx + .css
│       ├── CreateGroup.jsx + .css
│       └── JoinGroup.jsx + .css
```

### C.4 — Design System

- **Theme**: Dark mode primary with glassmorphism cards
- **Colors**: Deep navy (`#0a0e27`) background, vibrant gradient accents (teal `#00d4aa` → purple `#7c3aed`), subtle glass surfaces with `rgba(255,255,255,0.05)` backgrounds
- **Typography**: Google Fonts — "Inter" for body, "Outfit" for headings
- **Cards**: `backdrop-filter: blur(20px)`, subtle borders with `rgba(255,255,255,0.1)`
- **Animations**: Smooth page transitions, card hover lifts, button ripples, skeleton loading states
- **Currency Display**: Always show ₹ with 2 decimal places (convert paisa from API)

---

## Open Questions

> [!IMPORTANT]
> **Q1: TypeScript vs JavaScript?**
> The spec says TypeScript but all existing code is JavaScript. This plan keeps JavaScript. Should I convert to TypeScript instead? (This would ~3x the effort.)

> [!IMPORTANT]
> **Q2: Database Reset?**
> The schema changes (field renames, new models, enum changes) will require a fresh Prisma migration. This will **destroy existing data** in the database. Is that acceptable?

> [!IMPORTANT]
> **Q3: Keep `Int` IDs or switch to UUID `String` IDs?**
> The spec says UUID strings, but your existing schema uses auto-increment integers. Switching requires rewriting every relation. This plan keeps integers. Confirm?

> [!WARNING]
> **Q4: The `backend/docs/` directory** currently has stub docs ([data-models.md](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/docs/data-models.md), [API_SPEC.md](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/docs/API_SPEC.md), [AUTH_FLOW.md](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/docs/AUTH_FLOW.md)). Should we update these too, or ignore?

---

## Verification Plan

### Automated Tests
```bash
# After schema update
cd server && npx prisma migrate dev --name align-with-spec

# Verify server starts
npm run dev

# After frontend scaffold
cd frontend && npm run dev
```

### Manual Verification
- Test every API endpoint with Postman/curl:
  - Auth: register → login → get JWT
  - Groups: create → get invite code → join → approve → get members
  - Expenses: create (single payer) → create (multi-payer) → verify `sum === total` validation
  - Balances: get group balances → verify simplified debts
  - Settlements: create with screenshot → confirm as payee → verify balance offset
  - Leave: attempt leave with non-zero balance → verify 400 block
  - Privacy: attempt to access group data without membership → verify 403
- Test frontend flows end-to-end against the running backend

---

## Execution Order

| Step | Phase | Scope | Estimated Files |
|------|-------|-------|----------------|
| 1 | Schema Update | Prisma migration | 1 file |
| 2 | Bug Fixes | Fix auth route import, fix ESM/CJS mix | 2 files |
| 3 | Core Middleware | auth, groupAccess, upload middleware | 3 files |
| 4 | Group Module | service, controller, routes, validators, inviteCode util | 5 files |
| 5 | Expense Module | service, controller, routes, validators, money util | 5 files |
| 6 | Balance Service | getGroupBalances, simplifyDebts | 1 file |
| 7 | Settlement Module | service, controller, routes, validators | 4 files |
| 8 | Wire Everything | Update index.js to mount all routes | 1 file |
| 9 | Cleanup | Delete stale files, update .env.example | 3 files |
| 10 | Frontend Scaffold | Vite + React init | ~5 files |
| 11 | Frontend Auth | Login, Register, AuthContext, ProtectedRoute | ~8 files |
| 12 | Frontend Dashboard | Dashboard, GroupCard, Sidebar, Navbar | ~10 files |
| 13 | Frontend Group | GroupDetail, CreateGroup, JoinGroup | ~8 files |
| 14 | Frontend Expenses | AddExpense, ExpenseDetail, ExpenseCard | ~8 files |
| 15 | Frontend Balances & Settlements | Balances, SettleUp, Settlements | ~10 files |
| 16 | Polish | Animations, responsive design, edge cases | All files |
| **Total** | | | **~75 files** |
