package com.example.tablereservation.repository;

import com.example.tablereservation.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TableRepository extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findAvailableTables(LocalDateTime reservationDateTime, int numberOfGuests);
}