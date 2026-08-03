import prisma from '../config/prisma';
import { getGroupBalances, simplifyDebts } from './balance.service';
import { sendSettlementReminderEmail } from './email.service';

export const process7DaySettlementReminders = async () => {
  console.log('⏰ Running 7-day settlement reminder check...');

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all groups
    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    let remindersSentCount = 0;

    for (const group of groups) {
      // Check if this group has any expense created 7+ days ago
      const oldestUnsettledExpense = await prisma.expense.findFirst({
        where: {
          groupId: group.id,
          createdAt: { lte: sevenDaysAgo },
        },
      });

      if (!oldestUnsettledExpense) {
        continue; // No expenses older than 7 days in this group
      }

      // Calculate simplified debts for the group
      const balances = await getGroupBalances(group.id);
      const debts = simplifyDebts(balances);

      for (const debt of debts) {
        // Find debtor and creditor user details
        const debtorMember = group.members.find((m) => m.user.id === debt.from);
        const creditorMember = group.members.find((m) => m.user.id === debt.to);

        if (!debtorMember || !creditorMember) continue;

        // Check if a reminder was already sent in the last 7 days for this specific debt
        const recentReminder = await prisma.settlementReminderLog.findFirst({
          where: {
            groupId: group.id,
            debtorId: debt.from,
            creditorId: debt.to,
            sentAt: { gte: sevenDaysAgo },
          },
        });

        if (recentReminder) {
          // Already reminded recently
          continue;
        }

        // Send Email
        const emailSent = await sendSettlementReminderEmail({
          toEmail: debtorMember.user.email,
          debtorName: debtorMember.user.name,
          creditorName: creditorMember.user.name,
          amountPaisa: debt.amount,
          groupName: group.name,
          groupId: group.id,
        });

        if (emailSent) {
          // Log reminder to DB
          await prisma.settlementReminderLog.create({
            data: {
              groupId: group.id,
              debtorId: debt.from,
              creditorId: debt.to,
              amount: debt.amount,
            },
          });
          remindersSentCount++;
        }
      }
    }

    console.log(`✅ Reminder check completed. Total emails sent: ${remindersSentCount}`);
    return { remindersSentCount };
  } catch (error) {
    console.error('❌ Error processing settlement reminders:', error);
    throw error;
  }
};
