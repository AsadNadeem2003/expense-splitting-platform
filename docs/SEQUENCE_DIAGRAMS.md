# SplitEase — Core Workflow Sequence Diagrams

## 1. Authentication & Bearer Interceptor Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Client as Axios Client (Frontend)
    participant AuthMW as Auth Middleware (Backend)
    participant AuthCtrl as Auth Controller & Service
    participant DB as PostgreSQL Database

    User->>Client: Submit Login (Email & Password)
    Client->>AuthCtrl: POST /api/auth/login
    AuthCtrl->>DB: findUnique({ where: { email } })
    DB-->>AuthCtrl: User Record (passwordHash)
    AuthCtrl->>AuthCtrl: bcrypt.compare(password, passwordHash)
    AuthCtrl->>AuthCtrl: generateToken(user.id)
    AuthCtrl-->>Client: 200 OK { token, user }
    Client->>Client: Save token to localStorage

    Note over Client,AuthMW: Subsequent Protected API Requests
    User->>Client: Navigate to /groups
    Client->>Client: Request Interceptor: headers.Authorization = `Bearer ${token}`
    Client->>AuthMW: GET /api/groups/my
    AuthMW->>AuthMW: jwt.verify(token, JWT_SECRET)
    alt Token Valid
        AuthMW->>DB: Fetch user groups
        DB-->>Client: 200 OK [Group Data]
    else Token Expired or Invalid (401)
        AuthMW-->>Client: 401 Unauthorized
        Client->>Client: Response Interceptor: clear localStorage & redirect to /login
    end
```

---

## 2. Multi-Payer Expense Creation & Relational Transaction

```mermaid
sequenceDiagram
    autonumber
    actor User as Member (Payer)
    participant Modal as AddExpenseModal
    participant ValMW as Zod Validation Middleware
    participant ExpService as Expense Service
    participant DB as PostgreSQL Database

    User->>Modal: Fill Description, Amount, Multi-Payers, & Participants
    Modal->>Modal: Client Validation (sum of payers == total amount)
    Modal->>ValMW: POST /api/expenses (JSON Payload in Rupees)
    ValMW->>ValMW: createExpenseSchema.parse(req.body)
    
    alt Schema Validation Failed (400)
        ValMW-->>Modal: 400 Bad Request { status: "fail", message: "..." }
        Modal->>User: Display Toast Error
    else Schema Validation Passed
        ValMW->>ExpService: createExpense(userId, payload)
        ExpService->>ExpService: Convert Rupee inputs to Integer Paisa
        
        rect rgb(240, 248, 255)
            Note over ExpService,DB: Atomic Database Transaction (prisma.$transaction)
            ExpService->>DB: tx.expense.create({ ... })
            ExpService->>DB: tx.expensePayer.createMany([ ... ])
            ExpService->>DB: tx.expenseParticipant.createMany([ ... ])
            ExpService->>DB: tx.expenseEditHistory.create({ changeType: "EXPENSE_CREATED" })
        end

        DB-->>ExpService: Transaction Committed
        ExpService-->>Modal: 201 Created { status: "success", data: expense }
        Modal->>User: Toast "Expense added!" & Refresh Balances
    end
```

---

## 3. Structured Settlement & Payee Confirmation Cycle

```mermaid
sequenceDiagram
    autonumber
    actor Debtor as Debtor (Payer)
    participant Client as Frontend
    participant StService as Settlement Service
    participant DB as PostgreSQL Database
    actor Creditor as Creditor (Payee)

    Debtor->>Client: Open SettleUpModal -> Select Payee
    Client->>Client: Auto-display Payee's verified Account Info
    Debtor->>Client: Upload Payment Screenshot Proof & Submit
    Client->>StService: POST /api/settlements (FormData: groupId, payeeId, amount, file)
    
    StService->>DB: Check for existing AWAITING_VERIFICATION settlement between (payer, payee, group)
    alt Duplicate Pending Settlement Exists
        StService-->>Client: 400 Bad Request ("A settlement is already awaiting verification...")
        Client->>Debtor: Alert user to prevent accidental double payment
    else No Duplicate
        StService->>DB: prisma.settlement.create({ status: "AWAITING_VERIFICATION" })
        DB-->>Client: 201 Created
        Client->>Debtor: Toast "Settlement submitted for verification"
    end

    Note over Creditor,Client: Payee Verification Step
    Creditor->>Client: Open Notifications Popover or Group Balances
    Client->>Creditor: Render "Awaiting Verification" Card with Screenshot Preview
    Creditor->>Client: Click "Confirm Payment"
    Client->>StService: POST /api/settlements/:settlementId/confirm
    StService->>DB: prisma.settlement.update({ status: "CONFIRMED", confirmedAt: NOW() })
    DB-->>Client: 200 OK
    Client->>Creditor: Toast "Payment confirmed! Group balances updated."
```

---

## 4. Automated 7-Day Background Debt Reminder Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Node-Cron Worker (09:00 AM Daily)
    participant RemService as Reminder Service
    participant BalService as Balance Service
    participant DB as PostgreSQL Database
    participant Email as Nodemailer / Resend Engine
    actor Debtor as Debtor Member

    Cron->>RemService: triggerAutomatedReminders()
    RemService->>DB: Find all active groups
    
    loop For Each Group
        RemService->>BalService: getGroupBalances(groupId)
        BalService-->>RemService: Simplified Debts [ { from: Debtor, to: Creditor, amount } ]
        
        loop For Each Unsettled Debt
            RemService->>DB: Find oldest unsettled expense > 7 days ago
            alt Unsettled Expense Found
                RemService->>DB: Check SettlementReminderLog for reminder in last 7 days
                alt Cooldown Active (< 7 days since last reminder)
                    Note over RemService: Skip to prevent spamming
                else Cooldown Expired (>= 7 days or never reminded)
                    RemService->>Email: sendReminderEmail(debtor.email, creditor.name, amount, group.name)
                    Email-->>Debtor: Dispatch HTML Email Nudge
                    RemService->>DB: prisma.settlementReminderLog.create({ groupId, debtorId, creditorId, amount })
                end
            end
        end
    end
```
