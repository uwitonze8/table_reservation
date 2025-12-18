package com.quicktable.backend.repository;

import com.quicktable.backend.entity.Reservation;
import com.quicktable.backend.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByReservationCode(String reservationCode);

    List<Reservation> findByUserId(Long userId);

    Page<Reservation> findByUserId(Long userId, Pageable pageable);

    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);

    Page<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status, Pageable pageable);

    List<Reservation> findByReservationDate(LocalDate date);

    List<Reservation> findByReservationDateAndStatus(LocalDate date, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId AND r.reservationDate = :date " +
            "AND r.status IN ('PENDING', 'CONFIRMED')")
    List<Reservation> findActiveReservationsByTableAndDate(@Param("tableId") Long tableId,
                                                            @Param("date") LocalDate date);

    // Check for overlapping reservations assuming 2-hour reservation windows
    // Fetches all active reservations for the table on the given date
    // The overlap check is done in the service layer for database portability
    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId AND r.reservationDate = :date " +
            "AND r.status IN ('PENDING', 'CONFIRMED') " +
            "AND r.reservationTime BETWEEN :startTime AND :endTime")
    List<Reservation> findConflictingReservations(@Param("tableId") Long tableId,
                                                   @Param("date") LocalDate date,
                                                   @Param("startTime") LocalTime startTime,
                                                   @Param("endTime") LocalTime endTime);

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate = :date AND r.status IN ('PENDING', 'CONFIRMED')")
    List<Reservation> findActiveReservationsByDate(@Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE " +
            "(LOWER(r.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "r.reservationCode LIKE CONCAT('%', :search, '%'))")
    Page<Reservation> searchReservations(@Param("search") String search, Pageable pageable);

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate BETWEEN :startDate AND :endDate")
    List<Reservation> findByDateRange(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate BETWEEN :startDate AND :endDate AND r.status = :status")
    List<Reservation> findByDateRangeAndStatus(@Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate,
                                                @Param("status") ReservationStatus status);

    // Stats queries
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.reservationDate = :date")
    Long countByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.reservationDate = :date AND r.status = :status")
    Long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") ReservationStatus status);

    @Query("SELECT COALESCE(SUM(r.numberOfGuests), 0) FROM Reservation r WHERE r.reservationDate = :date " +
            "AND r.status IN ('PENDING', 'CONFIRMED')")
    Long sumGuestsByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(r.numberOfGuests), 0) FROM Reservation r WHERE r.reservationDate = :date " +
            "AND r.status = 'COMPLETED'")
    Long sumServedGuestsByDate(@Param("date") LocalDate date);

    // Reminder queries
    @Query("SELECT r FROM Reservation r WHERE r.reservationDate = :date AND r.reminderSent24h = false " +
            "AND r.status IN ('PENDING', 'CONFIRMED')")
    List<Reservation> findReservationsFor24hReminder(@Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate = :date AND r.reservationTime = :time " +
            "AND r.reminderSent2h = false AND r.status IN ('PENDING', 'CONFIRMED')")
    List<Reservation> findReservationsFor2hReminder(@Param("date") LocalDate date, @Param("time") LocalTime time);
}
