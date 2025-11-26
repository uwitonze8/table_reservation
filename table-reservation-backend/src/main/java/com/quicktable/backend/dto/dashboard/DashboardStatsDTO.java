package com.quicktable.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private LocalDate date;

    // Reservation stats
    private Long totalReservations;
    private Long confirmedReservations;
    private Long pendingReservations;
    private Long cancelledReservations;
    private Long completedReservations;

    // Guest stats
    private Long totalGuestsExpected;
    private Long totalGuestsServed;

    // Table stats
    private Long totalTables;
    private Long availableTables;
    private Long occupiedTables;
    private Double occupancyRate;

    // Customer stats
    private Long totalCustomers;
    private Long newCustomersToday;

    // Revenue stats (if applicable)
    private Double estimatedRevenue;

    // Trends
    private Double reservationTrend;
    private Double guestTrend;
}
