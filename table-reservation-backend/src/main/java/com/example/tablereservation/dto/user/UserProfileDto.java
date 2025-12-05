package com.example.tablereservation.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String birthday;
    private String dietaryPreferences;
    private String specialNotes;
}