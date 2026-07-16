const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.expensePayer.deleteMany({ where: { OR: [{ expenseId: 2 }, { expenseId: 3 }] } });
  await prisma.expenseParticipant.deleteMany({ where: { OR: [{ expenseId: 2 }, { expenseId: 3 }] } });
  await prisma.expenseEditHistory.deleteMany({ where: { OR: [{ expenseId: 2 }, { expenseId: 3 }] } });
  await prisma.expense.deleteMany({ where: { OR: [{ id: 2 }, { id: 3 }] } });
  
  await prisma.settlement.deleteMany({
    where: { id: 3 }
  });
  console.log('Deleted bad data for Asad and Nouman');
}
run().finally(() => prisma.$disconnect());
