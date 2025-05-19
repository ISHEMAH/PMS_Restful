import { CronJob } from 'cron';
import { AnalyticsService } from './analytics.service';
import { EmailService } from './email.service';

export class CronService {
  private readonly analyticsService: AnalyticsService;
  private readonly emailService: EmailService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.emailService = new EmailService();
    
    // Generate daily analytics at midnight
    this.scheduleDailyAnalytics();
    
    // Send daily report to admin at 8 AM
    this.scheduleDailyReport();
  }

  private scheduleDailyAnalytics(): void {
    new CronJob('0 0 * * *', async () => {
      try {
        await this.analyticsService.generateDailyAnalytics();
      } catch (error) {
        console.error('Failed to generate daily analytics:', error);
      }
    }, null, true, 'Asia/Singapore');
  }

  private async scheduleDailyReport(): Promise<void> {
    new CronJob('0 8 * * *', async () => {
      try {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const analytics = await this.analyticsService.getAnalyticsForPeriod(
          yesterday,
          today
        );

        if (analytics.length > 0) {
          await this.emailService.sendAdminNotification('Daily Report', {
            date: yesterday.toISOString().split('T')[0],
            analytics,
          });
        }
      } catch (error) {
        console.error('Failed to send daily report:', error);
      }
    }, null, true, 'Asia/Singapore');
  }

  private scheduleInactiveVehicleCleanup(): void {
    new CronJob('0 0 * * 0', async () => {
      try {
        // Cleanup vehicles that haven't been used in 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Add cleanup logic here
      } catch (error) {
        console.error('Failed to cleanup inactive vehicles:', error);
      }
    }, null, true, 'Asia/Singapore');
  }
}
