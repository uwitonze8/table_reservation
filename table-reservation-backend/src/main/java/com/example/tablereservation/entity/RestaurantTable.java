package com.example.tablereservation.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "restaurant_tables")
@Data
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", nullable = false, unique = true)
    private String tableNumber;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "shape", nullable = false)
    private String shape;

    // Additional fields can be added as needed
}