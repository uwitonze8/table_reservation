package com.quicktable.backend.controller;

import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.common.PagedResponse;
import com.quicktable.backend.dto.reservation.*;
import com.quicktable.backend.entity.ReservationStatus;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Reservation management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> createReservation(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReservationRequest request) {
        ReservationDTO reservation = reservationService.createReservation(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Reservation created successfully", reservation));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get reservation by ID")
    public ResponseEntity<ApiResponse<ReservationDTO>> getReservationById(@PathVariable Long id) {
        ReservationDTO reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get reservation by confirmation code")
    public ResponseEntity<ApiResponse<ReservationDTO>> getReservationByCode(@PathVariable String code) {
        ReservationDTO reservation = reservationService.getReservationByCode(code);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    @GetMapping("/my-reservations")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's reservations")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getMyReservations(
            @AuthenticationPrincipal User user) {
        List<ReservationDTO> reservations = reservationService.getUserReservations(user.getId());
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/my-reservations/paged")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's reservations (paged)")
    public ResponseEntity<ApiResponse<PagedResponse<ReservationDTO>>> getMyReservationsPaged(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ReservationStatus status) {
        PagedResponse<ReservationDTO> reservations = reservationService
                .getUserReservationsPaged(user.getId(), page, size, status);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationRequest request) {
        ReservationDTO reservation = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reservation updated successfully", reservation));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel reservation by ID")
    public ResponseEntity<ApiResponse<ReservationDTO>> cancelReservation(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        ReservationDTO reservation = reservationService.cancelReservation(id, user.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully", reservation));
    }

    @PostMapping("/code/{code}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel reservation by code")
    public ResponseEntity<ApiResponse<ReservationDTO>> cancelReservationByCode(
            @AuthenticationPrincipal User user,
            @PathVariable String code,
            @RequestParam(required = false) String reason) {
        ReservationDTO reservation = reservationService.cancelReservationByCode(code, user.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully", reservation));
    }
}
