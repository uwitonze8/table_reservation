package com.quicktable.backend.repository;

import com.quicktable.backend.entity.Role;
import com.quicktable.backend.entity.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByEmail(String email);

    Optional<Staff> findByStaffId(String staffId);

    boolean existsByEmail(String email);

    List<Staff> findByRole(Role role);

    List<Staff> findByActive(Boolean active);

    Page<Staff> findByActive(Boolean active, Pageable pageable);

    @Query("SELECT s FROM Staff s WHERE " +
            "(LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Staff> searchStaff(@Param("search") String search, Pageable pageable);
}
