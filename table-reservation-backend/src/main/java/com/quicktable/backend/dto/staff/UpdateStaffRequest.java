package com.quicktable.backend.dto.staff;

import com.quicktable.backend.entity.Role;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStaffRequest {

    private String fullName;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private Role role;
    private Boolean active;
    private String avatar;
}
