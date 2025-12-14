package com.quicktable.backend.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplyContactMessageRequest {

    @NotBlank(message = "Reply message is required")
    @Size(max = 2000, message = "Reply must be less than 2000 characters")
    private String replyMessage;
}
