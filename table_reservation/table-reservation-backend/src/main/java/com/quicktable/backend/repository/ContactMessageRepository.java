package com.quicktable.backend.repository;

import com.quicktable.backend.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findByReadFalse();

    Page<ContactMessage> findByReadFalse(Pageable pageable);

    List<ContactMessage> findByRepliedFalse();

    Page<ContactMessage> findByRepliedFalse(Pageable pageable);

    Long countByReadFalse();

    Long countByRepliedFalse();
}
