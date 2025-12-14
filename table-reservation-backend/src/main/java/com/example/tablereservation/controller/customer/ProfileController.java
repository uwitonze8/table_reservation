package com.example.tablereservation.controller.customer;

import com.example.tablereservation.dto.user.UserProfileDto;
import com.example.tablereservation.service.AuthService;
import com.example.tablereservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
public class ProfileController {

    private final AuthService authService;
    private final ReservationService reservationService;

    @Autowired
    public ProfileController(AuthService authService, ReservationService reservationService) {
        this.authService = authService;
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal String email) {
        UserProfileDto userProfile = authService.getUserProfile(email);
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(@AuthenticationPrincipal String email, @RequestBody UserProfileDto userProfileDto) {
        UserProfileDto updatedProfile = authService.updateUserProfile(email, userProfileDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> getUserReservations(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(reservationService.getMyReservations(email));
    }
}