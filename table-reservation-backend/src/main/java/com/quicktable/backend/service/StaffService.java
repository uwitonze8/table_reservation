package com.quicktable.backend.service;

import com.quicktable.backend.dto.staff.*;
import com.quicktable.backend.dto.common.PagedResponse;
import com.quicktable.backend.entity.Role;
import com.quicktable.backend.entity.Staff;
import com.quicktable.backend.exception.BadRequestException;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.StaffRepository;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final DtoMapper dtoMapper;

    public List<StaffDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(dtoMapper::toStaffDTO)
                .collect(Collectors.toList());
    }

    public PagedResponse<StaffDTO> getAllStaffPaged(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Staff> staffPage;

        if (search != null && !search.isEmpty()) {
            staffPage = staffRepository.searchStaff(search, pageable);
        } else {
            staffPage = staffRepository.findAll(pageable);
        }

        List<StaffDTO> dtos = staffPage.getContent().stream()
                .map(dtoMapper::toStaffDTO)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, page, size, staffPage.getTotalElements());
    }

    public StaffDTO getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        return dtoMapper.toStaffDTO(staff);
    }

    public StaffDTO getStaffByEmail(String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        return dtoMapper.toStaffDTO(staff);
    }

    public List<StaffDTO> getStaffByRole(Role role) {
        return staffRepository.findByRole(role).stream()
                .map(dtoMapper::toStaffDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffDTO createStaff(CreateStaffRequest request) {
        if (staffRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Validate role - only WAITER, MANAGER, HOST allowed
        if (request.getRole() == Role.USER || request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Invalid staff role. Use WAITER, MANAGER, or HOST");
        }

        Staff staff = Staff.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .avatar(request.getAvatar())
                .build();

        Staff savedStaff = staffRepository.save(staff);
        return dtoMapper.toStaffDTO(savedStaff);
    }

    @Transactional
    public StaffDTO updateStaff(Long id, UpdateStaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        if (request.getFullName() != null) {
            staff.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(staff.getEmail())) {
            if (staffRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            staff.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            staff.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            if (request.getRole() == Role.USER || request.getRole() == Role.ADMIN) {
                throw new BadRequestException("Invalid staff role");
            }
            staff.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            staff.setActive(request.getActive());
        }
        if (request.getAvatar() != null) {
            staff.setAvatar(request.getAvatar());
        }

        Staff savedStaff = staffRepository.save(staff);
        return dtoMapper.toStaffDTO(savedStaff);
    }

    @Transactional
    public void deleteStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        staffRepository.delete(staff);
    }

    @Transactional
    public StaffDTO toggleStaffStatus(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        staff.setActive(!staff.getActive());
        Staff savedStaff = staffRepository.save(staff);
        return dtoMapper.toStaffDTO(savedStaff);
    }
}
