package com.quicktable.backend.config;

import com.quicktable.backend.entity.*;
import com.quicktable.backend.repository.MenuItemRepository;
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
    private final MenuItemRepository menuItemRepository;
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

            // Initialize Rwandan menu items if not exist
            if (menuItemRepository.count() == 0) {
                initializeRwandanMenuItems();
                log.info("Rwandan menu items initialized");
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

    private void initializeRwandanMenuItems() {
        List<MenuItem> menuItems = Arrays.asList(
                // ==================== DRINKS ====================

                // Traditional Drinks
                createMenuItem(MenuItemType.DRINK, "Traditional Drinks", "Ikivuguto", "Traditional fermented milk, creamy and refreshing", 1),
                createMenuItem(MenuItemType.DRINK, "Traditional Drinks", "Urwagwa", "Traditional banana beer, mildly sweet", 2),
                createMenuItem(MenuItemType.DRINK, "Traditional Drinks", "Ikigage", "Traditional sorghum beer", 3),
                createMenuItem(MenuItemType.DRINK, "Traditional Drinks", "Ubuki", "Natural honey drink", 4),

                // Hot Beverages
                createMenuItem(MenuItemType.DRINK, "Hot Beverages", "Rwandan Coffee", "Premium single-origin Rwandan coffee", 1),
                createMenuItem(MenuItemType.DRINK, "Hot Beverages", "Rwandan Tea", "Fresh Rwandan highland tea", 2),
                createMenuItem(MenuItemType.DRINK, "Hot Beverages", "Icyayi cy'Inyanya", "Ginger tea with lemon", 3),
                createMenuItem(MenuItemType.DRINK, "Hot Beverages", "Ikawa n'Amata", "Coffee with milk", 4),

                // Soft Drinks
                createMenuItem(MenuItemType.DRINK, "Soft Drinks", "Fanta Citron", "Lemon Fanta, local favorite", 1),
                createMenuItem(MenuItemType.DRINK, "Soft Drinks", "Coca Cola", "Classic Coca Cola", 2),
                createMenuItem(MenuItemType.DRINK, "Soft Drinks", "Sprite", "Refreshing lemon-lime soda", 3),
                createMenuItem(MenuItemType.DRINK, "Soft Drinks", "Amazi", "Bottled water", 4),

                // Fresh Juices
                createMenuItem(MenuItemType.DRINK, "Fresh Juices", "Umutobe w'Icunga", "Fresh passion fruit juice", 1),
                createMenuItem(MenuItemType.DRINK, "Fresh Juices", "Umutobe w'Inanasi", "Fresh pineapple juice", 2),
                createMenuItem(MenuItemType.DRINK, "Fresh Juices", "Umutobe w'Imyembe", "Fresh mango juice", 3),
                createMenuItem(MenuItemType.DRINK, "Fresh Juices", "Umutobe w'Amashu", "Fresh tree tomato juice", 4),

                // Beers
                createMenuItem(MenuItemType.DRINK, "Beers", "Primus", "Rwanda's most popular lager", 1),
                createMenuItem(MenuItemType.DRINK, "Beers", "Mutzig", "Premium Rwandan beer", 2),
                createMenuItem(MenuItemType.DRINK, "Beers", "Skol", "Light refreshing beer", 3),
                createMenuItem(MenuItemType.DRINK, "Beers", "Turbo King", "Strong lager beer", 4),

                // ==================== FOOD ====================

                // Main Dishes
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Isombe", "Cassava leaves cooked with palm oil and groundnuts", 1),
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Ubugali", "Traditional cassava flour paste, served with sauce", 2),
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Brochettes", "Grilled meat skewers with spices", 3),
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Tilapia ya Kivu", "Fresh grilled tilapia from Lake Kivu", 4),
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Inyama y'Inka", "Grilled beef with traditional spices", 5),
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Inkoko", "Roasted chicken with herbs", 6),
                createMenuItem(MenuItemType.FOOD, "Main Dishes", "Isambaza", "Fried small fish from Lake Kivu", 7),

                // Side Dishes
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Ibitoke", "Cooked plantains", 1),
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Mizuzu", "Fried ripe plantains", 2),
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Ibirayi", "Roasted or fried potatoes", 3),
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Ibiharage", "Cooked beans with onions", 4),
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Agatogo", "Plantains cooked with vegetables", 5),
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Ibihaza", "Cooked pumpkin", 6),
                createMenuItem(MenuItemType.FOOD, "Side Dishes", "Umuceri", "Steamed rice", 7),

                // Vegetarian
                createMenuItem(MenuItemType.FOOD, "Vegetarian", "Imboga n'Ibiharage", "Mixed vegetables with beans", 1),
                createMenuItem(MenuItemType.FOOD, "Vegetarian", "Isombe Vegetarian", "Cassava leaves without meat", 2),
                createMenuItem(MenuItemType.FOOD, "Vegetarian", "Saladi", "Fresh garden salad", 3),
                createMenuItem(MenuItemType.FOOD, "Vegetarian", "Ibishyimbo", "Cooked peas with vegetables", 4),

                // Appetizers
                createMenuItem(MenuItemType.FOOD, "Appetizers", "Sambaza Crispy", "Crispy fried small fish", 1),
                createMenuItem(MenuItemType.FOOD, "Appetizers", "Chips Mayai", "French fries with egg omelette", 2),
                createMenuItem(MenuItemType.FOOD, "Appetizers", "Amandazi", "Rwandan fried doughnuts", 3),
                createMenuItem(MenuItemType.FOOD, "Appetizers", "Chapati", "Flatbread with dipping sauce", 4),

                // Desserts
                createMenuItem(MenuItemType.FOOD, "Desserts", "Imineke", "Fresh ripe bananas", 1),
                createMenuItem(MenuItemType.FOOD, "Desserts", "Imyembe", "Fresh mango slices", 2),
                createMenuItem(MenuItemType.FOOD, "Desserts", "Papaya Fresh", "Fresh papaya with lime", 3),
                createMenuItem(MenuItemType.FOOD, "Desserts", "Avoka n'Isukaari", "Avocado with sugar", 4)
        );

        menuItemRepository.saveAll(menuItems);
    }

    private MenuItem createMenuItem(MenuItemType type, String category, String name,
                                    String description, int sortOrder) {
        return MenuItem.builder()
                .type(type)
                .category(category)
                .name(name)
                .description(description)
                .available(true)
                .sortOrder(sortOrder)
                .build();
    }
}
