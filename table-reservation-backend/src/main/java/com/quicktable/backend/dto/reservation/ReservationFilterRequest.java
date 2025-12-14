package com.quicktable.backend.dto.reservation;

import com.quicktable.backend.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationFilterRequest {

    private LocalDate startDate;
    private LocalDate endDate;
    private ReservationStatus status;
    private Long userId;
    private Long tableId;
    private String search;
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}
