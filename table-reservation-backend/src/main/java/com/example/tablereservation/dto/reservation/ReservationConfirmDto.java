package com.example.tablereservation.dto.reservation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationConfirmDto {
    private Long reservationId;
    private String fullName;
    private String email;
    private String phone;
    private int numberOfGuests;
    private String reservationDate;
    private String reservationTime;
    private String specialRequests;
}