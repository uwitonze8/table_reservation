package com.quicktable.backend.controller;

import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.common.PagedResponse;
import com.quicktable.backend.dto.contact.*;
import com.quicktable.backend.dto.dashboard.DashboardStatsDTO;
import com.quicktable.backend.dto.reservation.*;
import com.quicktable.backend.dto.staff.*;
import com.quicktable.backend.dto.table.*;
import com.quicktable.backend.dto.user.UserDTO;
import com.quicktable.backend.entity.TableStatus;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.service.*;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DashboardService dashboardService;
    private final ReservationService reservationService;
    private final TableService tableService;
    private final StaffService staffService;
    private final UserService userService;
    private final ContactMessageService contactMessageService;
    private final MenuItemService menuItemService;

    // ==================== DASHBOARD ====================

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/dashboard/stats/{date}")
    @Operation(summary = "Get statistics for a specific date")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStatsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DashboardStatsDTO stats = dashboardService.getStatsByDate(date);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== RESERVATIONS ====================

    @GetMapping("/reservations")
    @Operation(summary = "Get all reservations (paged)")
    public ResponseEntity<ApiResponse<PagedResponse<ReservationDTO>>> getAllReservations(
            @ModelAttribute ReservationFilterRequest filter) {
        PagedResponse<ReservationDTO> reservations = reservationService.searchReservations(filter);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

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

    @PostMapping("/reservations")
    @Operation(summary = "Create reservation (admin)")
    public ResponseEntity<ApiResponse<ReservationDTO>> createReservation(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody CreateReservationRequest request) {
        ReservationDTO reservation = reservationService.createAdminReservation(request, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Reservation created successfully", reservation));
    }

    @PutMapping("/reservations/{id}")
    @Operation(summary = "Update reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationRequest request) {
        ReservationDTO reservation = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reservation updated successfully", reservation));
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
            @AuthenticationPrincipal User admin,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        ReservationDTO reservation = reservationService.cancelReservation(id, admin.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", reservation));
    }

    @DeleteMapping("/reservations/{id}")
    @Operation(summary = "Delete reservation")
    public ResponseEntity<ApiResponse<Void>> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation deleted"));
    }

    // ==================== TABLES ====================

    @GetMapping("/tables")
    @Operation(summary = "Get all tables")
    public ResponseEntity<ApiResponse<List<TableDTO>>> getAllTables() {
        List<TableDTO> tables = tableService.getAllTables();
        return ResponseEntity.ok(ApiResponse.success(tables));
    }

    @PostMapping("/tables")
    @Operation(summary = "Create table")
    public ResponseEntity<ApiResponse<TableDTO>> createTable(@Valid @RequestBody CreateTableRequest request) {
        TableDTO table = tableService.createTable(request);
        return ResponseEntity.ok(ApiResponse.success("Table created successfully", table));
    }

    @PutMapping("/tables/{id}")
    @Operation(summary = "Update table")
    public ResponseEntity<ApiResponse<TableDTO>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTableRequest request) {
        TableDTO table = tableService.updateTable(id, request);
        return ResponseEntity.ok(ApiResponse.success("Table updated successfully", table));
    }

    @PatchMapping("/tables/{id}/status")
    @Operation(summary = "Update table status")
    public ResponseEntity<ApiResponse<TableDTO>> updateTableStatus(
            @PathVariable Long id,
            @RequestParam TableStatus status) {
        TableDTO table = tableService.updateTableStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Table status updated", table));
    }

    @DeleteMapping("/tables/{id}")
    @Operation(summary = "Delete table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success("Table deleted"));
    }

    // ==================== STAFF ====================

    @GetMapping("/staff")
    @Operation(summary = "Get all staff")
    public ResponseEntity<ApiResponse<List<StaffDTO>>> getAllStaff() {
        List<StaffDTO> staff = staffService.getAllStaff();
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @GetMapping("/staff/paged")
    @Operation(summary = "Get all staff (paged)")
    public ResponseEntity<ApiResponse<PagedResponse<StaffDTO>>> getAllStaffPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<StaffDTO> staff = staffService.getAllStaffPaged(page, size, search);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @GetMapping("/staff/{id}")
    @Operation(summary = "Get staff by ID")
    public ResponseEntity<ApiResponse<StaffDTO>> getStaffById(@PathVariable Long id) {
        StaffDTO staff = staffService.getStaffById(id);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @PostMapping("/staff")
    @Operation(summary = "Create staff member")
    public ResponseEntity<ApiResponse<StaffDTO>> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        StaffDTO staff = staffService.createStaff(request);
        return ResponseEntity.ok(ApiResponse.success("Staff member created successfully", staff));
    }

    @PutMapping("/staff/{id}")
    @Operation(summary = "Update staff member")
    public ResponseEntity<ApiResponse<StaffDTO>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStaffRequest request) {
        StaffDTO staff = staffService.updateStaff(id, request);
        return ResponseEntity.ok(ApiResponse.success("Staff member updated successfully", staff));
    }

    @PatchMapping("/staff/{id}/toggle-status")
    @Operation(summary = "Toggle staff active status")
    public ResponseEntity<ApiResponse<StaffDTO>> toggleStaffStatus(@PathVariable Long id) {
        StaffDTO staff = staffService.toggleStaffStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Staff status updated", staff));
    }

    @DeleteMapping("/staff/{id}")
    @Operation(summary = "Delete staff member")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(ApiResponse.success("Staff member deleted"));
    }

    // ==================== CUSTOMERS ====================

    @GetMapping("/customers")
    @Operation(summary = "Get all customers")
    public ResponseEntity<ApiResponse<PagedResponse<UserDTO>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<UserDTO> customers = userService.getAllCustomers(page, size, search);
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    @GetMapping("/customers/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<ApiResponse<UserDTO>> getCustomerById(@PathVariable Long id) {
        UserDTO customer = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(customer));
    }

    @GetMapping("/customers/{id}/reservations")
    @Operation(summary = "Get customer's reservations")
    public ResponseEntity<ApiResponse<List<ReservationDTO>>> getCustomerReservations(@PathVariable Long id) {
        List<ReservationDTO> reservations = reservationService.getUserReservations(id);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    // ==================== CONTACT MESSAGES ====================

    @GetMapping("/messages")
    @Operation(summary = "Get all contact messages")
    public ResponseEntity<ApiResponse<PagedResponse<ContactMessageDTO>>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ContactMessageDTO> messages = contactMessageService.getAllMessagesPaged(page, size);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/messages/unread")
    @Operation(summary = "Get unread messages")
    public ResponseEntity<ApiResponse<List<ContactMessageDTO>>> getUnreadMessages() {
        List<ContactMessageDTO> messages = contactMessageService.getUnreadMessages();
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/messages/{id}")
    @Operation(summary = "Get message by ID")
    public ResponseEntity<ApiResponse<ContactMessageDTO>> getMessageById(@PathVariable Long id) {
        ContactMessageDTO message = contactMessageService.getMessageById(id);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PatchMapping("/messages/{id}/read")
    @Operation(summary = "Mark message as read")
    public ResponseEntity<ApiResponse<ContactMessageDTO>> markMessageAsRead(@PathVariable Long id) {
        ContactMessageDTO message = contactMessageService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PostMapping("/messages/{id}/reply")
    @Operation(summary = "Reply to message")
    public ResponseEntity<ApiResponse<ContactMessageDTO>> replyToMessage(
            @PathVariable Long id,
            @Valid @RequestBody ReplyContactMessageRequest request) {
        ContactMessageDTO message = contactMessageService.replyToMessage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reply sent successfully", message));
    }

    @DeleteMapping("/messages/{id}")
    @Operation(summary = "Delete message")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted"));
    }

    // ==================== MENU ====================

    @DeleteMapping("/menu/reset")
    @Operation(summary = "Delete all menu items to allow re-seeding")
    public ResponseEntity<ApiResponse<Void>> resetMenuItems() {
        menuItemService.deleteAllMenuItems();
        return ResponseEntity.ok(ApiResponse.success("All menu items deleted. Restart server to re-seed."));
    }
}
