package com.quicktable.backend.dto.user;

import com.quicktable.backend.entity.LoyaltyTier;
import com.quicktable.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private LocalDate birthday;
    private String dietaryPreferences;
    private String favoriteTable;
    private String specialNotes;
    private String avatar;
    private Boolean enabled;
    private Integer loyaltyPoints;
    private LoyaltyTier loyaltyTier;
    private Integer totalReservations;
    private Integer completedReservations;
    private Integer cancelledReservations;
    private Double totalSpent;
    private LocalDateTime lastVisit;
    private LocalDateTime createdAt;
}
