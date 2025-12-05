package com.example.tablereservation.service;

import com.example.tablereservation.dto.reservation.ReservationCreateDto;
import com.example.tablereservation.dto.reservation.ReservationDto;
import com.example.tablereservation.dto.reservation.ReservationConfirmDto;

import java.util.List;

public interface ReservationService {

    ReservationDto createReservation(String userEmail, ReservationCreateDto reservationCreateDto);

    ReservationDto confirmReservation(String userEmail, ReservationConfirmDto reservationConfirmDto);

    List<ReservationDto> getMyReservations(String userEmail);

    ReservationDto getReservationById(Long reservationId, String userEmail);

    void cancelReservation(Long reservationId, String userEmail);

    List<ReservationDto> getAllReservations();
}
