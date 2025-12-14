package com.quicktable.backend.dto.reservation;

import com.quicktable.backend.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {

    private Long id;
    private String reservationCode;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer numberOfGuests;
    private String specialRequests;
    private ReservationStatus status;
    private Integer loyaltyPointsEarned;
    private Long tableId;
    private String tableName;
    private Integer tableNumber;
    private String tableLocation;
    private String preOrderData;
    private String dietaryNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
