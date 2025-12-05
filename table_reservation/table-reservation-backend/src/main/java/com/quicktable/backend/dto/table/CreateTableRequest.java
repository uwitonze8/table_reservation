package com.quicktable.backend.dto.table;

import com.quicktable.backend.entity.TableLocation;
import com.quicktable.backend.entity.TableShape;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTableRequest {

    @NotNull(message = "Table number is required")
    @Min(value = 1, message = "Table number must be at least 1")
    private Integer tableNumber;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Location is required")
    private TableLocation location;

    @NotNull(message = "Shape is required")
    private TableShape shape;

    private Double positionX;
    private Double positionY;
    private String description;
}
