package com.example.tablereservation.service.impl;

import com.example.tablereservation.dto.auth.LoginRequest;
import com.example.tablereservation.dto.auth.LoginResponse;
import com.example.tablereservation.dto.auth.RegisterRequest;
import com.example.tablereservation.dto.user.UserProfileDto;
import com.example.tablereservation.entity.Role;
import com.example.tablereservation.entity.User;
import com.example.tablereservation.exception.BadRequestException;
import com.example.tablereservation.exception.ResourceNotFoundException;
import com.example.tablereservation.repository.RoleRepository;
import com.example.tablereservation.repository.UserRepository;
import com.example.tablereservation.security.JwtProvider;
import com.example.tablereservation.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.Collections;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @Override
    @Transactional
    public User register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use.");
        }

        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        Role userRole = roleRepository.findByName(Role.RoleName.USER)
                .orElseThrow(() -> new BadRequestException("Role not found"));
        user.setRoles(Collections.singleton(userRole));

        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // Get user's primary role
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("USER");

        String token = jwtProvider.generateToken(user.getEmail(), role);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());

        return response;
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        // In a real implementation, you would send a password reset email here
        // For now, this is a placeholder
    }

    @Override
    public UserProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileDto profile = new UserProfileDto();
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setBirthday(user.getBirthday());
        profile.setDietaryPreferences(user.getDietaryPreferences());
        profile.setSpecialNotes(user.getSpecialNotes());

        return profile;
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(String email, UserProfileDto profileDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(profileDto.getFirstName());
        user.setLastName(profileDto.getLastName());
        user.setPhone(profileDto.getPhone());
        user.setBirthday(profileDto.getBirthday());
        user.setDietaryPreferences(profileDto.getDietaryPreferences());
        user.setSpecialNotes(profileDto.getSpecialNotes());

        userRepository.save(user);

        return profileDto;
    }
}
