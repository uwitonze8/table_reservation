package com.quicktable.backend.controller;

import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.contact.ContactMessageDTO;
import com.quicktable.backend.dto.contact.CreateContactMessageRequest;
import com.quicktable.backend.service.ContactMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Public contact endpoints")
public class ContactController {

    private final ContactMessageService contactMessageService;

    @PostMapping
    @Operation(summary = "Submit a contact message")
    public ResponseEntity<ApiResponse<ContactMessageDTO>> submitContactMessage(
            @Valid @RequestBody CreateContactMessageRequest request) {
        ContactMessageDTO message = contactMessageService.createContactMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }
}
