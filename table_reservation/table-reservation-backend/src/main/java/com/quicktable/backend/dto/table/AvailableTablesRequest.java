package com.quicktable.backend.dto.table;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableTablesRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    private Integer guests;
}
