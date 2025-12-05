package com.example.tablereservation.service.impl;

import com.example.tablereservation.dto.reservation.ReservationCreateDto;
import com.example.tablereservation.dto.reservation.ReservationConfirmDto;
import com.example.tablereservation.dto.reservation.ReservationDto;
import com.example.tablereservation.entity.Reservation;
import com.example.tablereservation.entity.RestaurantTable;
import com.example.tablereservation.entity.User;
import com.example.tablereservation.exception.BadRequestException;
import com.example.tablereservation.exception.ResourceNotFoundException;
import com.example.tablereservation.repository.ReservationRepository;
import com.example.tablereservation.repository.TableRepository;
import com.example.tablereservation.repository.UserRepository;
import com.example.tablereservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;

    @Autowired
    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                  UserRepository userRepository,
                                  TableRepository tableRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.tableRepository = tableRepository;
    }

    @Override
    @Transactional
    public ReservationDto createReservation(String userEmail, ReservationCreateDto reservationCreateDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // For now, assign a default table - this can be enhanced later
        RestaurantTable table = tableRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No tables available"));

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRestaurantTable(table);
        reservation.setFullName(reservationCreateDto.getFullName());
        reservation.setEmail(reservationCreateDto.getEmail());
        reservation.setPhone(reservationCreateDto.getPhone());
        reservation.setNumberOfGuests(reservationCreateDto.getNumberOfGuests());
        reservation.setReservationDateTime(reservationCreateDto.getReservationDateTime());
        reservation.setSpecialRequests(reservationCreateDto.getSpecialRequests());

        Reservation savedReservation = reservationRepository.save(reservation);
        return toReservationDto(savedReservation);
    }

    @Override
    @Transactional
    public ReservationDto confirmReservation(String userEmail, ReservationConfirmDto reservationConfirmDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Reservation reservation = reservationRepository.findById(reservationConfirmDto.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to confirm this reservation");
        }

        // Update reservation details if needed
        return toReservationDto(reservation);
    }

    @Override
    public List<ReservationDto> getMyReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Reservation> reservations = reservationRepository.findByUserId(user.getId());
        return reservations.stream()
                .map(this::toReservationDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReservationDto getReservationById(Long reservationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to view this reservation");
        }

        return toReservationDto(reservation);
    }

    @Override
    @Transactional
    public void cancelReservation(Long reservationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to cancel this reservation");
        }

        reservationRepository.delete(reservation);
    }

    @Override
    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toReservationDto)
                .collect(Collectors.toList());
    }

    private ReservationDto toReservationDto(Reservation reservation) {
        ReservationDto dto = new ReservationDto();
        dto.setId(reservation.getId());
        dto.setFullName(reservation.getFullName());
        dto.setEmail(reservation.getEmail());
        dto.setPhone(reservation.getPhone());
        dto.setNumberOfGuests(reservation.getNumberOfGuests());
        dto.setReservationDateTime(reservation.getReservationDateTime());
        dto.setSpecialRequests(reservation.getSpecialRequests());
        return dto;
    }
}
