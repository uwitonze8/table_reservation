package com.quicktable.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 2000)
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private Boolean read = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean replied = false;

    private String replyMessage;

    private LocalDateTime repliedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
