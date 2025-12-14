package com.quicktable.backend.config;

import com.quicktable.backend.entity.*;
import com.quicktable.backend.repository.RestaurantTableRepository;
import com.quicktable.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataInitializer {

    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Create admin user if not exists
            if (!userRepository.existsByEmail("admin@quicktable.com")) {
                User admin = User.builder()
                        .firstName("Admin")
                        .lastName("User")
                        .email("admin@quicktable.com")
                        .phone("555-0100")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .enabled(true)
                        .loyaltyPoints(0)
                        .totalReservations(0)
                        .completedReservations(0)
                        .cancelledReservations(0)
                        .totalSpent(0.0)
                        .build();
                userRepository.save(admin);
                log.info("Admin user created: admin@quicktable.com / admin123");
            }

            // Create waiter user if not exists
            if (!userRepository.existsByEmail("waiter@quicktable.com")) {
                User waiter = User.builder()
                        .firstName("John")
                        .lastName("Waiter")
                        .email("waiter@quicktable.com")
                        .phone("555-0101")
                        .password(passwordEncoder.encode("waiter123"))
                        .role(Role.WAITER)
                        .enabled(true)
                        .loyaltyPoints(0)
                        .totalReservations(0)
                        .completedReservations(0)
                        .cancelledReservations(0)
                        .totalSpent(0.0)
                        .build();
                userRepository.save(waiter);
                log.info("Waiter user created: waiter@quicktable.com / waiter123");
            }

            // Create sample customer if not exists
            if (!userRepository.existsByEmail("customer@example.com")) {
                User customer = User.builder()
                        .firstName("Jane")
                        .lastName("Doe")
                        .email("customer@example.com")
                        .phone("555-0102")
                        .password(passwordEncoder.encode("customer123"))
                        .role(Role.USER)
                        .enabled(true)
                        .loyaltyPoints(100)
                        .loyaltyTier(LoyaltyTier.BRONZE)
                        .totalReservations(5)
                        .completedReservations(4)
                        .cancelledReservations(1)
                        .totalSpent(250.0)
                        .build();
                userRepository.save(customer);
                log.info("Sample customer created: customer@example.com / customer123");
            }

            // Initialize tables if not exist
            if (tableRepository.count() == 0) {
                initializeTables();
                log.info("Restaurant tables initialized");
            }
        };
    }

    private void initializeTables() {
        List<RestaurantTable> tables = Arrays.asList(
                // Window tables
                createTable(1, 2, TableLocation.WINDOW, TableShape.SQUARE, 50.0, 100.0),
                createTable(2, 2, TableLocation.WINDOW, TableShape.SQUARE, 50.0, 200.0),
                createTable(3, 4, TableLocation.WINDOW, TableShape.RECTANGLE, 50.0, 300.0),
                createTable(4, 4, TableLocation.WINDOW, TableShape.RECTANGLE, 50.0, 400.0),

                // Center tables
                createTable(5, 4, TableLocation.CENTER, TableShape.SQUARE, 200.0, 150.0),
                createTable(6, 6, TableLocation.CENTER, TableShape.ROUND, 200.0, 250.0),
                createTable(7, 4, TableLocation.CENTER, TableShape.SQUARE, 200.0, 350.0),
                createTable(8, 2, TableLocation.CENTER, TableShape.SQUARE, 300.0, 150.0),
                createTable(9, 4, TableLocation.CENTER, TableShape.RECTANGLE, 300.0, 250.0),
                createTable(10, 6, TableLocation.CENTER, TableShape.ROUND, 300.0, 350.0),
                createTable(11, 2, TableLocation.CENTER, TableShape.SQUARE, 400.0, 200.0),

                // Window side 2
                createTable(12, 2, TableLocation.WINDOW, TableShape.SQUARE, 450.0, 100.0),
                createTable(13, 4, TableLocation.WINDOW, TableShape.RECTANGLE, 450.0, 200.0),
                createTable(14, 2, TableLocation.WINDOW, TableShape.SQUARE, 450.0, 300.0),
                createTable(15, 4, TableLocation.WINDOW, TableShape.RECTANGLE, 450.0, 400.0),

                // Patio tables
                createTable(16, 4, TableLocation.PATIO, TableShape.ROUND, 550.0, 100.0),
                createTable(17, 4, TableLocation.PATIO, TableShape.ROUND, 550.0, 200.0),
                createTable(18, 6, TableLocation.PATIO, TableShape.RECTANGLE, 550.0, 300.0),

                // Bar tables
                createTable(19, 2, TableLocation.BAR, TableShape.SQUARE, 100.0, 50.0),
                createTable(20, 2, TableLocation.BAR, TableShape.SQUARE, 200.0, 50.0)
        );

        tableRepository.saveAll(tables);
    }

    private RestaurantTable createTable(int number, int capacity, TableLocation location,
                                         TableShape shape, double x, double y) {
        return RestaurantTable.builder()
                .tableNumber(number)
                .capacity(capacity)
                .location(location)
                .shape(shape)
                .status(TableStatus.AVAILABLE)
                .positionX(x)
                .positionY(y)
                .build();
    }
}
