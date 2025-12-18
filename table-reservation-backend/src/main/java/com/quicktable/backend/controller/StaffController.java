package com.quicktable.backend.controller;

import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.reservation.ReservationDTO;
import com.quicktable.backend.dto.reservation.UpdateReservationRequest;
import com.quicktable.backend.dto.table.TableDTO;
import com.quicktable.backend.entity.TableStatus;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.service.ReservationService;
import com.quicktable.backend.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@Tag(name = "Staff", description = "Staff operation endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'MANAGER', 'HOST')")
public class StaffController {

    private final ReservationService reservationService;
    private final TableService tableService;

    // ==================== RESERVATIONS ====================

    @GetMapping("/reservations/today")
    @Operation(summary = "Get today's reservations")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getTodayReservations() {
        List<ReservationDTO> reservations = reservationService.getTodayReservations();
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/reservations/date/{date}")
    @Operation(summary = "Get reservations by date")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getReservationsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ReservationDTO> reservations = reservationService.getReservationsByDate(date);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/reservations/range")
    @Operation(summary = "Get reservations by date range")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getReservationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ReservationDTO> reservations = reservationService.getReservationsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/reservations/{id}")
    @Operation(summary = "Get reservation details")
    public ResponseEntity<ApiResponse<ReservationDTO>> getReservationById(@PathVariable Long id) {
        ReservationDTO reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    @PutMapping("/reservations/{id}")
    @Operation(summary = "Update reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationRequest request) {
        ReservationDTO reservation = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reservation updated", reservation));
    }

    @PostMapping("/reservations/{id}/confirm")
    @Operation(summary = "Confirm reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> confirmReservation(@PathVariable Long id) {
        ReservationDTO reservation = reservationService.confirmReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation confirmed", reservation));
    }

    @PostMapping("/reservations/{id}/complete")
    @Operation(summary = "Mark reservation as completed")
    public ResponseEntity<ApiResponse<ReservationDTO>> completeReservation(@PathVariable Long id) {
        ReservationDTO reservation = reservationService.completeReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation completed", reservation));
    }

    @PostMapping("/reservations/{id}/cancel")
    @Operation(summary = "Cancel reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> cancelReservation(
            @AuthenticationPrincipal User staff,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        ReservationDTO reservation = reservationService.cancelReservation(id, staff.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", reservation));
    }

    // ==================== TABLES ====================

    @GetMapping("/tables")
    @Operation(summary = "Get all tables with status")
    public ResponseEntity<ApiResponse<List<TableDTO>>> getAllTables() {
        List<TableDTO> tables = tableService.getAllTables();
        return ResponseEntity.ok(ApiResponse.success(tables));
    }

    @PatchMapping("/tables/{id}/status")
    @Operation(summary = "Update table status")
    public ResponseEntity<ApiResponse<TableDTO>> updateTableStatus(
            @PathVariable Long id,
            @RequestParam TableStatus status) {
        TableDTO table = tableService.updateTableStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Table status updated", table));
    }

    @GetMapping("/tables/status/{status}")
    @Operation(summary = "Get tables by status")
    public ResponseEntity<ApiResponse<List<TableDTO>>> getTablesByStatus(@PathVariable TableStatus status) {
        List<TableDTO> tables = tableService.getTablesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(tables));
    }
}
