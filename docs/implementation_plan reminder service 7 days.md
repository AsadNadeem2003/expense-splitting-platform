# Automated 7-Day Settlement Reminders (Email)

## Context & Objective
To improve accountability and encourage prompt payments, this feature will automatically check for unsettled group debts older than 7 days and send email notifications to members who owe money.

Example Email Content:
> **Subject**: Payment Reminder: You owe Ali Rs. 500 in Weekend Trip
> **Body**: 
> Hi Usman,
> You owe Ali Rs. 500 for expenses in **Weekend Trip**.
> Please pay or record your settlement here: http://localhost:5173/groups/1

---

## User Review Required

> [!IMPORTANT]
> - **Email Provider Configuration**: We will configure `Nodemailer` with standard SMTP settings in `backend/.env` (e.g., Ethereal for dev/testing, or Gmail/Resend/SendGrid credentials for production).
> - **No SMS**: As requested, SMS integration is excluded.
> - **Cron Schedule**: The background task will run daily at 9:00 AM (`0 9 * * *`).

---

## Proposed Changes

### Backend

#### [NEW] [schema.prisma](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/prisma/schema.prisma)
- Add `SettlementReminderLog` model to track when a reminder was last sent to prevent spamming:
  ```prisma
  model SettlementReminderLog {
    id         Int      @id @default(autoincrement())
    groupId    Int
    debtorId   Int
    creditorId Int
    amount     Int
    sentAt     DateTime @default(now())

    group    Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
    debtor   User  @relation("ReminderDebtor", fields: [debtorId], references: [id], onDelete: Cascade)
    creditor User  @relation("ReminderCreditor", fields: [creditorId], references: [id], onDelete: Cascade)
  }
  ```

#### [NEW] [package.json](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/package.json)
- Add `node-cron`, `@types/node-cron`, `nodemailer`, and `@types/nodemailer` dependencies.

#### [NEW] [email.service.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/src/services/email.service.ts)
- Create `sendSettlementReminderEmail(toEmail, debtorName, creditorName, amount, groupName, groupId)` helper using Nodemailer.

#### [NEW] [reminder.service.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/src/services/reminder.service.ts)
- Create `process7DaySettlementReminders()` function:
  1. Iterate over all active groups.
  2. Find expenses older than 7 days that haven't been fully settled.
  3. Calculate simplified debts for those groups.
  4. Filter debts where no reminder log exists in the past 7 days for the `(groupId, debtorId, creditorId)` tuple.
  5. Fetch email addresses for `debtor` and `creditor`.
  6. Trigger `sendSettlementReminderEmail()`.
  7. Save log record into `SettlementReminderLog`.

#### [NEW] [cron.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/src/config/cron.ts)
- Initialize `node-cron` job (`0 9 * * *`) calling `process7DaySettlementReminders()`.

#### [MODIFY] [index.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/expense-splitting-platform/backend/src/index.ts)
- Import and start cron service on backend server boot.

---

## Verification Plan

### Automated / Manual Backend Verification
1. Run `npx prisma db push` to apply the new table.
2. Trigger the reminder service manually via a test endpoint or short interval script to verify:
   - Old debts (>= 7 days) correctly generate emails.
   - Recent debts (< 7 days) are skipped.
   - Duplicate emails are suppressed if a reminder log exists within 7 days.
