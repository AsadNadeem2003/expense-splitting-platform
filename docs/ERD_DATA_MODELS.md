# SplitEase — Database ERD & Schema Reference

## 1. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o{ GroupMember : "has memberships"
    User ||--o{ PendingJoinRequest : "requests to join"
    User ||--o{ Expense : "pays for (paidBy)"
    User ||--o{ Expense : "creates (createdBy)"
    User ||--o{ ExpenseParticipant : "participates in"
    User ||--o{ ExpensePayer : "multi-payer share"
    User ||--o{ ExpenseEditHistory : "edits logged by"
    User ||--o{ Settlement : "pays settlement (payer)"
    User ||--o{ Settlement : "receives settlement (payee)"
    User ||--o{ SettlementReminderLog : "reminded (debtor)"
    User ||--o{ SettlementReminderLog : "reminding (creditor)"

    Group ||--o{ GroupMember : "contains"
    Group ||--o{ PendingJoinRequest : "receives requests"
    Group ||--o{ Expense : "tracks"
    Group ||--o{ Settlement : "records"
    Group ||--o{ SettlementReminderLog : "logs reminders"

    Expense ||--o{ ExpenseParticipant : "split among"
    Expense ||--o{ ExpensePayer : "paid by multiple"
    Expense ||--o{ ExpenseEditHistory : "audit logs"

    User {
        int id PK
        string name
        string email UK
        string passwordHash
        string defaultCurrency
        string paymentMethod "Nullable"
        datetime createdAt
    }

    Group {
        int id PK
        string name
        string inviteCode UK
        int createdById
        datetime createdAt
    }

    GroupMember {
        int id PK
        int groupId FK
        int userId FK
        enum role "ADMIN | MEMBER"
        datetime joinedAt
    }

    PendingJoinRequest {
        int id PK
        int groupId FK
        int userId FK
        enum status "PENDING | APPROVED | REJECTED"
        datetime createdAt
    }

    Expense {
        int id PK
        int groupId FK
        string description
        int totalAmount "Stored in Paisa"
        int paidById FK
        int createdById FK
        datetime createdAt
        datetime updatedAt
    }

    ExpensePayer {
        int id PK
        int expenseId FK
        int userId FK
        int amountPaid "Stored in Paisa"
    }

    ExpenseParticipant {
        int id PK
        int expenseId FK
        int userId FK
        int shareAmount "Stored in Paisa"
    }

    ExpenseEditHistory {
        int id PK
        int expenseId FK
        int editedById FK
        string changeType
        json oldValue
        json newValue
        datetime createdAt
    }

    Settlement {
        int id PK
        int groupId FK
        int payerId FK
        int payeeId FK
        int amount "Stored in Paisa"
        string screenshotUrl "Nullable"
        enum status "AWAITING_VERIFICATION | CONFIRMED | REJECTED"
        datetime createdAt
        datetime confirmedAt "Nullable"
    }

    SettlementReminderLog {
        int id PK
        int groupId FK
        int debtorId FK
        int creditorId FK
        int amount "Stored in Paisa"
        datetime sentAt
    }
```

---

## 2. Table Specifications & Constraints

### 2.1. `User`
Stores registered member credentials, profile settings, and payment receiving methods.
- **`id`** (`Int`, PK, Autoincrement): Unique user identifier.
- **`name`** (`String`, max 35 chars): Full display name.
- **`email`** (`String`, Unique): Lowercase verified email.
- **`passwordHash`** (`String`): Bcrypt salted hash (cost factor 10).
- **`defaultCurrency`** (`String`, Default: `"Rs."`): Preferred display symbol.
- **`paymentMethod`** (`String`, Nullable): Verified receiving account string (e.g. `"EasyPaisa: 03001234567 (Hamza Tariq)"`).

---

### 2.2. `Group` & `GroupMember`
Manages group multi-tenancy and Role-Based Access Control (RBAC).
- **Composite Unique Constraint**: `@@unique([groupId, userId])` on `GroupMember` prevents duplicate memberships.
- **Roles**:
  - `ADMIN`: Can invite members, approve/reject join requests, remove zero-balance members, and permanently delete the group.
  - `MEMBER`: Can add expenses, record settlements, and view activity.

---

### 2.3. `Expense`, `ExpensePayer`, & `ExpenseParticipant`
Implements normalized, multi-payer, and unequally-split expense modeling.
- **`totalAmount`**, **`amountPaid`**, **`shareAmount`**: Stored as **Integers in Paisa** ($1 \text{ PKR} = 100 \text{ Paisa}$).
- **Single-Payer**: `Expense.paidById` references primary payer.
- **Multi-Payer**: `ExpensePayer` table stores each contributor's share.
- **Participants**: `ExpenseParticipant` stores each member's exact calculated share in paisa.
- **Composite Unique Constraints**:
  - `ExpensePayer`: `@@unique([expenseId, userId])`
  - `ExpenseParticipant`: `@@unique([expenseId, userId])`

---

### 2.4. `ExpenseEditHistory` (Immutable Audit Trail)
Maintains audit integrity for legal and dispute resolution.
- **`changeType`**: Description of change (`"AMOUNT_CHANGED"`, `"PARTICIPANTS_MODIFIED"`, etc.).
- **`oldValue` / `newValue`** (`Json`): Complete snapshots before and after the edit.

---

### 2.5. `Settlement`
Tracks direct peer-to-peer repayments with proof screenshots.
- **`status`**: Defaults to `AWAITING_VERIFICATION`. Only transitions to `CONFIRMED` upon explicit confirmation by `payeeId`.
- **`screenshotUrl`**: Stored path to the uploaded payment proof (`/uploads/settlements/...`).

---

### 2.6. `SettlementReminderLog`
Tracks 7-day automated and manual debt reminder cooldowns.
- **`sentAt`**: Timestamp of notification. The cron engine queries `sentAt >= NOW() - INTERVAL '7 DAYS'` to prevent debtor spamming.
