package com.quicktable.backend.dto.reservation;

import com.quicktable.backend.entity.ReservationStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReservationRequest {

    private String customerName;

    @Email(message = "Invalid email format")
    private String customerEmail;

    private String customerPhone;

    @FutureOrPresent(message = "Reservation date must be today or in the future")
    private LocalDate reservationDate;

    private LocalTime reservationTime;

    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 20, message = "Maximum 20 guests allowed")
    private Integer numberOfGuests;

    private Long tableId;

    @Size(max = 1000, message = "Special requests must be less than 1000 characters")
    private String specialRequests;

    private ReservationStatus status;

    private String cancellationReason;
}
