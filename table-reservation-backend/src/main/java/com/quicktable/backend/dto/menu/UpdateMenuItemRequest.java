package com.quicktable.backend.dto.menu;

import com.quicktable.backend.entity.MenuItemType;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateMenuItemRequest {

    private MenuItemType type;

    @Size(max = 100, message = "Category must be less than 100 characters")
    private String category;

    @Size(max = 200, message = "Name must be less than 200 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private BigDecimal price;

    private Boolean available;

    private Integer sortOrder;
}
