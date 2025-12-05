package com.quicktable.backend.service;

import com.quicktable.backend.dto.auth.ChangePasswordRequest;
import com.quicktable.backend.dto.user.UpdateProfileRequest;
import com.quicktable.backend.dto.user.UserDTO;
import com.quicktable.backend.dto.common.PagedResponse;
import com.quicktable.backend.entity.LoyaltyTier;
import com.quicktable.backend.entity.Role;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.exception.BadRequestException;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.UserRepository;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DtoMapper dtoMapper;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return dtoMapper.toUserDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return dtoMapper.toUserDTO(user);
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserEntityById(userId);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getBirthday() != null) {
            user.setBirthday(request.getBirthday());
        }
        if (request.getDietaryPreferences() != null) {
            user.setDietaryPreferences(request.getDietaryPreferences());
        }
        if (request.getFavoriteTable() != null) {
            user.setFavoriteTable(request.getFavoriteTable());
        }
        if (request.getSpecialNotes() != null) {
            user.setSpecialNotes(request.getSpecialNotes());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        User savedUser = userRepository.save(user);
        return dtoMapper.toUserDTO(savedUser);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserEntityById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public PagedResponse<UserDTO> getAllCustomers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users;

        if (search != null && !search.isEmpty()) {
            users = userRepository.searchByRoleAndKeyword(Role.USER, search, pageable);
        } else {
            users = userRepository.findByRole(Role.USER, pageable);
        }

        List<UserDTO> userDTOs = users.getContent().stream()
                .map(dtoMapper::toUserDTO)
                .collect(Collectors.toList());

        return PagedResponse.of(userDTOs, page, size, users.getTotalElements());
    }

    public List<UserDTO> getAllCustomersList() {
        return userRepository.findByRole(Role.USER).stream()
                .map(dtoMapper::toUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addLoyaltyPoints(Long userId, int points) {
        User user = getUserEntityById(userId);
        user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
        updateLoyaltyTier(user);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserStats(Long userId, boolean completed, boolean cancelled) {
        User user = getUserEntityById(userId);
        user.setTotalReservations(user.getTotalReservations() + 1);

        if (completed) {
            user.setCompletedReservations(user.getCompletedReservations() + 1);
            user.setLastVisit(LocalDateTime.now());
        }
        if (cancelled) {
            user.setCancelledReservations(user.getCancelledReservations() + 1);
        }

        userRepository.save(user);
    }

    private void updateLoyaltyTier(User user) {
        int points = user.getLoyaltyPoints();
        if (points >= 1000) {
            user.setLoyaltyTier(LoyaltyTier.PLATINUM);
        } else if (points >= 500) {
            user.setLoyaltyTier(LoyaltyTier.GOLD);
        } else if (points >= 200) {
            user.setLoyaltyTier(LoyaltyTier.SILVER);
        } else {
            user.setLoyaltyTier(LoyaltyTier.BRONZE);
        }
    }

    public Long countNewCustomersToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        return userRepository.countNewUsersSince(Role.USER, startOfDay);
    }

    public Long getTotalCustomers() {
        return userRepository.countByRole(Role.USER);
    }
}
