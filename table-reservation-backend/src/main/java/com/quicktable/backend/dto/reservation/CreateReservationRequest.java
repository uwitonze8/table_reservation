package com.quicktable.backend.dto.reservation;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    @NotNull(message = "Reservation date is required")
    @FutureOrPresent(message = "Reservation date must be today or in the future")
    private LocalDate reservationDate;

    @NotNull(message = "Reservation time is required")
    private LocalTime reservationTime;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 20, message = "Maximum 20 guests allowed")
    private Integer numberOfGuests;

    @NotNull(message = "Table ID is required")
    private Long tableId;

    @Size(max = 1000, message = "Special requests must be less than 1000 characters")
    private String specialRequests;

    @Size(max = 2000, message = "Pre-order data must be less than 2000 characters")
    private String preOrderData;

    @Size(max = 500, message = "Dietary notes must be less than 500 characters")
    private String dietaryNotes;
}
