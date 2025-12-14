package com.example.tablereservation.service;

import com.example.tablereservation.dto.contact.ContactMessageDto;
import com.example.tablereservation.entity.ContactMessage;

public interface ContactService {
    ContactMessage saveContactMessage(ContactMessageDto contactMessageDto);
}
