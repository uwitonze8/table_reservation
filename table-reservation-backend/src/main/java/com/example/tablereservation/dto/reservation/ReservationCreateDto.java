package com.example.tablereservation.dto.reservation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class ReservationCreateDto {

    @NotNull(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Email is required")
    private String email;

    @NotNull(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Number of guests is required")
    private Integer numberOfGuests;

    @NotNull(message = "Reservation date is required")
    private LocalDateTime reservationDateTime;

    @Size(max = 255, message = "Special requests cannot exceed 255 characters")
    private String specialRequests;

    // Getters and Setters

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }

    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }

    public LocalDateTime getReservationDateTime() {
        return reservationDateTime;
    }

    public void setReservationDateTime(LocalDateTime reservationDateTime) {
        this.reservationDateTime = reservationDateTime;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
}