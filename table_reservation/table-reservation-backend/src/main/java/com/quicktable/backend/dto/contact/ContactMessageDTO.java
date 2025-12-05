package com.quicktable.backend.dto.contact;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String message;
    private Boolean read;
    private Boolean replied;
    private String replyMessage;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
}
