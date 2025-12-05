package com.quicktable.backend.service;

import com.quicktable.backend.entity.ContactMessage;
import com.quicktable.backend.entity.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@quicktable.com}")
    private String fromEmail;

    @Value("${app.email.admin:admin@quicktable.com}")
    private String adminEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendReservationConfirmation(Reservation reservation) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(reservation.getCustomerEmail());
            message.setSubject("Reservation Confirmation - QuickTable");
            message.setText(buildConfirmationEmail(reservation));
            mailSender.send(message);
            log.info("Confirmation email sent to: {}", reservation.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send confirmation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendReservationCancellation(Reservation reservation) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(reservation.getCustomerEmail());
            message.setSubject("Reservation Cancelled - QuickTable");
            message.setText(buildCancellationEmail(reservation));
            mailSender.send(message);
            log.info("Cancellation email sent to: {}", reservation.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send cancellation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendReservationReminder(Reservation reservation, int hoursUntil) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(reservation.getCustomerEmail());
            message.setSubject("Reservation Reminder - QuickTable");
            message.setText(buildReminderEmail(reservation, hoursUntil));
            mailSender.send(message);
            log.info("Reminder email sent to: {}", reservation.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send reminder email: {}", e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String email, String firstName, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request - QuickTable");
            message.setText(buildPasswordResetEmail(firstName, token));
            mailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
        }
    }

    @Async
    public void sendNewContactMessageNotification(ContactMessage contactMessage) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("New Contact Message - QuickTable");
            message.setText(buildContactNotificationEmail(contactMessage));
            mailSender.send(message);
            log.info("Contact notification sent to admin");
        } catch (Exception e) {
            log.error("Failed to send contact notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendContactReply(String email, String firstName, String replyMessage) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Re: Your Message to QuickTable");
            message.setText(buildContactReplyEmail(firstName, replyMessage));
            mailSender.send(message);
            log.info("Contact reply sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send contact reply: {}", e.getMessage());
        }
    }

    private String buildConfirmationEmail(Reservation reservation) {
        return String.format("""
            Dear %s,

            Your reservation has been confirmed!

            Reservation Details:
            -------------------
            Confirmation Code: %s
            Date: %s
            Time: %s
            Party Size: %d guests
            Table: %s

            Special Requests: %s

            Please arrive 10 minutes before your reservation time.

            Cancellation Policy:
            Reservations can be cancelled up to 2 hours before the scheduled time.

            We look forward to seeing you!

            Best regards,
            QuickTable Team
            """,
                reservation.getCustomerName(),
                reservation.getReservationCode(),
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getNumberOfGuests(),
                reservation.getTable().getTableName(),
                reservation.getSpecialRequests() != null ? reservation.getSpecialRequests() : "None"
        );
    }

    private String buildCancellationEmail(Reservation reservation) {
        return String.format("""
            Dear %s,

            Your reservation has been cancelled.

            Cancelled Reservation Details:
            -----------------------------
            Confirmation Code: %s
            Date: %s
            Time: %s

            Reason: %s

            If you did not request this cancellation, please contact us immediately.

            We hope to see you again soon!

            Best regards,
            QuickTable Team
            """,
                reservation.getCustomerName(),
                reservation.getReservationCode(),
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getCancellationReason() != null ? reservation.getCancellationReason() : "Not specified"
        );
    }

    private String buildReminderEmail(Reservation reservation, int hoursUntil) {
        return String.format("""
            Dear %s,

            This is a friendly reminder about your upcoming reservation in %d hours!

            Reservation Details:
            -------------------
            Confirmation Code: %s
            Date: %s
            Time: %s
            Party Size: %d guests
            Table: %s

            Please remember to arrive 10 minutes early.

            If you need to make any changes, please contact us or manage your reservation online.

            We look forward to seeing you!

            Best regards,
            QuickTable Team
            """,
                reservation.getCustomerName(),
                hoursUntil,
                reservation.getReservationCode(),
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getNumberOfGuests(),
                reservation.getTable().getTableName()
        );
    }

    private String buildPasswordResetEmail(String firstName, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        return String.format("""
            Dear %s,

            We received a request to reset your password for your QuickTable account.

            Click the link below to reset your password:
            %s

            This link will expire in 24 hours.

            If you did not request a password reset, please ignore this email or contact us if you have concerns.

            Best regards,
            QuickTable Team
            """,
                firstName,
                resetLink
        );
    }

    private String buildContactNotificationEmail(ContactMessage contactMessage) {
        return String.format("""
            New contact message received:

            From: %s %s
            Email: %s

            Message:
            %s

            ---
            Received at: %s
            """,
                contactMessage.getFirstName(),
                contactMessage.getLastName(),
                contactMessage.getEmail(),
                contactMessage.getMessage(),
                contactMessage.getCreatedAt()
        );
    }

    private String buildContactReplyEmail(String firstName, String replyMessage) {
        return String.format("""
            Dear %s,

            Thank you for contacting QuickTable. Here is our response to your inquiry:

            %s

            If you have any further questions, please don't hesitate to reach out.

            Best regards,
            QuickTable Team
            """,
                firstName,
                replyMessage
        );
    }
}
