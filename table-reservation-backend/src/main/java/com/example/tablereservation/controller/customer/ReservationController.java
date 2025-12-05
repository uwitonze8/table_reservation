package com.example.tablereservation.controller.customer;

import com.example.tablereservation.dto.reservation.ReservationCreateDto;
import com.example.tablereservation.dto.reservation.ReservationConfirmDto;
import com.example.tablereservation.dto.reservation.ReservationDto;
import com.example.tablereservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/customer/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ReservationDto> createReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReservationCreateDto reservationCreateDto) {
        return ResponseEntity.ok(reservationService.createReservation(userDetails.getUsername(), reservationCreateDto));
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<ReservationDto>> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.getMyReservations(userDetails.getUsername()));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ReservationDto> confirmReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReservationConfirmDto reservationConfirmDto) {
        return ResponseEntity.ok(reservationService.confirmReservation(userDetails.getUsername(), reservationConfirmDto));
    }
}