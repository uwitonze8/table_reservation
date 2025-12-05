package com.example.tablereservation.service;

import com.example.tablereservation.dto.auth.LoginRequest;
import com.example.tablereservation.dto.auth.LoginResponse;
import com.example.tablereservation.dto.auth.RegisterRequest;
import com.example.tablereservation.dto.user.UserProfileDto;
import com.example.tablereservation.entity.User;

public interface AuthService {
    User register(RegisterRequest registerRequest);
    LoginResponse login(LoginRequest loginRequest);
    void forgotPassword(String email);
    UserProfileDto getUserProfile(String email);
    UserProfileDto updateUserProfile(String email, UserProfileDto profileDto);
}
