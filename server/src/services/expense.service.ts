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

  // Compute new total, participants, payers
  const totalPaisa = rupeeToPaisa(data.totalAmount || (expense.totalAmount / 100));
  
  let newParticipants = expense.participants;
  if (data.participants) {
    newParticipants = data.participants.map(p => ({
      ...p,
      shareAmount: rupeeToPaisa(p.shareAmount),
      id: 0, expenseId: 0
    }));
    const sumShares = newParticipants.reduce((acc, p) => acc + p.shareAmount, 0);
    if (Math.abs(sumShares - totalPaisa) > 1) {
      throw new Error(`Sum of shares (${sumShares}) does not equal total amount (${totalPaisa})`);
    }
  }

  let newPayers = expense.payers;
  let primaryPayerId = expense.paidById;
  if (data.payers) {
    newPayers = data.payers.map(p => ({
      ...p,
      amountPaid: rupeeToPaisa(p.amountPaid),
      id: 0, expenseId: 0
    }));
    const sumPaid = newPayers.reduce((acc, p) => acc + p.amountPaid, 0);
    if (Math.abs(sumPaid - totalPaisa) > 1) {
      throw new Error(`Sum of paid amounts (${sumPaid}) does not equal total amount (${totalPaisa})`);
    }
    primaryPayerId = newPayers.sort((a, b) => b.amountPaid - a.amountPaid)[0].userId;
  }

  let isChanged = false;
  if (data.description && data.description !== expense.description) isChanged = true;
  if (totalPaisa !== expense.totalAmount) isChanged = true;

  if (data.participants) {
    if (newParticipants.length !== expense.participants.length) isChanged = true;
    else {
      const oldP = [...expense.participants].sort((a, b) => a.userId - b.userId);
      const newP = [...newParticipants].sort((a, b) => a.userId - b.userId);
      for (let i = 0; i < oldP.length; i++) {
        if (oldP[i].userId !== newP[i].userId || oldP[i].shareAmount !== newP[i].shareAmount) {
          isChanged = true; break;
        }
      }
    }
  }

  if (data.payers) {
    if (newPayers.length !== expense.payers.length) isChanged = true;
    else {
      const oldP = [...expense.payers].sort((a, b) => a.userId - b.userId);
      const newP = [...newPayers].sort((a, b) => a.userId - b.userId);
      for (let i = 0; i < oldP.length; i++) {
        if (oldP[i].userId !== newP[i].userId || oldP[i].amountPaid !== newP[i].amountPaid) {
          isChanged = true; break;
        }
      }
    }
  }

  if (!isChanged) {
    return expense;
  }

  return prisma.$transaction(async (tx) => {
    // Log the edit
    const changeType = (data.participants || data.payers) ? 'FULL_EDIT' : 'DESCRIPTION_CHANGED';
    
    await tx.expenseEditHistory.create({
      data: {
        expenseId,
        editedById: userId,
        changeType,
        oldValue: { 
          description: expense.description, 
          totalAmount: expense.totalAmount,
          participants: expense.participants,
          payers: expense.payers
        },
        newValue: { 
          description: data.description || expense.description,
          totalAmount: totalPaisa,
          participants: data.participants ? newParticipants : expense.participants,
          payers: data.payers ? newPayers : expense.payers
        }
      }
    });

    // Delete old relationships if they are changing
    if (data.participants) {
      await tx.expenseParticipant.deleteMany({ where: { expenseId } });
      await tx.expenseParticipant.createMany({
        data: newParticipants.map(p => ({ expenseId, userId: p.userId, shareAmount: p.shareAmount }))
      });
    }

    if (data.payers) {
      await tx.expensePayer.deleteMany({ where: { expenseId } });
      await tx.expensePayer.createMany({
        data: newPayers.map(p => ({ expenseId, userId: p.userId, amountPaid: p.amountPaid }))
      });
    }

    // Update expense itself
    await tx.expense.update({
      where: { id: expenseId },
      data: { 
        description: data.description || expense.description,
        totalAmount: totalPaisa,
        paidById: primaryPayerId
      }
    });

    return tx.expense.findUnique({
      where: { id: expenseId },
      include: { participants: true, payers: true }
    });
  });
};

export const getExpense = async (expenseId: number) => {
  return prisma.expense.findUnique({
    where: { id: expenseId },
    include: { 
      participants: { include: { user: { select: { id: true, name: true } } } }, 
      payers: { include: { user: { select: { id: true, name: true } } } }, 
      editHistory: { 
        include: { editedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      } 
    }
  });
};

export const getGroupExpenses = async (groupId: number) => {
  return prisma.expense.findMany({
    where: { groupId },
    include: { paidBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
};
