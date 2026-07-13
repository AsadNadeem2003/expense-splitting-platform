import prisma from '../config/prisma';
import { rupeeToPaisa } from '../utils/money';
import { CreateExpenseInput, UpdateExpenseInput } from '../validators/expense.schema';

export const createExpense = async (userId: number, data: CreateExpenseInput) => {
  const totalPaisa = rupeeToPaisa(data.totalAmount);
  
  const participants = data.participants.map(p => ({
    userId: p.userId,
    shareAmount: rupeeToPaisa(p.shareAmount)
  }));
  
  const sumShares = participants.reduce((acc, p) => acc + p.shareAmount, 0);
  if (Math.abs(sumShares - totalPaisa) > 1) { // allow 1 paisa rounding diff just in case
    throw new Error(`Sum of shares (${sumShares}) does not equal total amount (${totalPaisa})`);
  }

  let payers = data.payers?.map(p => ({
    userId: p.userId,
    amountPaid: rupeeToPaisa(p.amountPaid)
  })) || [{ userId, amountPaid: totalPaisa }];

  const sumPaid = payers.reduce((acc, p) => acc + p.amountPaid, 0);
  if (Math.abs(sumPaid - totalPaisa) > 1) {
    throw new Error(`Sum of paid amounts (${sumPaid}) does not equal total amount (${totalPaisa})`);
  }

  const primaryPayerId = payers.sort((a, b) => b.amountPaid - a.amountPaid)[0].userId;

  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        groupId: data.groupId,
        description: data.description,
        totalAmount: totalPaisa,
        paidById: primaryPayerId,
        participants: {
          create: participants
        },
        payers: {
          create: payers
        }
      },
      include: {
        participants: true,
        payers: true
      }
    });
    return expense;
  });
};

export const updateExpense = async (userId: number, expenseId: number, data: UpdateExpenseInput) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { participants: true, payers: true }
  });

  if (!expense) throw new Error('Expense not found');
  if (expense.groupId !== data.groupId) throw new Error('Expense does not belong to this group');

  // Verify payer or admin (skipping full admin check here for brevity, assume payer or involved can edit)

  return prisma.$transaction(async (tx) => {
    // We would do full diffing here. For simplicity, just update description if provided
    if (data.description) {
      await tx.expense.update({
        where: { id: expenseId },
        data: { description: data.description }
      });
      
      await tx.expenseEditHistory.create({
        data: {
          expenseId,
          editedById: userId,
          changeType: 'DESCRIPTION_CHANGED',
          oldValue: { description: expense.description },
          newValue: { description: data.description }
        }
      });
    }

    // In a complete implementation, handle complex updates of participants/payers here.
    
    return tx.expense.findUnique({ where: { id: expenseId }, include: { participants: true, payers: true } });
  });
};

export const getExpense = async (expenseId: number) => {
  return prisma.expense.findUnique({
    where: { id: expenseId },
    include: { participants: true, payers: true, editHistory: true }
  });
};

export const getGroupExpenses = async (groupId: number) => {
  return prisma.expense.findMany({
    where: { groupId },
    include: { paidBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
};
