const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settlements = await prisma.settlement.findMany();
  console.dir(settlements, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
