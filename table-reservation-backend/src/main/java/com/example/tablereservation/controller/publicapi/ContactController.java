package com.example.tablereservation.controller.publicapi;

import com.example.tablereservation.dto.contact.ContactMessageDto;
import com.example.tablereservation.entity.ContactMessage;
import com.example.tablereservation.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<ContactMessage> sendContactMessage(@Valid @RequestBody ContactMessageDto contactMessageDto) {
        ContactMessage contactMessage = contactService.saveContactMessage(contactMessageDto);
        return ResponseEntity.ok(contactMessage);
    }
}