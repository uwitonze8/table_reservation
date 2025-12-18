package com.quicktable.backend.repository;

import com.quicktable.backend.entity.RestaurantTable;
import com.quicktable.backend.entity.TableLocation;
import com.quicktable.backend.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);

    boolean existsByTableNumber(Integer tableNumber);

    List<RestaurantTable> findByStatus(TableStatus status);

    List<RestaurantTable> findByLocation(TableLocation location);

    List<RestaurantTable> findByCapacityGreaterThanEqual(Integer capacity);

    // Find tables that are available for the requested time slot
    // Excludes tables that have any reservation overlapping with the 2-hour window
    @Query("SELECT t FROM RestaurantTable t WHERE t.capacity >= :guests AND t.status != 'MAINTENANCE' " +
            "AND t.id NOT IN (" +
            "  SELECT r.table.id FROM Reservation r " +
            "  WHERE r.reservationDate = :date " +
            "  AND r.reservationTime BETWEEN :windowStart AND :windowEnd " +
            "  AND r.status IN ('PENDING', 'CONFIRMED')" +
            ")")
    List<RestaurantTable> findAvailableTables(@Param("date") LocalDate date,
                                               @Param("windowStart") LocalTime windowStart,
                                               @Param("windowEnd") LocalTime windowEnd,
                                               @Param("guests") Integer guests);

    @Query("SELECT COUNT(t) FROM RestaurantTable t WHERE t.status = :status")
    Long countByStatus(@Param("status") TableStatus status);

    @Query("SELECT COUNT(t) FROM RestaurantTable t")
    Long countAllTables();

    // Find tables that are RESERVED or OCCUPIED but have no active reservations
    // (i.e., the reservation time window has passed)
    @Query("SELECT t FROM RestaurantTable t WHERE t.status IN ('RESERVED', 'OCCUPIED') " +
            "AND t.id NOT IN (" +
            "  SELECT r.table.id FROM Reservation r " +
            "  WHERE r.reservationDate = :date " +
            "  AND r.reservationTime BETWEEN :windowStart AND :windowEnd " +
            "  AND r.status IN ('PENDING', 'CONFIRMED')" +
            ")")
    List<RestaurantTable> findTablesWithExpiredReservations(@Param("date") LocalDate date,
                                                             @Param("windowStart") LocalTime windowStart,
                                                             @Param("windowEnd") LocalTime windowEnd);
}
