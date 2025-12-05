package com.example.tablereservation.dto.table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableDto {
    private Long id;
    private String tableNumber;
    private int capacity;
    private String location; // e.g., window, center, patio, bar, private
    private String shape; // e.g., circle, rectangle, square
}