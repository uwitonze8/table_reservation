package com.quicktable.backend.service;

import com.quicktable.backend.dto.auth.*;
import com.quicktable.backend.dto.user.UserDTO;
import com.quicktable.backend.entity.Role;
import com.quicktable.backend.entity.Staff;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.exception.BadRequestException;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.StaffRepository;
import com.quicktable.backend.repository.UserRepository;
import com.quicktable.backend.security.JwtTokenProvider;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final DtoMapper dtoMapper;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .loyaltyPoints(0)
                .totalReservations(0)
                .completedReservations(0)
                .cancelledReservations(0)
                .totalSpent(0.0)
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(dtoMapper.toUserDTO(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // First try to find in User table
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String accessToken = jwtTokenProvider.generateToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getExpirationTime())
                    .user(dtoMapper.toUserDTO(user))
                    .build();
        }

        // If not found in User, try Staff table
        Optional<Staff> staffOpt = staffRepository.findByEmail(request.getEmail());
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            String accessToken = jwtTokenProvider.generateToken(staff);
            String refreshToken = jwtTokenProvider.generateRefreshToken(staff);

            // Create a UserDTO for staff (with staff-specific mapping)
            UserDTO staffDto = UserDTO.builder()
                    .id(staff.getId())
                    .firstName(staff.getFullName().split(" ")[0])
                    .lastName(staff.getFullName().contains(" ") ?
                            staff.getFullName().substring(staff.getFullName().indexOf(" ") + 1) : "")
                    .fullName(staff.getFullName())
                    .email(staff.getEmail())
                    .phone(staff.getPhone())
                    .role(staff.getRole())
                    .avatar(staff.getAvatar())
                    .enabled(staff.getActive())
                    .createdAt(staff.getCreatedAt())
                    .build();

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getExpirationTime())
                    .user(staffDto)
                    .build();
        }

        throw new ResourceNotFoundException("User not found");
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);

        // First try User table
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String newAccessToken = jwtTokenProvider.generateToken(user);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getExpirationTime())
                    .user(dtoMapper.toUserDTO(user))
                    .build();
        }

        // Try Staff table
        Optional<Staff> staffOpt = staffRepository.findByEmail(email);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            String newAccessToken = jwtTokenProvider.generateToken(staff);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(staff);

            UserDTO staffDto = UserDTO.builder()
                    .id(staff.getId())
                    .firstName(staff.getFullName().split(" ")[0])
                    .lastName(staff.getFullName().contains(" ") ?
                            staff.getFullName().substring(staff.getFullName().indexOf(" ") + 1) : "")
                    .fullName(staff.getFullName())
                    .email(staff.getEmail())
                    .phone(staff.getPhone())
                    .role(staff.getRole())
                    .avatar(staff.getAvatar())
                    .enabled(staff.getActive())
                    .createdAt(staff.getCreatedAt())
                    .build();

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getExpirationTime())
                    .user(staffDto)
                    .build();
        }

        throw new ResourceNotFoundException("User not found");
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Send password reset email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
    }

    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Try User table first
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return dtoMapper.toUserDTO(userOpt.get());
        }

        // Try Staff table
        Optional<Staff> staffOpt = staffRepository.findByEmail(email);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            return UserDTO.builder()
                    .id(staff.getId())
                    .firstName(staff.getFullName().split(" ")[0])
                    .lastName(staff.getFullName().contains(" ") ?
                            staff.getFullName().substring(staff.getFullName().indexOf(" ") + 1) : "")
                    .fullName(staff.getFullName())
                    .email(staff.getEmail())
                    .phone(staff.getPhone())
                    .role(staff.getRole())
                    .avatar(staff.getAvatar())
                    .enabled(staff.getActive())
                    .createdAt(staff.getCreatedAt())
                    .build();
        }

        throw new ResourceNotFoundException("User not found");
    }
}
