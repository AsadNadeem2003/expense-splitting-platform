import prisma from '../config/prisma';
import { rupeeToPaisa } from '../utils/money';
import { CreateSettlementInput } from '../validators/settlement.schema';

export const createSettlement = async (payerId: number, data: CreateSettlementInput, filePath?: string) => {
  const amountPaisa = rupeeToPaisa(data.amount);

  // Prevent duplicate: block if there is already an AWAITING_VERIFICATION settlement
  // for the same payer → payee pair in the same group
  const existingPending = await prisma.settlement.findFirst({
    where: {
      groupId: data.groupId,
      payerId,
      payeeId: data.payeeId,
      status: 'AWAITING_VERIFICATION',
    },
  });

  if (existingPending) {
    throw new Error(
      `You already have a pending settlement of Rs. ${(existingPending.amount / 100).toFixed(2)} awaiting verification from this person. Please wait for them to confirm or reject it before submitting another payment.`
    );
  }

  const newSettlement = await prisma.settlement.create({
    data: {
      groupId: data.groupId,
      payerId,
      payeeId: data.payeeId,
      amount: amountPaisa,
      screenshotUrl: filePath,
      status: 'AWAITING_VERIFICATION',
    }
  });

  // Clear obsolete reminder logs since debtor has taken action and submitted payment
  await prisma.settlementReminderLog.deleteMany({
    where: {
      groupId: data.groupId,
      debtorId: payerId,
      creditorId: data.payeeId,
    }
  }).catch(() => {});

  return newSettlement;
};

export const confirmSettlement = async (userId: number, settlementId: number) => {
  const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
  if (!settlement) throw new Error('Settlement not found');
  if (settlement.payeeId !== userId) throw new Error('Only the payee can confirm a settlement');
  if (settlement.status !== 'AWAITING_VERIFICATION') throw new Error('Settlement is not awaiting verification');

  return prisma.settlement.update({
    where: { id: settlementId },
    data: { 
      status: 'CONFIRMED',
      confirmedAt: new Date()
    }
  });
};

export const rejectSettlement = async (userId: number, settlementId: number) => {
  const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
  if (!settlement) throw new Error('Settlement not found');
  if (settlement.payeeId !== userId) throw new Error('Only the payee can reject a settlement');
  if (settlement.status !== 'AWAITING_VERIFICATION') throw new Error('Settlement is not awaiting verification');

  return prisma.settlement.update({
    where: { id: settlementId },
    data: { status: 'REJECTED' }
  });
};

export const getGroupSettlements = async (groupId: number) => {
  return prisma.settlement.findMany({
    where: { groupId },
    include: {
      payer: { select: { id: true, name: true } },
      payee: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const sendSingleReminder = async (creditorId: number, groupId: number, debtorId: number) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });

  if (!group) throw new Error('Group not found');

  const debtorMember = group.members.find(m => m.user.id === debtorId);
  const creditorMember = group.members.find(m => m.user.id === creditorId);

  if (!debtorMember || !creditorMember) {
    throw new Error('Debtor or Creditor is not a member of this group');
  }

  const { getGroupBalances, simplifyDebts } = await import('./balance.service');
  const balances = await getGroupBalances(groupId);
  const debts = simplifyDebts(balances);

  const debt = debts.find(d => d.from === debtorId && d.to === creditorId);
  if (!debt || debt.amount <= 0) {
    throw new Error('No outstanding debt found between these members');
  }

  const { sendSettlementReminderEmail } = await import('./email.service');
  const emailSent = await sendSettlementReminderEmail({
    toEmail: debtorMember.user.email,
    debtorName: debtorMember.user.name,
    creditorName: creditorMember.user.name,
    amountPaisa: debt.amount,
    groupName: group.name,
    groupId: group.id,
  });

  if (emailSent) {
    await prisma.settlementReminderLog.create({
      data: {
        groupId,
        debtorId,
        creditorId,
        amount: debt.amount,
      }
    });
  }

  return { message: `Reminder sent to ${debtorMember.user.name}` };
};
