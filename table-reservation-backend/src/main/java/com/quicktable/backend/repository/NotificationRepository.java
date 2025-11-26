package com.quicktable.backend.repository;

import com.quicktable.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    List<Notification> findByReservationId(Long reservationId);

    @Query("SELECT n FROM Notification n WHERE n.sent = false AND n.scheduledFor <= :now")
    List<Notification> findPendingNotifications(@Param("now") LocalDateTime now);

    List<Notification> findByUserIdAndSentFalse(Long userId);

    Long countByUserIdAndSentFalse(Long userId);
}
