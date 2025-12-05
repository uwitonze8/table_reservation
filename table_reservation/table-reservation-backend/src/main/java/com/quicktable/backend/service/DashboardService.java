package com.quicktable.backend.service;

import com.quicktable.backend.dto.dashboard.DashboardStatsDTO;
import com.quicktable.backend.entity.ReservationStatus;
import com.quicktable.backend.entity.TableStatus;
import com.quicktable.backend.repository.ReservationRepository;
import com.quicktable.backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserService userService;

    public DashboardStatsDTO getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // Today's reservation counts
        Long totalReservations = reservationRepository.countByDate(today);
        Long confirmedReservations = reservationRepository.countByDateAndStatus(today, ReservationStatus.CONFIRMED);
        Long pendingReservations = reservationRepository.countByDateAndStatus(today, ReservationStatus.PENDING);
        Long cancelledReservations = reservationRepository.countByDateAndStatus(today, ReservationStatus.CANCELLED);
        Long completedReservations = reservationRepository.countByDateAndStatus(today, ReservationStatus.COMPLETED);

        // Yesterday's total for trend calculation
        Long yesterdayTotal = reservationRepository.countByDate(yesterday);
        Double reservationTrend = calculateTrend(totalReservations, yesterdayTotal);

        // Guest stats
        Long totalGuestsExpected = reservationRepository.sumGuestsByDate(today);
        Long totalGuestsServed = reservationRepository.sumServedGuestsByDate(today);

        // Yesterday's guests for trend
        Long yesterdayGuests = reservationRepository.sumGuestsByDate(yesterday);
        Double guestTrend = calculateTrend(totalGuestsExpected, yesterdayGuests);

        // Table stats
        Long totalTables = tableRepository.countAllTables();
        Long availableTables = tableRepository.countByStatus(TableStatus.AVAILABLE);
        Long occupiedTables = tableRepository.countByStatus(TableStatus.OCCUPIED);
        Double occupancyRate = totalTables > 0 ? (double) occupiedTables / totalTables * 100 : 0.0;

        // Customer stats
        Long totalCustomers = userService.getTotalCustomers();
        Long newCustomersToday = userService.countNewCustomersToday();

        return DashboardStatsDTO.builder()
                .date(today)
                .totalReservations(totalReservations)
                .confirmedReservations(confirmedReservations)
                .pendingReservations(pendingReservations)
                .cancelledReservations(cancelledReservations)
                .completedReservations(completedReservations)
                .totalGuestsExpected(totalGuestsExpected)
                .totalGuestsServed(totalGuestsServed)
                .totalTables(totalTables)
                .availableTables(availableTables)
                .occupiedTables(occupiedTables)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .totalCustomers(totalCustomers)
                .newCustomersToday(newCustomersToday)
                .reservationTrend(reservationTrend)
                .guestTrend(guestTrend)
                .build();
    }

    public DashboardStatsDTO getStatsByDate(LocalDate date) {
        Long totalReservations = reservationRepository.countByDate(date);
        Long confirmedReservations = reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
        Long pendingReservations = reservationRepository.countByDateAndStatus(date, ReservationStatus.PENDING);
        Long cancelledReservations = reservationRepository.countByDateAndStatus(date, ReservationStatus.CANCELLED);
        Long completedReservations = reservationRepository.countByDateAndStatus(date, ReservationStatus.COMPLETED);

        Long totalGuestsExpected = reservationRepository.sumGuestsByDate(date);
        Long totalGuestsServed = reservationRepository.sumServedGuestsByDate(date);

        return DashboardStatsDTO.builder()
                .date(date)
                .totalReservations(totalReservations)
                .confirmedReservations(confirmedReservations)
                .pendingReservations(pendingReservations)
                .cancelledReservations(cancelledReservations)
                .completedReservations(completedReservations)
                .totalGuestsExpected(totalGuestsExpected)
                .totalGuestsServed(totalGuestsServed)
                .build();
    }

    private Double calculateTrend(Long current, Long previous) {
        if (previous == null || previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((double) (current - previous) / previous * 100) * 10.0) / 10.0;
    }
}
