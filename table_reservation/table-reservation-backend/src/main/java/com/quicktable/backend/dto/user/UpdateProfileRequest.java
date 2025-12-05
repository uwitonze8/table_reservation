package com.quicktable.backend.dto.user;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private LocalDate birthday;
    private String dietaryPreferences;
    private String favoriteTable;
    private String specialNotes;
    private String avatar;
}
