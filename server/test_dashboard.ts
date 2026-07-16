import { getDashboardStats } from './src/services/user.service';

async function test() {
  try {
    const stats = await getDashboardStats(2);
    console.dir(stats, { depth: null });
  } catch (e) {
    console.error("ERROR", e);
  }
}
test().finally(() => process.exit(0));
