import prisma from '../config/prisma';
import { getGroupBalances } from './balance.service';

export const getDashboardStats = async (userId: number) => {
  // 1. Get all groups user is a part of
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: { group: true }
  });

  let totalOwed = 0;
  let totalOwes = 0;

  // 2. Calculate balance for each group
  for (const m of memberships) {
    const balances = await getGroupBalances(m.groupId);
    const userBal = balances[userId] || 0;
    if (userBal > 0) totalOwed += userBal;
    if (userBal < 0) totalOwes += Math.abs(userBal);
  }

  const totalBalance = totalOwed - totalOwes;

  // 3. Get recent activity
  const expenses = await prisma.expense.findMany({
    where: {
      OR: [
        { payers: { some: { userId } } },
        { participants: { some: { userId } } }
      ]
    },
    include: { group: true, paidBy: true, payers: true, participants: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const settlements = await prisma.settlement.findMany({
    where: {
      OR: [
        { payerId: userId },
        { payeeId: userId }
      ]
    },
    include: { group: true, payer: true, payee: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // 4. Format and merge activities
  const activities = [];
  
  for (const exp of expenses) {
    const isPayer = exp.paidById === userId;
    
    // Calculate exact user share vs paid for exact color coding
    const userPaidObj = exp.payers.find(p => p.userId === userId);
    const userShareObj = exp.participants.find(p => p.userId === userId);
    
    const userPaid = userPaidObj ? userPaidObj.amountPaid : 0;
    const userShare = userShareObj ? userShareObj.shareAmount : 0;
    const netImpact = userPaid - userShare; // positive means they are owed, negative means they owe

    activities.push({
      id: `exp-${exp.id}`,
      type: 'EXPENSE',
      amount: exp.totalAmount, // Total expense amount
      netImpact: netImpact, // How it affected this specific user
      description: exp.description,
      groupName: exp.group.name,
      createdAt: exp.createdAt,
      actionText: isPayer ? 'You paid' : `${exp.paidBy.name} paid`
    });
  }

  for (const st of settlements) {
    const isPayer = st.payerId === userId;
    
    activities.push({
      id: `st-${st.id}`,
      type: 'SETTLEMENT',
      amount: st.amount,
      netImpact: isPayer ? st.amount : -st.amount, // if you pay, your net balance goes up. If you receive, it goes down.
      description: isPayer ? `You paid ${st.payee.name}` : `${st.payer.name} paid you`,
      groupName: st.group.name,
      createdAt: st.createdAt,
      actionText: isPayer ? 'You settled' : 'Settlement received'
    });
  }

  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentActivity = activities.slice(0, 10);

  return {
    totalOwes,
    totalOwed,
    totalBalance,
    recentActivity
  };
};

export const searchUsers = async (query: string) => {
  const whereClause = query ? {
    OR: [
      { name: { contains: query, mode: 'insensitive' as any } },
      { email: { contains: query, mode: 'insensitive' as any } }
    ]
  } : {};

  return prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true
    },
    take: 50
  });
};

export const getActivityFeed = async (userId: number, limit: number = 50) => {
  // 1. Get recent activity
  const expenses = await prisma.expense.findMany({
    where: {
      OR: [
        { payers: { some: { userId } } },
        { participants: { some: { userId } } }
      ]
    },
    include: { group: true, paidBy: true, payers: true, participants: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  const settlements = await prisma.settlement.findMany({
    where: {
      OR: [
        { payerId: userId },
        { payeeId: userId }
      ]
    },
    include: { group: true, payer: true, payee: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  // 2. Format and merge activities
  const activities = [];
  
  for (const exp of expenses) {
    const isPayer = exp.paidById === userId;
    
    const userPaidObj = exp.payers.find(p => p.userId === userId);
    const userShareObj = exp.participants.find(p => p.userId === userId);
    
    const userPaid = userPaidObj ? userPaidObj.amountPaid : 0;
    const userShare = userShareObj ? userShareObj.shareAmount : 0;
    const netImpact = userPaid - userShare;

      let actionText = '';
      if (userPaid > 0) {
        if (userPaid === exp.totalAmount) {
          actionText = `You paid the full bill`;
        } else {
          actionText = `You paid Rs. ${(userPaid / 100).toFixed(2)}`;
        }
      } else {
        if (exp.payers && exp.payers.length === 1) {
          actionText = `${exp.paidBy.name} paid, you owe your share`;
        } else {
          actionText = `Multiple people paid, you owe your share`;
        }
      }

      activities.push({
        id: `exp-${exp.id}`,
        type: 'EXPENSE',
        amount: exp.totalAmount,
        netImpact: netImpact,
        description: exp.description,
        groupName: exp.group.name,
        groupId: exp.groupId,
        createdAt: exp.createdAt,
        actionText: actionText
      });
  }

  for (const st of settlements) {
    const isPayer = st.payerId === userId;
    
    activities.push({
      id: `st-${st.id}`,
      type: 'SETTLEMENT',
      amount: st.amount,
      netImpact: isPayer ? st.amount : -st.amount,
      description: isPayer ? `You paid ${st.payee.name}` : `${st.payer.name} paid you`,
      groupName: st.group.name,
      groupId: st.groupId,
      createdAt: st.createdAt,
      actionText: isPayer 
        ? `You settled up with ${st.payee.name}` 
        : `${st.payer.name} settled up with you`
    });
  }

  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return activities.slice(0, limit);
};

export const updateProfile = async (userId: number, data: { name?: string; defaultCurrency?: string; paymentMethod?: string }) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      defaultCurrency: true,
      paymentMethod: true
    }
  });
};
