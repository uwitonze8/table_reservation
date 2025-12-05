package com.quicktable.backend.controller;

import com.quicktable.backend.dto.auth.ChangePasswordRequest;
import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.user.UpdateProfileRequest;
import com.quicktable.backend.dto.user.UserDTO;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@Tag(name = "Customer", description = "Customer profile endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('USER')")
public class CustomerController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get customer profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(@AuthenticationPrincipal User user) {
        UserDTO profile = userService.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update customer profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDTO updatedProfile = userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedProfile));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @GetMapping("/loyalty-points")
    @Operation(summary = "Get loyalty points")
    public ResponseEntity<ApiResponse<Integer>> getLoyaltyPoints(@AuthenticationPrincipal User user) {
        UserDTO profile = userService.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile.getLoyaltyPoints()));
    }
}
