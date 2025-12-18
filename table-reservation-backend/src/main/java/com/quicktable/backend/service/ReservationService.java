package com.quicktable.backend.service;

import com.quicktable.backend.dto.reservation.*;
import com.quicktable.backend.dto.common.PagedResponse;
import com.quicktable.backend.entity.*;
import com.quicktable.backend.exception.BadRequestException;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.ReservationRepository;
import com.quicktable.backend.repository.RestaurantTableRepository;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserService userService;
    private final DtoMapper dtoMapper;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public ReservationDTO createReservation(Long userId, CreateReservationRequest request) {
        User user = userService.getUserEntityById(userId);
        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        // Check if table has enough capacity
        if (table.getCapacity() < request.getNumberOfGuests()) {
            throw new BadRequestException("Table capacity (" + table.getCapacity() +
                    ") is less than the number of guests (" + request.getNumberOfGuests() + ")");
        }

        // Check for conflicting reservations (assuming 2-hour reservation slots)
        // A conflict exists if any existing reservation's time window overlaps with the new one
        // New reservation window: [requestTime - 2h, requestTime + 2h)
        LocalTime requestTime = request.getReservationTime();
        LocalTime windowStart = requestTime.minusHours(2).isBefore(LocalTime.MIN.plusHours(2))
                ? LocalTime.MIN : requestTime.minusHours(2);
        LocalTime windowEnd = requestTime.plusHours(2).isAfter(LocalTime.MAX.minusHours(2))
                ? LocalTime.MAX : requestTime.plusHours(2);

        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                request.getTableId(),
                request.getReservationDate(),
                windowStart,
                windowEnd
        );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This table is already reserved for the selected time slot");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .table(table)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .numberOfGuests(request.getNumberOfGuests())
                .specialRequests(request.getSpecialRequests())
                .preOrderData(request.getPreOrderData())
                .dietaryNotes(request.getDietaryNotes())
                .status(ReservationStatus.CONFIRMED)
                .loyaltyPointsEarned(0)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        // Mark table as RESERVED if reservation is for today and within current time window
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (request.getReservationDate().equals(today)) {
            // Check if reservation time is within 2 hours from now (before or after)
            LocalTime reservationTime = request.getReservationTime();
            long minutesDiff = Math.abs(java.time.Duration.between(now, reservationTime).toMinutes());
            if (minutesDiff <= 120) { // Within 2 hours
                table.setStatus(TableStatus.RESERVED);
                tableRepository.save(table);
                log.info("Table {} marked as RESERVED for reservation {}", table.getTableNumber(), savedReservation.getReservationCode());
            }
        }

        // Update user stats
        userService.updateUserStats(userId, false, false);

        // Send confirmation email
        emailService.sendReservationConfirmation(savedReservation);

        // Schedule reminders
        notificationService.scheduleReminders(savedReservation);

        return dtoMapper.toReservationDTO(savedReservation);
    }

    public ReservationDTO getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        return dtoMapper.toReservationDTO(reservation);
    }

    public ReservationDTO getReservationByCode(String code) {
        Reservation reservation = reservationRepository.findByReservationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        return dtoMapper.toReservationDTO(reservation);
    }

    public List<ReservationDTO> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(dtoMapper::toReservationDTO)
                .collect(Collectors.toList());
    }

    public PagedResponse<ReservationDTO> getUserReservationsPaged(Long userId, int page, int size, ReservationStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservationDate").descending());
        Page<Reservation> reservations;

        if (status != null) {
            reservations = reservationRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            reservations = reservationRepository.findByUserId(userId, pageable);
        }

        List<ReservationDTO> dtos = reservations.getContent().stream()
                .map(dtoMapper::toReservationDTO)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, page, size, reservations.getTotalElements());
    }

    public List<ReservationDTO> getReservationsByDate(LocalDate date) {
        return reservationRepository.findByReservationDate(date).stream()
                .map(dtoMapper::toReservationDTO)
                .collect(Collectors.toList());
    }

    public List<ReservationDTO> getTodayReservations() {
        return getReservationsByDate(LocalDate.now());
    }

    public List<ReservationDTO> getReservationsByDateRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.findByDateRange(startDate, endDate).stream()
                .map(dtoMapper::toReservationDTO)
                .collect(Collectors.toList());
    }

    public PagedResponse<ReservationDTO> searchReservations(ReservationFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.by(Sort.Direction.fromString(filter.getSortDirection()), filter.getSortBy())
        );

        Page<Reservation> reservations;

        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            reservations = reservationRepository.searchReservations(filter.getSearch(), pageable);
        } else {
            reservations = reservationRepository.findAll(pageable);
        }

        List<ReservationDTO> dtos = reservations.getContent().stream()
                .map(dtoMapper::toReservationDTO)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, filter.getPage(), filter.getSize(), reservations.getTotalElements());
    }

    @Transactional
    public ReservationDTO updateReservation(Long id, UpdateReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (request.getCustomerName() != null) {
            reservation.setCustomerName(request.getCustomerName());
        }
        if (request.getCustomerEmail() != null) {
            reservation.setCustomerEmail(request.getCustomerEmail());
        }
        if (request.getCustomerPhone() != null) {
            reservation.setCustomerPhone(request.getCustomerPhone());
        }
        if (request.getReservationDate() != null) {
            reservation.setReservationDate(request.getReservationDate());
        }
        if (request.getReservationTime() != null) {
            reservation.setReservationTime(request.getReservationTime());
        }
        if (request.getNumberOfGuests() != null) {
            reservation.setNumberOfGuests(request.getNumberOfGuests());
        }
        if (request.getSpecialRequests() != null) {
            reservation.setSpecialRequests(request.getSpecialRequests());
        }
        if (request.getTableId() != null) {
            RestaurantTable newTable = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
            reservation.setTable(newTable);
        }
        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }

        Reservation savedReservation = reservationRepository.save(reservation);
        return dtoMapper.toReservationDTO(savedReservation);
    }

    @Transactional
    public ReservationDTO confirmReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        reservation.setStatus(ReservationStatus.CONFIRMED);
        Reservation savedReservation = reservationRepository.save(reservation);

        emailService.sendReservationConfirmation(savedReservation);

        return dtoMapper.toReservationDTO(savedReservation);
    }

    @Transactional
    public ReservationDTO completeReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        reservation.setStatus(ReservationStatus.COMPLETED);

        // Award loyalty points (10 points per guest)
        int points = reservation.getNumberOfGuests() * 10;
        reservation.setLoyaltyPointsEarned(points);
        userService.addLoyaltyPoints(reservation.getUser().getId(), points);
        userService.updateUserStats(reservation.getUser().getId(), true, false);

        Reservation savedReservation = reservationRepository.save(reservation);
        return dtoMapper.toReservationDTO(savedReservation);
    }

    @Transactional
    public ReservationDTO cancelReservation(Long id, Long cancelledByUserId, String reason) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        // Check if reservation can be cancelled (at least 2 hours before)
        LocalDateTime reservationDateTime = LocalDateTime.of(
                reservation.getReservationDate(),
                reservation.getReservationTime()
        );

        if (LocalDateTime.now().plusHours(2).isAfter(reservationDateTime)) {
            throw new BadRequestException("Reservations can only be cancelled at least 2 hours in advance");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationReason(reason);
        reservation.setCancelledAt(LocalDateTime.now());

        if (cancelledByUserId != null) {
            User cancelledBy = userService.getUserEntityById(cancelledByUserId);
            reservation.setCancelledBy(cancelledBy);
        }

        userService.updateUserStats(reservation.getUser().getId(), false, true);

        Reservation savedReservation = reservationRepository.save(reservation);

        // Send cancellation email
        emailService.sendReservationCancellation(savedReservation);

        return dtoMapper.toReservationDTO(savedReservation);
    }

    @Transactional
    public ReservationDTO cancelReservationByCode(String code, Long cancelledByUserId, String reason) {
        Reservation reservation = reservationRepository.findByReservationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        // Check if reservation can be cancelled (at least 2 hours before)
        LocalDateTime reservationDateTime = LocalDateTime.of(
                reservation.getReservationDate(),
                reservation.getReservationTime()
        );

        if (LocalDateTime.now().plusHours(2).isAfter(reservationDateTime)) {
            throw new BadRequestException("Reservations can only be cancelled at least 2 hours in advance");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationReason(reason);
        reservation.setCancelledAt(LocalDateTime.now());

        if (cancelledByUserId != null) {
            User cancelledBy = userService.getUserEntityById(cancelledByUserId);
            reservation.setCancelledBy(cancelledBy);
        }

        userService.updateUserStats(reservation.getUser().getId(), false, true);

        Reservation savedReservation = reservationRepository.save(reservation);

        // Send cancellation email
        emailService.sendReservationCancellation(savedReservation);

        return dtoMapper.toReservationDTO(savedReservation);
    }

    @Transactional
    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        reservationRepository.delete(reservation);
    }

    // Admin methods for creating reservations for walk-ins or phone bookings
    @Transactional
    public ReservationDTO createAdminReservation(CreateReservationRequest request, Long adminId) {
        // For admin-created reservations, we need to find or create a user
        User admin = userService.getUserEntityById(adminId);

        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        Reservation reservation = Reservation.builder()
                .user(admin) // Admin creates on behalf
                .table(table)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .numberOfGuests(request.getNumberOfGuests())
                .specialRequests(request.getSpecialRequests())
                .preOrderData(request.getPreOrderData())
                .dietaryNotes(request.getDietaryNotes())
                .status(ReservationStatus.CONFIRMED)
                .loyaltyPointsEarned(0)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        // Send confirmation email to customer
        emailService.sendReservationConfirmation(savedReservation);

        return dtoMapper.toReservationDTO(savedReservation);
    }
}
