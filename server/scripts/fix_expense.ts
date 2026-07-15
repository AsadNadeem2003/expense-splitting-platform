import prisma from '../src/config/prisma';
import { updateExpense } from '../src/services/expense.service';

async function fixExpense() {
  const groupId = 4;
  
  // Find the LUNCH expense
  const expense = await prisma.expense.findFirst({
    where: { 
      groupId,
      description: 'LUNCH',
      totalAmount: 1600000 // 16000 Rs in paisa
    },
    include: {
        payers: true
    }
  });

  if (!expense) {
    console.error("Expense not found!");
    return;
  }

  // Get all members of group 4
  const members = await prisma.groupMember.findMany({
    where: { groupId }
  });

  console.log(`Found ${members.length} members in group 4.`);

  const numMembers = members.length;
  const totalAmount = 16000;
  
  // Calculate split amount in Rs
  const splitAmount = Number((totalAmount / numMembers).toFixed(2));
  
  const participants = members.map((m, index) => {
    let finalSplit = splitAmount;
    // Adjust the last person to ensure sum is exactly 16000
    if (index === numMembers - 1) {
        finalSplit = Number((totalAmount - (splitAmount * (numMembers - 1))).toFixed(2));
    }
    return {
        userId: m.userId,
        shareAmount: finalSplit
    };
  });
  
  console.log("New participants:", participants);

  // We need an admin or the person who created it to do the update. We can just use the first member's ID.
  const userId = members[0].userId;

  try {
      await updateExpense(userId, expense.id, {
          groupId: expense.groupId,
          participants: participants
      });
      console.log("Expense updated successfully!");
  } catch (error) {
      console.error("Failed to update expense:", error);
  }
}

fixExpense()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
