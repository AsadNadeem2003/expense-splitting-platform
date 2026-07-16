const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const expenses = await prisma.expense.findMany({
    include: { payers: true, participants: true }
  });
  console.dir(expenses, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
