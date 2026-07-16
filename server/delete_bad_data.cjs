const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.expensePayer.deleteMany({ where: { expenseId: 1 } });
  await prisma.expenseParticipant.deleteMany({ where: { expenseId: 1 } });
  await prisma.expenseEditHistory.deleteMany({ where: { expenseId: 1 } });
  await prisma.expense.deleteMany({ where: { id: 1 } });
  console.log('Deleted Expense 1');
}
run().finally(() => prisma.$disconnect());
