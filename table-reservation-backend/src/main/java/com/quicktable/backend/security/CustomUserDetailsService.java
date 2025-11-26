package com.quicktable.backend.security;

import com.quicktable.backend.entity.Staff;
import com.quicktable.backend.entity.User;
import com.quicktable.backend.repository.StaffRepository;
import com.quicktable.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // First try to find in User table
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get();
        }

        // If not found, try Staff table
        Optional<Staff> staff = staffRepository.findByEmail(email);
        if (staff.isPresent()) {
            return staff.get();
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }
}
