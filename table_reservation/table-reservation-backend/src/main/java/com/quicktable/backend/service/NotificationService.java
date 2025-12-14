package com.quicktable.backend.service;

import com.quicktable.backend.entity.*;
import com.quicktable.backend.repository.NotificationRepository;
import com.quicktable.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    @Transactional
    public void scheduleReminders(Reservation reservation) {
        // Schedule 24-hour reminder
        LocalDateTime reservation24h = LocalDateTime.of(
                reservation.getReservationDate().minusDays(1),
                reservation.getReservationTime()
        );

        if (reservation24h.isAfter(LocalDateTime.now())) {
            Notification reminder24h = Notification.builder()
                    .reservation(reservation)
                    .user(reservation.getUser())
                    .type(NotificationType.REMINDER_24H)
                    .title("Reservation Reminder - 24 Hours")
                    .message("Your reservation is in 24 hours")
                    .sent(false)
                    .scheduledFor(reservation24h)
                    .build();
            notificationRepository.save(reminder24h);
        }

        // Schedule 2-hour reminder
        LocalDateTime reservation2h = LocalDateTime.of(
                reservation.getReservationDate(),
                reservation.getReservationTime().minusHours(2)
        );

        if (reservation2h.isAfter(LocalDateTime.now())) {
            Notification reminder2h = Notification.builder()
                    .reservation(reservation)
                    .user(reservation.getUser())
                    .type(NotificationType.REMINDER_2H)
                    .title("Reservation Reminder - 2 Hours")
                    .message("Your reservation is in 2 hours")
                    .sent(false)
                    .scheduledFor(reservation2h)
                    .build();
            notificationRepository.save(reminder2h);
        }

        log.info("Scheduled reminders for reservation: {}", reservation.getReservationCode());
    }

    // Run every 15 minutes to check for pending notifications
    @Scheduled(fixedRate = 900000) // 15 minutes
    @Transactional
    public void processPendingNotifications() {
        List<Notification> pendingNotifications = notificationRepository
                .findPendingNotifications(LocalDateTime.now());

        for (Notification notification : pendingNotifications) {
            try {
                sendNotification(notification);
                notification.setSent(true);
                notification.setSentAt(LocalDateTime.now());
                notificationRepository.save(notification);
                log.info("Sent notification: {} for reservation: {}",
                        notification.getType(),
                        notification.getReservation().getReservationCode());
            } catch (Exception e) {
                log.error("Failed to send notification: {}", e.getMessage());
            }
        }
    }

    private void sendNotification(Notification notification) {
        Reservation reservation = notification.getReservation();

        switch (notification.getType()) {
            case REMINDER_24H:
                emailService.sendReservationReminder(reservation, 24);
                reservation.setReminderSent24h(true);
                reservationRepository.save(reservation);
                break;
            case REMINDER_2H:
                emailService.sendReservationReminder(reservation, 2);
                reservation.setReminderSent2h(true);
                reservationRepository.save(reservation);
                break;
            case CONFIRMATION:
                emailService.sendReservationConfirmation(reservation);
                reservation.setConfirmationSent(true);
                reservationRepository.save(reservation);
                break;
            case CANCELLATION:
                emailService.sendReservationCancellation(reservation);
                break;
            default:
                log.warn("Unknown notification type: {}", notification.getType());
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    public Long getUnsentNotificationsCount(Long userId) {
        return notificationRepository.countByUserIdAndSentFalse(userId);
    }
}
