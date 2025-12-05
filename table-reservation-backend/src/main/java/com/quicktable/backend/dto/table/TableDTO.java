package com.quicktable.backend.dto.table;

import com.quicktable.backend.entity.TableLocation;
import com.quicktable.backend.entity.TableShape;
import com.quicktable.backend.entity.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableDTO {

    private Long id;
    private Integer tableNumber;
    private Integer capacity;
    private TableLocation location;
    private TableShape shape;
    private TableStatus status;
    private Double positionX;
    private Double positionY;
    private String description;
    private String tableName;
    private LocalDateTime createdAt;
}
