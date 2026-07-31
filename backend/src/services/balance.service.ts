import prisma from '../config/prisma';

export interface BalanceMap {
  [userId: number]: number; // net balance in paisa (positive = owed, negative = owes)
}

export interface SimplifiedDebt {
  from: number;
  to: number;
  amount: number; // positive paisa
}

export const getGroupBalances = async (groupId: number): Promise<BalanceMap> => {
  // 1. Get all expenses with payers and participants
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      payers: true,
      participants: true
    }
  });

  // 2. Get all confirmed settlements
  const settlements = await prisma.settlement.findMany({
    where: { groupId, status: 'CONFIRMED' }
  });

  const balances: BalanceMap = {};

  // Initialize members in balances (useful to ensure everyone is represented even with 0 balance)
  const members = await prisma.groupMember.findMany({
    where: { groupId }
  });
  members.forEach(m => {
    balances[m.userId] = 0;
  });

  // Process Expenses
  for (const exp of expenses) {
    for (const payer of exp.payers) {
      if (balances[payer.userId] === undefined) balances[payer.userId] = 0;
      balances[payer.userId] += payer.amountPaid; // paying increases net balance (owed by others)
    }
    for (const part of exp.participants) {
      if (balances[part.userId] === undefined) balances[part.userId] = 0;
      balances[part.userId] -= part.shareAmount; // consuming reduces net balance (owes others)
    }
  }

  // Process Settlements
  for (const st of settlements) {
    if (balances[st.payerId] === undefined) balances[st.payerId] = 0;
    if (balances[st.payeeId] === undefined) balances[st.payeeId] = 0;
    
    // A settlement is the payer paying back the payee
    balances[st.payerId] += st.amount; // payer paid, so their balance goes up
    balances[st.payeeId] -= st.amount; // payee received, so their balance goes down
  }

  return balances;
};

export const simplifyDebts = (balances: BalanceMap): SimplifiedDebt[] => {
  const debtors: { userId: number, balance: number }[] = [];
  const creditors: { userId: number, balance: number }[] = [];

  for (const [userIdStr, balance] of Object.entries(balances)) {
    const userId = parseInt(userIdStr, 10);
    if (balance < 0) debtors.push({ userId, balance });
    else if (balance > 0) creditors.push({ userId, balance });
  }

  // Sort ascending by magnitude to do greedy matching
  debtors.sort((a, b) => a.balance - b.balance); // most negative first
  creditors.sort((a, b) => b.balance - a.balance); // most positive first

  const transactions: SimplifiedDebt[] = [];
  
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amount > 0) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    // Use a small epsilon to handle floating point/rounding issues, though we use integers, so exactly 0 is expected
    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return transactions;
};

export const getUserBalance = async (groupId: number, userId: number): Promise<number> => {
  const balances = await getGroupBalances(groupId);
  return balances[userId] || 0;
};
