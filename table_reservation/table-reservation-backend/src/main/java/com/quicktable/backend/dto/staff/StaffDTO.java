package com.quicktable.backend.dto.staff;

import com.quicktable.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDTO {

    private Long id;
    private String staffId;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Boolean active;
    private String avatar;
    private LocalDateTime createdAt;
}
