// Notification Service for SMS/Email Reminders

export interface ReminderNotification {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  reservationDate: string;
  reservationTime: string;
  tableName: string;
  guests: number;
}

export interface NotificationPreferences {
  emailReminders: boolean;
  smsReminders: boolean;
  reminder24Hours: boolean;
  reminder2Hours: boolean;
}

class NotificationService {
  // Send 24-hour reminder
  async send24HourReminder(notification: ReminderNotification): Promise<boolean> {
    try {
      console.log('📧 Sending 24-hour reminder...');

      // Email reminder
      await this.sendEmailReminder(notification, '24 hours');

      // SMS reminder (if phone number provided)
      if (notification.customerPhone) {
        await this.sendSMSReminder(notification, '24 hours');
      }

      return true;
    } catch (error) {
      console.error('Failed to send 24-hour reminder:', error);
      return false;
    }
  }

  // Send 2-hour reminder
  async send2HourReminder(notification: ReminderNotification): Promise<boolean> {
    try {
      console.log('📧 Sending 2-hour reminder...');

      // Email reminder
      await this.sendEmailReminder(notification, '2 hours');

      // SMS reminder (if phone number provided)
      if (notification.customerPhone) {
        await this.sendSMSReminder(notification, '2 hours');
      }

      return true;
    } catch (error) {
      console.error('Failed to send 2-hour reminder:', error);
      return false;
    }
  }

  // Send email reminder
  private async sendEmailReminder(
    notification: ReminderNotification,
    timeframe: string
  ): Promise<void> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`
      ============================================
      📧 EMAIL REMINDER (${timeframe} before)
      ============================================
      To: ${notification.customerEmail}
      Subject: Reservation Reminder - ${notification.reservationId}

      Dear ${notification.customerName},

      This is a friendly reminder about your upcoming reservation:

      📅 Date: ${new Date(notification.reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
      🕐 Time: ${notification.reservationTime}
      🪑 Table: ${notification.tableName}
      👥 Party Size: ${notification.guests} guests

      We look forward to seeing you!

      Please arrive 10 minutes early.

      If you need to modify or cancel, please contact us at:
      📞 +250788587420

      Best regards,
      QuickTable Restaurant Team
      ============================================
    `);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Send SMS reminder
  private async sendSMSReminder(
    notification: ReminderNotification,
    timeframe: string
  ): Promise<void> {
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`
      ============================================
      📱 SMS REMINDER (${timeframe} before)
      ============================================
      To: ${notification.customerPhone}

      Hi ${notification.customerName}! Reminder: Your table reservation at QuickTable is in ${timeframe}.

      📅 ${new Date(notification.reservationDate).toLocaleDateString()} at ${notification.reservationTime}
      🪑 ${notification.tableName}
      👥 ${notification.guests} guests

      See you soon!
      ============================================
    `);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Send confirmation notification
  async sendConfirmationNotification(
    notification: ReminderNotification
  ): Promise<boolean> {
    try {
      console.log('✅ Sending reservation confirmation...');

      console.log(`
        ============================================
        ✅ RESERVATION CONFIRMED
        ============================================
        To: ${notification.customerEmail}

        Dear ${notification.customerName},

        Your reservation has been confirmed!

        Reservation ID: ${notification.reservationId}
        📅 Date: ${new Date(notification.reservationDate).toLocaleDateString()}
        🕐 Time: ${notification.reservationTime}
        🪑 Table: ${notification.tableName}
        👥 Party Size: ${notification.guests} guests

        You will receive reminders:
        • 24 hours before your reservation
        • 2 hours before your reservation

        Thank you for choosing QuickTable!
        ============================================
      `);

      return true;
    } catch (error) {
      console.error('Failed to send confirmation:', error);
      return false;
    }
  }

  // Schedule reminders for a reservation
  scheduleReminders(notification: ReminderNotification): void {
    const reservationDateTime = new Date(`${notification.reservationDate} ${notification.reservationTime}`);
    const now = new Date();

    // Calculate when to send reminders
    const reminder24Hours = new Date(reservationDateTime.getTime() - 24 * 60 * 60 * 1000);
    const reminder2Hours = new Date(reservationDateTime.getTime() - 2 * 60 * 60 * 1000);

    console.log(`
      ⏰ Reminders scheduled for Reservation ${notification.reservationId}:
      📅 24-hour reminder: ${reminder24Hours.toLocaleString()}
      📅 2-hour reminder: ${reminder2Hours.toLocaleString()}
    `);

    // In production, use a job scheduler like node-cron, bull, or AWS EventBridge
    // For now, just log the scheduled times

    if (reminder24Hours > now) {
      console.log('✓ 24-hour reminder will be sent');
    }

    if (reminder2Hours > now) {
      console.log('✓ 2-hour reminder will be sent');
    }
  }
}

export const notificationService = new NotificationService();
