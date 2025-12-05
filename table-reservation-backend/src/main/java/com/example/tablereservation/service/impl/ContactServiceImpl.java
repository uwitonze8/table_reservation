package com.example.tablereservation.service.impl;

import com.example.tablereservation.dto.contact.ContactMessageDto;
import com.example.tablereservation.entity.ContactMessage;
import com.example.tablereservation.repository.ContactMessageRepository;
import com.example.tablereservation.service.ContactService;
import org.springframework.stereotype.Service;

@Service
public class ContactServiceImpl implements ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactServiceImpl(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Override
    public ContactMessage saveContactMessage(ContactMessageDto contactMessageDto) {
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setFirstName(contactMessageDto.getFirstName());
        contactMessage.setLastName(contactMessageDto.getLastName());
        contactMessage.setEmail(contactMessageDto.getEmail());
        contactMessage.setMessage(contactMessageDto.getMessage());
        return contactMessageRepository.save(contactMessage);
    }
}
