package com.example.tablereservation.controller.admin;

import com.example.tablereservation.entity.Reservation;
import com.example.tablereservation.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
public class ReservationManagementController {

    private final AdminService adminService;

    @Autowired
    public ReservationManagementController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = adminService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @PostMapping
    public ResponseEntity<Void> createReservation(@Valid @RequestBody Reservation reservation) {
        adminService.addReservation(reservation);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateReservation(@PathVariable Long id, @Valid @RequestBody Reservation reservation) {
        adminService.editReservation(id, reservation);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        adminService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
