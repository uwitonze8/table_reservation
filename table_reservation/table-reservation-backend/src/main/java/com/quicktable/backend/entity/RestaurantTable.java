package com.quicktable.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableLocation location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableShape shape;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status = TableStatus.AVAILABLE;

    // Position for visual floor plan
    private Double positionX;
    private Double positionY;

    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "table", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public String getTableName() {
        return "Table " + tableNumber + " (" + location.name().toLowerCase() + ")";
    }
}
