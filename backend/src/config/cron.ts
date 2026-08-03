import cron from 'node-cron';
import { process7DaySettlementReminders } from '../services/reminder.service';

export const initCronJobs = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Scheduled Task Triggered: 7-Day Settlement Reminders');
    await process7DaySettlementReminders();
  });

  console.log('🗓️ Cron jobs initialized (7-day reminder scheduled for 9:00 AM daily)');
};
