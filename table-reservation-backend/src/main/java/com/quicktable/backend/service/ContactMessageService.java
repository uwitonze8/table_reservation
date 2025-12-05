package com.quicktable.backend.service;

import com.quicktable.backend.dto.contact.*;
import com.quicktable.backend.dto.common.PagedResponse;
import com.quicktable.backend.entity.ContactMessage;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.ContactMessageRepository;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;
    private final DtoMapper dtoMapper;

    @Transactional
    public ContactMessageDTO createContactMessage(CreateContactMessageRequest request) {
        ContactMessage message = ContactMessage.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .message(request.getMessage())
                .read(false)
                .replied(false)
                .build();

        ContactMessage savedMessage = contactMessageRepository.save(message);

        // Optionally send notification to admin
        emailService.sendNewContactMessageNotification(savedMessage);

        return dtoMapper.toContactMessageDTO(savedMessage);
    }

    public List<ContactMessageDTO> getAllMessages() {
        return contactMessageRepository.findAll(Sort.by("createdAt").descending()).stream()
                .map(dtoMapper::toContactMessageDTO)
                .collect(Collectors.toList());
    }

    public PagedResponse<ContactMessageDTO> getAllMessagesPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ContactMessage> messagePage = contactMessageRepository.findAll(pageable);

        List<ContactMessageDTO> dtos = messagePage.getContent().stream()
                .map(dtoMapper::toContactMessageDTO)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, page, size, messagePage.getTotalElements());
    }

    public ContactMessageDTO getMessageById(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found"));
        return dtoMapper.toContactMessageDTO(message);
    }

    public List<ContactMessageDTO> getUnreadMessages() {
        return contactMessageRepository.findByReadFalse().stream()
                .map(dtoMapper::toContactMessageDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactMessageDTO markAsRead(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found"));

        message.setRead(true);
        ContactMessage savedMessage = contactMessageRepository.save(message);
        return dtoMapper.toContactMessageDTO(savedMessage);
    }

    @Transactional
    public ContactMessageDTO replyToMessage(Long id, ReplyContactMessageRequest request) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found"));

        message.setReplied(true);
        message.setReplyMessage(request.getReplyMessage());
        message.setRepliedAt(LocalDateTime.now());
        message.setRead(true);

        ContactMessage savedMessage = contactMessageRepository.save(message);

        // Send reply email to the customer
        emailService.sendContactReply(savedMessage.getEmail(),
                savedMessage.getFirstName(),
                request.getReplyMessage());

        return dtoMapper.toContactMessageDTO(savedMessage);
    }

    @Transactional
    public void deleteMessage(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found"));
        contactMessageRepository.delete(message);
    }

    public Long getUnreadCount() {
        return contactMessageRepository.countByReadFalse();
    }
}
