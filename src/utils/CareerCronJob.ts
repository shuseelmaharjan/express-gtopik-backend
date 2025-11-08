import cron from 'node-cron';
import CareerService from '../service/CareerService';
import { DateTimeHelper } from './DateTimeHelper';

export class CareerCronJob {
    /**
     * Initialize and start the career status update cronjob
     * Runs every hour to check and update career statuses based on dates
     */
    static startCareerStatusUpdateJob() {
        // Run every hour (0 minutes of every hour)
        cron.schedule('0 * * * *', async () => {
            try {
                const timestamp = DateTimeHelper.getDateTime();
                console.log(`[${timestamp}] Running career status update cronjob...`);
                
                await CareerService.updateCareerStatuses();
                
                const endTimestamp = DateTimeHelper.getDateTime();
                console.log(`[${endTimestamp}] Career status update cronjob completed successfully`);
            } catch (error) {
                const errorTimestamp = DateTimeHelper.getDateTime();
                console.error(`[${errorTimestamp}] Error in career status update cronjob:`, error);
            }
        }, {
            timezone: process.env.TIMEZONE
        });

        console.log('Career status update cronjob started - runs every hour');
    }

    /**
     * Initialize and start a daily career status update cronjob (alternative)
     * Runs every day at midnight to check and update career statuses
     */
    static startDailyCareerStatusUpdateJob() {
        // Run every day at midnight (00:00)
        cron.schedule('0 0 * * *', async () => {
            try {
                const timestamp = DateTimeHelper.getDateTime();
                console.log(`[${timestamp}] Running daily career status update cronjob...`);
                
                await CareerService.updateCareerStatuses();
                
                const endTimestamp = DateTimeHelper.getDateTime();
                console.log(`[${endTimestamp}] Daily career status update cronjob completed successfully`);
            } catch (error) {
                const errorTimestamp = DateTimeHelper.getDateTime();
                console.error(`[${errorTimestamp}] Error in daily career status update cronjob:`, error);
            }
        }, {
            timezone: process.env.TIMEZONE
        });

        console.log('Daily career status update cronjob started - runs every day at midnight');
    }

    /**
     * Initialize and start a frequent career status update cronjob for testing
     * Runs every 5 minutes - useful for development/testing
     */
    static startFrequentCareerStatusUpdateJob() {
        // Run every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            try {
                const timestamp = DateTimeHelper.getDateTime();
                console.log(`[${timestamp}] Running frequent career status update cronjob...`);
                
                await CareerService.updateCareerStatuses();
                
                const endTimestamp = DateTimeHelper.getDateTime();
                console.log(`[${endTimestamp}] Frequent career status update cronjob completed successfully`);
            } catch (error) {
                const errorTimestamp = DateTimeHelper.getDateTime();
                console.error(`[${errorTimestamp}] Error in frequent career status update cronjob:`, error);
            }
        }, {
            timezone: process.env.TIMEZONE
        });

        console.log('Frequent career status update cronjob started - runs every 5 minutes');
    }

    /**
     * Start the appropriate cronjob based on environment
     */
    static initializeCareerCronJobs() {
        const environment = process.env.NODE_ENV || 'development';
        
        if (environment === 'development') {
            // In development, run every 5 minutes for testing
            this.startFrequentCareerStatusUpdateJob();
        } else {
            // In production, run every hour
            this.startCareerStatusUpdateJob();
            // Also run daily as a backup
            this.startDailyCareerStatusUpdateJob();
        }
    }
}