package com.example.tablereservation.repository;

import com.example.tablereservation.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);
    Optional<Staff> findByEmail(String email);
}