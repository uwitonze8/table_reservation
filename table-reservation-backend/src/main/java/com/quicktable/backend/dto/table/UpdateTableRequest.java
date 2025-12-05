package com.quicktable.backend.dto.table;

import com.quicktable.backend.entity.TableLocation;
import com.quicktable.backend.entity.TableShape;
import com.quicktable.backend.entity.TableStatus;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTableRequest {

    @Min(value = 1, message = "Table number must be at least 1")
    private Integer tableNumber;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private TableLocation location;
    private TableShape shape;
    private TableStatus status;
    private Double positionX;
    private Double positionY;
    private String description;
}
