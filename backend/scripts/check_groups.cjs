const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({ include: { members: true } });
  console.dir(groups, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
