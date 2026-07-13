import prisma from '../config/prisma';
import { rupeeToPaisa } from '../utils/money';
import { CreateSettlementInput } from '../validators/settlement.schema';

export const createSettlement = async (payerId: number, data: CreateSettlementInput, filePath?: string) => {
  const amountPaisa = rupeeToPaisa(data.amount);

  return prisma.settlement.create({
    data: {
      groupId: data.groupId,
      payerId,
      payeeId: data.payeeId,
      amount: amountPaisa,
      screenshotUrl: filePath,
      status: 'AWAITING_VERIFICATION'
    }
  });
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
